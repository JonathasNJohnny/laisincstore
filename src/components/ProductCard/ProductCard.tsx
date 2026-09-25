import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { QuantitySelector } from "../QuantitySelector/QuantitySelector";
import { formatCurrency } from "../../utils/currency";
import type { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showAddToCart?: boolean;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  showAddToCart = true,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className = "",
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.oldPrice! - product.price) / product.oldPrice!) * 100,
      )
    : 0;

  const isOutOfStock = product.stock <= 0;

  if (variant === "compact") {
    return (
      <div className="group flex min-w-0 items-start gap-4 p-4 bg-branco rounded-xl border border-cinza-quente hover:shadow-md transition-shadow">
        <Link
          to={`/produto/${product.slug}`}
          className="flex min-w-0 flex-1 gap-4"
          aria-label={`Ver ${product.name}`}
        >
          <div className="relative w-[116px] h-[116px] flex-shrink-0 rounded-lg overflow-hidden bg-cinza-quente/50">
            <img
              src={product.image}
              alt=""
              crossOrigin="anonymous"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {product.badge && (
              <Badge type={product.badge} className="absolute top-1 left-1" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <h3 className="font-medium text-grafite-arroxeado break-words group-hover:text-rosa-lais transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-cinza-amarronzado truncate">
                {product.category}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="font-semibold text-rosa-lais">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-cinza-amarronzado line-through">
                  {formatCurrency(product.oldPrice!)}
                </span>
              )}
            </div>
          </div>
        </Link>
        {onAddToCart && !isOutOfStock && (
          <button
            type="button"
            onClick={() => onAddToCart(product, 1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dourado-suave text-roxo-profundo hover:bg-dourado-suave/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dourado-suave focus-visible:ring-offset-2"
            aria-label={`Adicionar ${product.name} ao carrinho`}
            title="Adicionar ao carrinho"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col bg-branco rounded-2xl border border-cinza-quente overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="relative aspect-square overflow-hidden bg-cinza-quente/50">
        <Link
          to={`/produto/${product.slug}`}
          aria-label={`Ver detalhes de ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            crossOrigin="anonymous"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge type={product.badge} />
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-dourado-suave text-roxo-profundo text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPercentage}%
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite?.(product);
            }}
            className={`p-2 rounded-full bg-branco/90 backdrop-blur-sm shadow-md transition-all ${
              isFavorite
                ? "text-rosa-lais"
                : "text-grafite-arroxeado hover:text-rosa-lais"
            }`}
            aria-label={
              isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
            aria-pressed={isFavorite}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
              aria-hidden="true"
            />
          </button>
          <Link
            to={`/produto/${product.slug}`}
            className="p-2 rounded-full bg-branco/90 backdrop-blur-sm shadow-md text-grafite-arroxeado hover:text-rosa-lais transition-colors"
            aria-label={`Visualização rápida de ${product.name}`}
          >
            <Eye className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-roxo-profundo/70 flex items-center justify-center z-20">
            <span className="text-branco font-semibold text-lg px-4 py-2 bg-roxo-profundo rounded-xl">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/produto/${product.slug}`} className="group">
              <h3 className="font-serif text-lg font-medium text-roxo-profundo group-hover:text-rosa-lais transition-colors line-clamp-2 break-words">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-cinza-amarronzado mt-0.5">
              {product.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-rosa-lais">
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-cinza-amarronzado line-through">
              {formatCurrency(product.oldPrice!)}
            </span>
          )}
        </div>

        {showAddToCart && !isOutOfStock && onAddToCart && (
          <div className="mt-auto flex w-full min-w-0 flex-col items-stretch gap-3 pt-3">
            <QuantitySelector
              className="self-center"
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
              aria-label={`Quantidade de ${product.name}`}
            />
            <Button
              variant="primary"
              size="md"
              fullWidth
              className="min-h-11 w-full whitespace-nowrap"
              onClick={() => onAddToCart(product, quantity)}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <ShoppingCart className="w-5 h-5 shrink-0" aria-hidden="true" />
              Adicionar
            </Button>
          </div>
        )}

        {isOutOfStock && (
          <p className="text-sm text-cinza-amarronzado text-center py-2">
            Produto esgotado no momento
          </p>
        )}
      </div>
    </article>
  );
}
