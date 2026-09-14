import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface SearchBarProps {
  variant?: "header" | "page";
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  variant = "header",
  placeholder = "Buscar produtos...",
  className = "",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      if (onSearch) {
        onSearch(trimmedQuery);
      } else {
        navigate(`/loja?search=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const currentSearch = searchParams.get("search") || "";
  const initialQuery = currentSearch || query;

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${variant === "header" ? "max-w-md" : "max-w-xl"} ${className}`}
      role="search"
    >
      <label htmlFor="search-input" className="visually-hidden">
        Buscar produtos
      </label>
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? "ring-2 ring-rosa-lais/50" : ""
        }`}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cinza-amarronzado">
          <Search className="w-5 h-5" aria-hidden="true" />
        </div>
        <input
          id="search-input"
          type="search"
          value={initialQuery}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-branco border border-cinza-quente rounded-xl text-grafite-arroxeado placeholder-cinza-amarronzado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent transition-all ${variant === "header" ? "text-sm" : "text-base"}`}
          autoComplete="off"
          aria-label="Buscar produtos"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {initialQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-cinza-amarronzado hover:text-rosa-lais transition-colors"
            aria-label="Limpar busca"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
