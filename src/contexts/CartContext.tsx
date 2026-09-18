import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CartContextType, CartItem, Product } from "../types";
import { useAuth } from "./AuthContext";
import { addCartItem, getCart, getProducts, removeCartItem, updateCartItem } from "../services/api";
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
    image: existing?.image ?? "/imagem-padrao.png",
    images: existing?.images,
    stock: Number(item.stock),
  };
}

function toApiProductId(productId: string | number): string | number {
  const numericId = Number(productId);
  return Number.isInteger(numericId) ? numericId : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(restoreStoredCart);
  const [isOpen, setIsOpen] = useState(false);
  const hasAuthenticatedSession = Boolean(user || localStorage.getItem(AUTH_TOKEN_KEY));
  const migratedTokenRef = useRef<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return;
    const [{ cart }, apiProducts] = await Promise.all([getCart(), getProducts().catch(() => [])]);
    const products: Product[] = apiProducts.map((product) => ({
      id: String(product.id), slug: product.slug ?? slugify(product.name), name: product.name,
      category: product.category ?? "Produto", description: product.description ?? "",
      price: Math.round(Number(product.price) * 100), image: product.image_url ?? "/imagem-padrao.png",
      stock: Number(product.stock ?? 0),
    }));
    setItems(cart.items.map((item) => ({ product: makeCartProduct(item, products), quantity: Number(item.quantity) })));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!hasAuthenticatedSession || !token) return;

    const synchronizeCart = async () => {
      if (migratedTokenRef.current === token) {
        await refreshCart();
        return;
      }
      // Marca antes das chamadas assíncronas para evitar duplicação no StrictMode.
      migratedTokenRef.current = token;
      const { cart } = await getCart();
      // Migra uma cesta local antiga apenas quando o carrinho do usuário ainda está vazio.
      if (cart.items.length === 0 && items.length > 0) {
        await Promise.all(items.map((item) => addCartItem(toApiProductId(item.product.id), item.quantity)));
      }
      await refreshCart();
    };

    synchronizeCart().catch((error) => {
      migratedTokenRef.current = null;
      console.error("Não foi possível carregar o carrinho:", error);
    });
  }, [hasAuthenticatedSession, items, refreshCart]);

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
    await addCartItem(toApiProductId(product.id), quantity);
    await refreshCart();
    setIsOpen(true);
  }, [hasAuthenticatedSession, refreshCart]);

  const removeItem = useCallback(async (productId: string) => {
    if (!hasAuthenticatedSession) { setItems((previous) => previous.filter((item) => item.product.id !== productId)); return; }
    await removeCartItem(productId);
    await refreshCart();
  }, [hasAuthenticatedSession, refreshCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    if (!hasAuthenticatedSession) {
      setItems((previous) => previous.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item));
      return;
    }
    await updateCartItem(productId, quantity);
    await refreshCart();
  }, [hasAuthenticatedSession, refreshCart, removeItem]);

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
