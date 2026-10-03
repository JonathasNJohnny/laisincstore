import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Hero } from "../../components/Hero/Hero";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { ProductCarousel } from "../../components/ProductCarousel/ProductCarousel";
import { CategoryCard } from "../../components/CategoryCard/CategoryCard";
import { loadProducts } from "../../components/ProductList/ProductList";
// import { Newsletter } from "../../components/Newsletter/Newsletter";
import { slugify } from "../../utils/slugify";
import type { Category } from "../../types";
import type { Product } from "../../types";
import { useCart } from "../../contexts/CartContext";
import { getHeroBanners, type HeroBanner } from "../../services/api";

export function HomePage() {
  const { addItem } = useCart();
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryPageSize, setCategoryPageSize] = useState(4);
  const [categoryDirection, setCategoryDirection] = useState<
    "next" | "previous"
  >("next");

  useEffect(() => {
    const updatePageSize = () => {
      setCategoryPageSize(
        window.matchMedia("(min-width: 1024px)").matches ? 8 : 4,
      );
      setCategoryDirection("next");
      setCategoryPage(0);
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        const data = await loadProducts();
        if (!active) return;
        setLiveProducts(data.filter((product) => product.variant === null));
      } catch {
        if (!active) return;
        setLiveProducts([]);
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getHeroBanners()
      .then((banners) => {
        if (active) setHeroBanners(banners);
      })
      .catch(() => {
        if (active) setHeroBanners([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo<Category[]>(() => {
    const categoryMap = new Map<string, Product[]>();

    liveProducts.forEach((product) => {
      if (product.variant === null) {
        const categoryProducts = categoryMap.get(product.category) ?? [];
        categoryProducts.push(product);
        categoryMap.set(product.category, categoryProducts);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, categoryProducts]) => {
      const randomProduct =
        categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
      const images = Array.from(
        new Set(categoryProducts.map((product) => product.image)),
      );

      return {
        id: slugify(name),
        slug: slugify(name),
        name,
        description: `Produtos selecionados da categoria ${name}.`,
        image: randomProduct.image,
        images,
        productCount: categoryProducts.length,
      };
    });
  }, [liveProducts]);

  const categoryPageCount = Math.max(
    1,
    Math.ceil(categories.length / categoryPageSize),
  );
  const visibleCategories = categories.slice(
    categoryPage * categoryPageSize,
    (categoryPage + 1) * categoryPageSize,
  );

  useEffect(() => {
    if (categoryPage >= categoryPageCount) setCategoryPage(0);
  }, [categoryPage, categoryPageCount]);

  return (
    <>
      <Hero banners={heroBanners} />

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="categories-title"
      >
        <SectionTitle
          title="Nossas Categorias"
          subtitle="Explore nossos universos e encontre o que combina com você"
          subtitleOnTitleHover
          action={{ label: "Ver todas", href: "/loja" }}
        />
        <div className="relative" aria-label="Categorias">
          <button
            type="button"
            onClick={() => {
              setCategoryDirection("previous");
              setCategoryPage((page) => Math.max(0, page - 1));
            }}
            disabled={categoryPage === 0}
            className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cinza-quente bg-branco text-roxo-profundo shadow-md transition hover:bg-cream disabled:pointer-events-none disabled:opacity-0"
            aria-label="Categorias anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="overflow-hidden px-1 py-1">
            <div
              key={categoryPage}
              className={
                categoryDirection === "next"
                  ? "animate-carousel-next"
                  : "animate-carousel-previous"
              }
            >
              <div
                className="grid grid-cols-4 gap-3 lg:grid-cols-8 lg:gap-4"
                role="list"
              >
                {visibleCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCategoryDirection("next");
              setCategoryPage((page) =>
                Math.min(categoryPageCount - 1, page + 1),
              );
            }}
            disabled={categoryPage >= categoryPageCount - 1}
            className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cinza-quente bg-branco text-roxo-profundo shadow-md transition hover:bg-cream disabled:pointer-events-none disabled:opacity-0"
            aria-label="Próximas categorias"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          {categoryPageCount > 1 && (
            <div
              className="mt-4 flex justify-center gap-2"
              aria-label="Páginas de categorias"
            >
              {Array.from({ length: categoryPageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setCategoryDirection(
                      index >= categoryPage ? "next" : "previous",
                    );
                    setCategoryPage(index);
                  }}
                  className={`h-2 rounded-full transition-all ${index === categoryPage ? "w-6 bg-rosa-lais" : "w-2 bg-cinza-quente"}`}
                  aria-label={`Ir para página ${index + 1} de categorias`}
                  aria-current={index === categoryPage ? "page" : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="api-products-title"
      >
        <SectionTitle
          title="Produtos da Loja"
          subtitle="Atualizados diretamente da API da Laís Inc"
          subtitleOnTitleHover
          action={{ label: "Ver loja completa", href: "/loja" }}
        />
        <ProductCarousel
          products={liveProducts}
          loading={loadingProducts}
          onAddToCart={addItem}
          emptyMessage="Nenhum produto disponível no momento"
        />
      </section>

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="new-products-title"
      >
        <SectionTitle
          className="mt-[20px]"
          title="Novidades"
          subtitle="Acabaram de chegar, feitos com carinho para você"
          subtitleOnTitleHover
          action={{ label: "Ver todas novidades", href: "/loja?badge=Novo" }}
        />
        <ProductCarousel
          products={liveProducts}
          loading={loadingProducts}
          onAddToCart={addItem}
          emptyMessage="Nenhum produto disponível no momento"
        />
      </section>

      <section
        className="container pt-[58px] pb-12 lg:pt-[74px] lg:pb-16"
        aria-labelledby="featured-products-title"
      >
        <SectionTitle
          className="mt-[20px]"
          title="Em Destaque"
          subtitle="Nossos queridinhos, escolhidos a dedo"
          subtitleOnTitleHover
          action={{
            label: "Ver todos destaques",
            href: "/loja?badge=Destaque",
          }}
        />
        <ProductCarousel
          products={liveProducts}
          loading={loadingProducts}
          onAddToCart={addItem}
          emptyMessage="Nenhum produto disponível no momento"
        />
      </section>

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="sale-products-title"
      >
        <SectionTitle
          className="mt-[20px]"
          title="Mais produtos"
          subtitle="Confira nossas novidades"
          subtitleOnTitleHover
          action={{ label: "Ver todos os produtos", href: "/loja" }}
        />
        <ProductCarousel
          products={liveProducts}
          loading={loadingProducts}
          onAddToCart={addItem}
          emptyMessage="Nenhum produto disponível no momento"
        />
      </section>

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="about-title"
      >
        <div className="max-w-4xl mx-auto text-center mt-10 mb-10">
          <SectionTitle
            title="Sobre a Laís Inc"
            subtitle="Cada peça conta uma história, cada detalhe carrega um pedacinho de magia"
            subtitleOnTitleHover
            align="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-8">
            <div className="p-6 lg:p-8 bg-branco rounded-2xl border border-cinza-quente">
              <div className="w-14 h-14 rounded-xl bg-rosa-lais/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-rosa-lais"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-roxo-profundo mb-2">
                Feito à Mão
              </h3>
              <p className="text-cinza-amarronzado">
                Cada produto é cuidadosamente artesanal, com atenção aos mínimos
                detalhes.
              </p>
            </div>
            <div className="p-6 lg:p-8 bg-branco rounded-2xl border border-cinza-quente">
              <div className="w-14 h-14 rounded-xl bg-dourado-suave/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-dourado-suave"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-roxo-profundo mb-2">
                Qualidade Garantida
              </h3>
              <p className="text-cinza-amarronzado">
                Qualidade em cada detalhe, feito para durar quando bem cuidado.
              </p>
            </div>
            <div className="p-6 lg:p-8 bg-branco rounded-2xl border border-cinza-quente">
              <div className="w-14 h-14 rounded-xl bg-roxo-medio/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-roxo-medio"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-roxo-profundo mb-2">
                Entrega Rápida
              </h3>
              <p className="text-cinza-amarronzado">
                Enviamos para todo o Brasil com cuidado e agilidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <Newsletter /> */}
    </>
  );
}
