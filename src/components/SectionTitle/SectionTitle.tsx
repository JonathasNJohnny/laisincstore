import { Link } from "react-router-dom";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  action,
  align = "left",
  className = "",
}: SectionTitleProps) {
  return (
    <div
      className={`flex flex-col items-start ${align === "center" ? "items-center" : ""} gap-2 mb-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-8 bg-rosa-lais rounded-full animate-pulse-soft"
          aria-hidden="true"
        />
        <h2 className="font-serif text-2xl lg:text-3xl font-bold text-roxo-profundo">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-cinza-amarronzado max-w-2xl">{subtitle}</p>
      )}
      {action && (
        <Link
          to={action.href}
          className="mt-2 text-sm font-medium text-rosa-lais hover:text-roxo-profundo transition-colors flex items-center gap-1"
        >
          {action.label}
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
