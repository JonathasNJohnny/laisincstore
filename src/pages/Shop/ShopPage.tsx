import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
import { SearchBar } from "../../components/SearchBar/SearchBar";
import { loadProducts } from "../../components/ProductList/ProductList";
import { formatCurrency } from "../../utils/currency";
import { useCart } from "../../contexts/CartContext";
import type { Product } from "../../types";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Nome: A-Z" },
  { value: "name-desc", label: "Nome: Z-A" },
  { value: "price-asc", label: "Preço: Menor primeiro" },
  { value: "price-desc", label: "Preço: Maior primeiro" },
  { value: "newest", label: "Mais recentes" },
];

export function ShopPage() {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchQuery) {
      // Search is handled in filteredProducts
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    loadProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((error) => {
        console.error("Erro ao carregar produtos da loja:", error);
        if (active) setLoadError("NÃ£o foi possÃ­vel carregar os produtos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allCategories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery) ||
          product.description.toLowerCase().includes(normalizedQuery),
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // A API jÃ¡ entrega os produtos na ordem de exibiÃ§Ã£o cadastrada.
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 50000]);
    setSortBy("newest");
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000 ||
    searchQuery;

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-roxo-profundo mb-4">
              Nossa Loja
            </h1>
            <p className="text-cinza-amarronzado text-lg">
              Descubra todos os nossos produtos artesanais, feitos com carinho
              para você
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-8">
          <div className="flex-1 lg:w-1/4">
            <div className="bg-branco rounded-2xl border border-cinza-quente p-6 lg:p-8 sticky top-24 space-y-6">
              <SearchBar variant="page" placeholder="Buscar produtos..." />

              <div>
                <label
                  htmlFor="category-filter"
                  className="block text-sm font-medium text-grafite-arroxeado mb-2"
                >
                  Categorias
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-branco border border-cinza-quente rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-grafite-arroxeado mb-2">
                  Preço: {formatCurrency(priceRange[0])} -{" "}
                  {formatCurrency(priceRange[1])}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="flex-1 h-2 bg-cinza-quente rounded-lg appearance-none accent-rosa-lais"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="flex-1 h-2 bg-cinza-quente rounded-lg appearance-none accent-rosa-lais"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sort-filter"
                  className="block text-sm font-medium text-grafite-arroxeado mb-2"
                >
                  Ordenar por
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-branco border border-cinza-quente rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full text-sm text-rosa-lais hover:text-roxo-profundo font-medium flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 lg:w-3/4 w-full self-start">
            <ProductGrid
              products={filteredProducts}
              variant="compact"
              loading={loading}
              onAddToCart={addItem}
              emptyMessage={
                loadError || (searchQuery
                  ? `Nenhum produto encontrado para "${searchQuery}"`
                  : "Nenhum produto encontrado com os filtros selecionados")
              }
            />
            <div className="flex justify-end mb-6 mt-2 mr-2">
              <div className="flex items-center gap-2 text-left">
                <span className="text-sm text-cinza-amarronzado">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "produto" : "produtos"}{" "}
                  encontrado{filteredProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
