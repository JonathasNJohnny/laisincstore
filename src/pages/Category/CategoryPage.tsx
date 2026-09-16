import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
import { loadProducts } from "../../components/ProductList/ProductList";
import { slugify } from "../../utils/slugify";
import type { Product } from "../../types";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadProducts()
      .then((result) => {
        if (active) setApiProducts(result);
      })
      .catch(() => {
        if (active) setApiProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categoryProducts = useMemo(
    () => apiProducts.filter((product) => slugify(product.category) === slug),
    [apiProducts, slug],
  );
  const category = categoryProducts[0]?.category;

  if (loading) {
    return (
      <section className="container py-32 text-center">
        <p className="text-cinza-amarronzado">Carregando categoria...</p>
      </section>
    );
  }

  if (!category) {
    return (
      <div className="container py-16 lg:py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-roxo-profundo mb-4">
          Categoria não encontrada
        </h1>
        <p className="text-cinza-amarronzado mb-8">
          A categoria que você procura não existe.
        </p>
        <a
          href="/loja"
          className="inline-flex items-center gap-2 px-6 py-3 bg-dourado-suave text-roxo-profundo font-semibold rounded-xl hover:bg-dourado-suave/90 transition-colors"
        >
          Ver todas as categorias
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-rosa-lais mb-2 uppercase tracking-wide">
              Categoria
            </p>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-roxo-profundo mb-4">
              {category}
            </h1>
            <p className="text-cinza-amarronzado text-lg">
              Produtos cadastrados na categoria {category}.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 lg:py-12">
        <ProductGrid
          products={categoryProducts}
          variant="default"
          loading={false}
          onAddToCart={() => {}}
          emptyMessage={`Nenhum produto encontrado na categoria ${category}`}
        />
      </section>
    </div>
  );
}
