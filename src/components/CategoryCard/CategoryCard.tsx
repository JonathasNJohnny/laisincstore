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
