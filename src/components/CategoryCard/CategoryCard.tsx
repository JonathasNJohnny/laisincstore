import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Category } from "../../types";

interface CategoryCardProps {
  category: Category;
  variant?: "default" | "compact";
  className?: string;
}

export function CategoryCard({
  category,
  variant = "default",
  className = "",
}: CategoryCardProps) {
  const images = category.images?.length ? category.images : [category.image];
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
  }, [category.id]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [category.id, images.length]);

  if (variant === "compact") {
    return (
      <Link
        to={`/categoria/${category.slug}`}
        className={`group relative block overflow-hidden rounded-2xl border border-cinza-quente bg-branco shadow-sm ${className}`}
        aria-label={`Ver categoria ${category.name}, ${category.productCount} produtos`}
      >
        <div className="relative aspect-[2/1] overflow-hidden bg-cinza-quente/50">
          {images.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt=""
              crossOrigin="anonymous"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:scale-105 ${index === activeImage ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
            <h3 className="category-text-shadow truncate text-xs font-semibold text-branco sm:text-sm">
              {category.name}
            </h3>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/categoria/${category.slug}`}
      className={`group relative overflow-hidden ${className}`}
      aria-label={`Ver categoria ${category.name}, ${category.productCount} produtos`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cinza-quente/50">
        <img
          src={category.image}
          alt=""
          crossOrigin="anonymous"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-roxo-profundo/80 via-roxo-profundo/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h3 className="font-serif text-2xl lg:text-3xl font-bold text-branco mb-1">
            {category.name}
          </h3>
          <p className="text-branco/80 text-sm lg:text-base">
            {category.productCount}{" "}
            {category.productCount === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </div>
      {variant === "default" && (
        <div className="mt-3 text-center">
          <p className="text-sm text-cinza-amarronzado line-clamp-2">
            {category.description}
          </p>
        </div>
      )}
    </Link>
  );
}
