import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

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

    if (categoryParam) {
      result = result.filter((product) => product.category === categoryParam);
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
  }, [products, searchQuery, categoryParam, priceRange, sortBy]);

  const updateFilterParam = (name: "search" | "category", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  };

  const handleClearFilters = () => {
    setPriceRange([0, 50000]);
    setSortBy("newest");
    setSearchParams({});
  };

  const hasActiveFilters =
    categoryParam ||
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
        <div className="rounded-2xl border border-cinza-quente bg-branco p-5 shadow-sm lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)]">
            <div className="relative">
              <label htmlFor="shop-search" className="mb-2 block text-sm font-medium text-grafite-arroxeado">Buscar produtos</label>
              <Search className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 text-cinza-amarronzado" aria-hidden="true" />
              <input
                id="shop-search"
                type="search"
                value={searchQuery}
                onChange={(event) => updateFilterParam("search", event.target.value)}
                placeholder="Nome, categoria ou descrição"
                className="w-full rounded-xl border border-cinza-quente bg-branco py-3 pl-10 pr-10 text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais"
              />
              {searchQuery && <button type="button" onClick={() => updateFilterParam("search", "")} className="absolute bottom-3 right-3 text-cinza-amarronzado hover:text-rosa-lais" aria-label="Limpar busca"><X className="h-5 w-5" /></button>}
            </div>
            <div>
              <label htmlFor="category-filter" className="mb-2 block text-sm font-medium text-grafite-arroxeado">Categoria</label>
              <select id="category-filter" value={categoryParam} onChange={(event) => updateFilterParam("category", event.target.value)} className="w-full rounded-xl border border-cinza-quente bg-branco px-4 py-3 text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais">
                <option value="">Todas as categorias</option>
                {allCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sort-filter" className="mb-2 block text-sm font-medium text-grafite-arroxeado">Ordenar por</label>
              <select id="sort-filter" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full rounded-xl border border-cinza-quente bg-branco px-4 py-3 text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-cinza-quente pt-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-grafite-arroxeado">Preço: {formatCurrency(priceRange[0])} — {formatCurrency(priceRange[1])}</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="50000" step="1000" value={priceRange[0]} onChange={(event) => setPriceRange([Math.min(Number(event.target.value), priceRange[1]), priceRange[1]])} className="h-2 flex-1 appearance-none rounded-lg bg-cinza-quente accent-rosa-lais" aria-label="Preço mínimo" />
                <input type="range" min="0" max="50000" step="1000" value={priceRange[1]} onChange={(event) => setPriceRange([priceRange[0], Math.max(Number(event.target.value), priceRange[0])])} className="h-2 flex-1 appearance-none rounded-lg bg-cinza-quente accent-rosa-lais" aria-label="Preço máximo" />
              </div>
            </div>
            {hasActiveFilters && <button type="button" onClick={handleClearFilters} className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-rosa-lais hover:bg-rosa-lais/10"><X className="h-4 w-4" aria-hidden="true" />Limpar filtros</button>}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold text-roxo-profundo">Produtos</h2>
            <span className="text-sm text-cinza-amarronzado">{filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}</span>
          </div>
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
        </div>
      </section>
    </div>
  );
}
