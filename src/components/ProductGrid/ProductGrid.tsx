import { ProductCard } from "../ProductCard/ProductCard";
import { LoadingSkeleton } from "../LoadingSkeleton/LoadingSkeleton";
import type { Product } from "../../types";

interface ProductGridProps {
  products: Product[];
  variant?: "default" | "compact" | "featured";
  showAddToCart?: boolean;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (product: Product) => void;
  favorites?: Set<string>;
  loading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  className?: string;
}

export function ProductGrid({
  products,
  variant = "default",
  showAddToCart = true,
  onAddToCart,
  onToggleFavorite,
  favorites = new Set(),
  loading = false,
  skeletonCount = 8,
  emptyMessage = "Nenhum produto encontrado",
  className = "",
}: ProductGridProps) {
  const gridClasses = {
    default:
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6",
    compact: "grid grid-cols-1 gap-4",
    featured: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
  };

  if (loading) {
    return (
      <div
        className={gridClasses[variant]}
        role="status"
        aria-label="Carregando produtos"
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            variant={variant === "compact" ? "card" : "product"}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12 lg:py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cinza-quente/50 mb-4">
          <svg
            className="w-8 h-8 text-cinza-amarronzado"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-grafite-arroxeado mb-1">
          {emptyMessage}
        </h3>
        <p className="text-cinza-amarronzado">
          Tente ajustar seus filtros ou busca
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${gridClasses[variant]} ${className}`}
      role="list"
      aria-label="Lista de produtos"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showAddToCart={showAddToCart}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.has(product.id)}
        />
      ))}
    </div>
  );
}
