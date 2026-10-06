import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { addFavorite, getFavorites, removeFavorite, type FavoriteProduct } from "../services/api";
import type { Product } from "../types";
import { useAuth } from "./AuthContext";
import { openLoginMenu, toast } from "../utils/toast";

interface FavoritesContextValue {
  favorites: FavoriteProduct[];
  favoriteIds: Set<string>;
  loading: boolean;
  toggleFavorite: (productId: string, product?: Product) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getFavorites();
      setFavorites(response.favorites ?? []);
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [logout, user]);

  useEffect(() => { void refreshFavorites(); }, [refreshFavorites]);

  const toggleFavorite = useCallback(async (productId: string, product?: Product) => {
    if (!user) {
      toast.warn("Faça login para adicionar produtos aos favoritos.");
      openLoginMenu();
      return;
    }

    const previous = favorites;
    const favorite = previous.find((item) => String(item.productId) === productId);
    const pendingFavorite: FavoriteProduct = {
      id: `pending:${productId}`,
      productId,
      createdAt: new Date().toISOString(),
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      price: (product?.oldPrice ?? product?.price ?? 0) / 100,
      finalPrice: (product?.price ?? 0) / 100,
      imageUrl: product?.image,
      active: product ? product.stock > 0 : undefined,
    };
    setFavorites((items) => favorite
      ? items.filter((item) => String(item.productId) !== productId)
      : [...items, pendingFavorite],
    );

    try {
      if (favorite) await removeFavorite(productId);
      else {
        const response = await addFavorite(productId);
        setFavorites((items) => items.map((item) => {
          if (String(item.id) !== `pending:${productId}`) return item;
          return {
            ...item,
            ...response.favorite,
            name: response.favorite.name || item.name,
            slug: response.favorite.slug || item.slug,
            price: response.favorite.price ?? item.price,
            finalPrice: response.favorite.finalPrice ?? item.finalPrice,
            imageUrl: response.favorite.imageUrl ?? item.imageUrl,
          };
        }));
        void refreshFavorites();
      }
    } catch (error) {
      setFavorites(previous);
      if (error instanceof Error && "status" in error && error.status === 401) {
        logout();
        toast.warn("Sua sessão expirou. Faça login novamente.");
        openLoginMenu();
        return;
      }
      toast.warn("Não foi possível atualizar seus favoritos. Tente novamente.");
    }
  }, [favorites, logout, refreshFavorites, user]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => String(favorite.productId))),
    [favorites],
  );

  return <FavoritesContext.Provider value={{ favorites, favoriteIds, loading, toggleFavorite, refreshFavorites }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
}
