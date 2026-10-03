import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductGrid } from "../ProductGrid/ProductGrid";
import type { Product } from "../../types";

interface ProductCarouselProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (product: Product, quantity: number) => void;
  emptyMessage?: string;
}

export function ProductCarousel({
  products,
  loading = false,
  onAddToCart,
  emptyMessage,
}: ProductCarouselProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [direction, setDirection] = useState<"next" | "previous">("next");

  useEffect(() => {
    const updatePageSize = () => {
      setPageSize(window.matchMedia("(min-width: 1024px)").matches ? 6 : 3);
      setDirection("next");
      setPage(0);
    };

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const visibleProducts = products.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  useEffect(() => {
    if (page >= pageCount) setPage(0);
  }, [page, pageCount]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setDirection("previous");
          setPage((current) => Math.max(0, current - 1));
        }}
        disabled={page === 0}
        className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cinza-quente bg-branco text-roxo-profundo shadow-md transition hover:bg-cream disabled:pointer-events-none disabled:opacity-0"
        aria-label="Produtos anteriores"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="overflow-hidden px-1 py-1">
        <div
          key={page}
          className={direction === "next" ? "animate-carousel-next" : "animate-carousel-previous"}
        >
          <ProductGrid
            products={visibleProducts}
            variant="carousel"
            loading={loading}
            skeletonCount={pageSize}
            onAddToCart={onAddToCart}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setDirection("next");
          setPage((current) => Math.min(pageCount - 1, current + 1));
        }}
        disabled={page >= pageCount - 1}
        className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cinza-quente bg-branco text-roxo-profundo shadow-md transition hover:bg-cream disabled:pointer-events-none disabled:opacity-0"
        aria-label="Próximos produtos"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {pageCount > 1 && (
        <div className="mt-4 flex justify-center gap-2" aria-label="Páginas de produtos">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setDirection(index >= page ? "next" : "previous");
                setPage(index);
              }}
              className={`h-2 rounded-full transition-all ${index === page ? "w-6 bg-rosa-lais" : "w-2 bg-cinza-quente"}`}
              aria-label={`Ir para página ${index + 1} de produtos`}
              aria-current={index === page ? "page" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
