import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { CartContextType, CartItem, Product } from "../types";

const CART_STORAGE_KEY = "laisinc-cart";

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id,
      );

      if (existingIndex >= 0) {
        const newQuantity = prev[existingIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
        };
        return updated;
      }

      if (quantity > product.stock) return prev;

      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((prev) => {
        const item = prev.find((i) => i.product.id === productId);
        if (!item) return prev;
        if (quantity > item.product.stock) return prev;

        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i,
        );
      });
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const getSubtotal = useCallback((): number => {
    return items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }, [items]);

  const getTotal = useCallback((): number => {
    return getSubtotal();
  }, [getSubtotal]);

  const getItemCount = useCallback((): number => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const isInCart = useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.product.id === productId);
    },
    [items],
  );

  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = items.find((i) => i.product.id === productId);
      return item?.quantity || 0;
    },
    [items],
  );

  const value: CartContextType = {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getSubtotal,
    getTotal,
    getItemCount,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
