import { Hero } from "../../components/Hero/Hero";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { ProductGrid } from "../../components/ProductGrid/ProductGrid";
import { CategoryCard } from "../../components/CategoryCard/CategoryCard";
import { Newsletter } from "../../components/Newsletter/Newsletter";
import { products } from "../../data/products";
import { categories } from "../../data/categories";

export function HomePage() {
  const newProducts = products;
  const featuredProducts = products;
  const saleProducts = products;

  return (
    <>
      <Hero />

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="categories-title"
      >
        <SectionTitle
          title="Nossas Categorias"
          subtitle="Explore nossos universos e encontre o que combina com você"
          action={{ label: "Ver todas", href: "/loja" }}
        />
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          role="list"
          aria-label="Categorias"
        >
          {categories.slice(0, 4).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="new-products-title"
      >
        <SectionTitle
          className="mt-[20px]"
          title="Novidades"
          subtitle="Acabaram de chegar, feitos com carinho para você"
          action={{ label: "Ver todas novidades", href: "/loja?badge=Novo" }}
        />
        <ProductGrid
          products={newProducts.slice(0, 8)}
          loading={false}
          onAddToCart={() => {}}
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
          action={{
            label: "Ver todos destaques",
            href: "/loja?badge=Destaque",
          }}
        />
        <ProductGrid
          products={featuredProducts.slice(0, 8)}
          loading={false}
          onAddToCart={() => {}}
        />
      </section>

      <section
        className="container py-12 lg:py-16"
        aria-labelledby="sale-products-title"
      >
        <SectionTitle
          className="mt-[20px]"
          title="Ofertas Especiais"
          subtitle="Descontos imperdíveis por tempo limitado"
          action={{ label: "Ver todas ofertas", href: "/loja?badge=Oferta" }}
        />
        <ProductGrid
          products={saleProducts.slice(0, 8)}
          loading={false}
          onAddToCart={() => {}}
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
                Materiais selecionados e acabamento impecável para durar por
                muito tempo.
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
