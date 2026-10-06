import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
import { useFavorites } from "../../contexts/FavoritesContext";
import { getImageUrl } from "../../services/api";
import type { Product } from "../../types";

export function FavoritesPage() {
  const { favorites, favoriteIds, loading, toggleFavorite } = useFavorites();
  const products: Product[] = favorites
    .filter((favorite) => favorite.name && favorite.slug)
    .map((favorite) => {
      const original = Number(favorite.price ?? 0) * 100;
      const final = Number(favorite.finalPrice ?? favorite.price ?? 0) * 100;
      return {
        id: String(favorite.productId), slug: favorite.slug, name: favorite.name,
        variant: null, category: "Favorito", description: "", price: Math.round(final),
        oldPrice: final < original ? Math.round(original) : undefined,
        image: favorite.imageUrl ? getImageUrl(favorite.imageUrl) : "/placeholder-product.svg",
        stock: favorite.active === false || favorite.active === 0 ? 0 : 1,
      };
    });

  return (
    <div className="container py-10 lg:py-16">
      <div className="mb-8 text-center">
        <Heart className="mx-auto mb-3 h-9 w-9 fill-rosa-lais text-rosa-lais" aria-hidden="true" />
        <h1 className="font-serif text-3xl font-bold text-roxo-profundo">Meus favoritos</h1>
        <p className="mt-2 text-cinza-amarronzado">Produtos que você guardou para ver depois.</p>
      </div>
      {!loading && products.length === 0 ? (
        <div className="rounded-2xl border border-cinza-quente bg-branco px-6 py-14 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-cinza-amarronzado" aria-hidden="true" />
          <h2 className="font-serif text-xl font-bold text-roxo-profundo">Sua lista está vazia</h2>
          <p className="mt-2 text-cinza-amarronzado">Clique no coração dos produtos que mais gostar.</p>
          <Link to="/loja" className="mt-6 inline-flex rounded-xl bg-rosa-lais px-5 py-3 font-semibold text-branco transition-opacity hover:opacity-90">Ver produtos</Link>
        </div>
      ) : (
        <ProductGrid variant="favorites" products={products} loading={loading} favorites={favoriteIds} onToggleFavorite={(product) => void toggleFavorite(product.id)} />
      )}
    </div>
  );
}
