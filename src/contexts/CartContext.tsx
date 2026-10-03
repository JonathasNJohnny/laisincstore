import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CartContextType, CartItem, Product } from "../types";
import { useAuth } from "./AuthContext";
import {
  addCartItem,
  getCart,
  getImageUrl,
  getProducts,
  removeCartItem,
  updateCartItem,
  type ApiProduct,
} from "../services/api";
import { AUTH_TOKEN_KEY } from "../services/users";
import { slugify } from "../utils/slugify";

const CART_STORAGE_KEY = "laisinc-cart";
const CartContext = createContext<CartContextType | null>(null);

function restoreStoredCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function makeCartProduct(item: { productId: number | string; name: string; price: string | number; stock: number }, products: Product[]): Product {
  const existing = products.find((product) => product.id === String(item.productId));
  const price = Math.round(Number(item.price) * 100);
  return {
    id: String(item.productId),
    slug: existing?.slug ?? slugify(item.name),
    name: item.name,
    category: existing?.category ?? "Produto",
    description: existing?.description ?? "",
    price: Number.isFinite(price) ? price : 0,
    oldPrice: existing?.oldPrice,
    image: existing?.image ?? "/imagem-padrao.png",
    images: existing?.images,
    stock: Number(item.stock),
  };
}

function normalizeCatalogProduct(apiProduct: ApiProduct): Product {
  const originalPrice = Number(apiProduct.price ?? 0);
  const sale = Math.max(0, Number(apiProduct.sale ?? 0));
  const returnedFinalPrice = Number(
    apiProduct.final_price ?? apiProduct.finalPrice,
  );
  const finalPrice = Number.isFinite(returnedFinalPrice)
    ? Math.max(0, returnedFinalPrice)
    : Math.max(0, originalPrice - sale);
  const originalPriceInCents = Math.round(originalPrice * 100);
  const finalPriceInCents = Math.round(finalPrice * 100);
  const upload = apiProduct.uploads?.slice().sort(
    (first, second) => (first.position ?? 0) - (second.position ?? 0),
  )[0];

  return {
    id: String(apiProduct.id),
    slug: apiProduct.slug ?? slugify(apiProduct.name),
    name: apiProduct.name,
    variant: apiProduct.variant,
    category: apiProduct.category ?? "Produto",
    description: apiProduct.description ?? "",
    price: finalPriceInCents,
    oldPrice:
      finalPriceInCents < originalPriceInCents ? originalPriceInCents : undefined,
    image: getImageUrl(upload?.url ?? apiProduct.image_url),
    images: apiProduct.uploads?.map((item) => getImageUrl(item.url)),
    stock: Number(apiProduct.stock ?? 0),
  };
}

async function loadCurrentProducts() {
  const products = await getProducts();
  return new Map(products.map((product) => {
    const normalized = normalizeCatalogProduct(product);
    return [normalized.id, normalized] as const;
  }));
}

function toApiProductId(productId: string | number): string | number {
  const numericId = Number(productId);
  return Number.isInteger(numericId) ? numericId : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(restoreStoredCart);
  const [isOpen, setIsOpen] = useState(false);
  const sessionToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const hasAuthenticatedSession = Boolean(sessionToken);
  const migratedTokenRef = useRef<string | null>(null);
  const pendingLocalItemsRef = useRef(items);
  const knownProductsRef = useRef(new Map<string, Product>(items.map((item) => [item.product.id, item.product])));

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return;
    const [{ cart }, currentProducts] = await Promise.all([
      getCart(),
      loadCurrentProducts(),
    ]);
    const products = Array.from(knownProductsRef.current.values());
    setItems(cart.items.map((item) => ({
      product:
        currentProducts.get(String(item.productId)) ??
        makeCartProduct(item, products),
      quantity: Number(item.quantity),
    })));
  }, []);

  useEffect(() => {
    if (!hasAuthenticatedSession || !sessionToken) return;

    const synchronizeCart = async () => {
      if (migratedTokenRef.current === sessionToken) return;
      // Marca antes das chamadas assíncronas para evitar duplicação no StrictMode.
      migratedTokenRef.current = sessionToken;
      const { cart } = await getCart();
      // Migra uma cesta local antiga apenas quando o carrinho do usuário ainda está vazio.
      if (cart.items.length === 0 && pendingLocalItemsRef.current.length > 0) {
        await Promise.all(pendingLocalItemsRef.current.map((item) => addCartItem(toApiProductId(item.product.id), item.quantity)));
      }
      await refreshCart();
    };

    synchronizeCart().catch((error) => {
      migratedTokenRef.current = null;
      console.error("Não foi possível carregar o carrinho:", error);
    });
  }, [hasAuthenticatedSession, refreshCart, sessionToken, user]);

  useEffect(() => {
    if (hasAuthenticatedSession) return;

    loadCurrentProducts()
      .then((currentProducts) => {
        setItems((previous) => previous.map((item) => ({
          ...item,
          product: currentProducts.get(item.product.id) ?? item.product,
        })));
      })
      .catch((error) => {
        console.error("Não foi possível atualizar os preços do carrinho:", error);
      });
  }, [hasAuthenticatedSession]);

  useEffect(() => {
    if (!hasAuthenticatedSession) pendingLocalItemsRef.current = items;
  }, [hasAuthenticatedSession, items]);

  useEffect(() => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); }
    catch (error) { console.error("Failed to save cart to localStorage:", error); }
  }, [items]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (!hasAuthenticatedSession) {
      setItems((previous) => {
        const existing = previous.find((item) => item.product.id === product.id);
        if (existing) return previous.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item);
        return quantity <= product.stock ? [...previous, { product, quantity }] : previous;
      });
      setIsOpen(true);
      return;
    }
    knownProductsRef.current.set(product.id, product);
    await addCartItem(toApiProductId(product.id), quantity);
    setItems((previous) => {
      const existing = previous.find((item) => item.product.id === product.id);
      if (existing) return previous.map((item) => item.product.id === product.id
        ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.stock) } : item);
      return [...previous, { product, quantity }];
    });
    setIsOpen(true);
  }, [hasAuthenticatedSession]);

  const removeItem = useCallback(async (productId: string) => {
    if (!hasAuthenticatedSession) { setItems((previous) => previous.filter((item) => item.product.id !== productId)); return; }
    await removeCartItem(productId);
    setItems((previous) => previous.filter((item) => item.product.id !== productId));
    await refreshCart();
  }, [hasAuthenticatedSession, refreshCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    if (!hasAuthenticatedSession) {
      setItems((previous) => previous.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item));
      return;
    }
    await updateCartItem(productId, quantity);
    setItems((previous) => previous.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  }, [hasAuthenticatedSession, removeItem]);

  const clearCart = useCallback(async (synchronizeServer = true) => {
    if (hasAuthenticatedSession && synchronizeServer) await Promise.allSettled(items.map((item) => removeCartItem(item.product.id)));
    setItems([]);
  }, [hasAuthenticatedSession, items]);

  const toggleCart = useCallback(() => setIsOpen((previous) => !previous), []);
  const getSubtotal = useCallback(() => items.reduce((total, item) => total + item.product.price * item.quantity, 0), [items]);
  const getTotal = useCallback(() => getSubtotal(), [getSubtotal]);
  const getItemCount = useCallback(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const isInCart = useCallback((productId: string) => items.some((item) => item.product.id === productId), [items]);
  const getItemQuantity = useCallback((productId: string) => items.find((item) => item.product.id === productId)?.quantity ?? 0, [items]);

  return <CartContext.Provider value={{ items, isOpen, addItem, removeItem, updateQuantity, clearCart, toggleCart, getSubtotal, getTotal, getItemCount, isInCart, getItemQuantity }}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
