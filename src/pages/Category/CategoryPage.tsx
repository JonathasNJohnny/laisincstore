import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
import { getCategoryBySlug, getProductsByCategory } from "../../data/products";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");
  const products = useMemo(
    () => getProductsByCategory(category?.name || ""),
    [category],
  );

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
              {category.name}
            </h1>
            <p className="text-cinza-amarronzado text-lg">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 lg:py-12">
        <ProductGrid
          products={products}
          variant="default"
          loading={false}
          onAddToCart={() => {}}
          emptyMessage={`Nenhum produto encontrado na categoria ${category.name}`}
        />
      </section>
    </div>
  );
}
