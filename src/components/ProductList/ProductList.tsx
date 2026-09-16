import { useEffect, useState } from "react";
import { ProductGrid } from "../ProductGrid/ProductGrid";
import { getProducts, getImageUrl } from "../../services/api";
import { slugify } from "../../utils/slugify";
import type { Product } from "../../types";

function normalizeApiProduct(apiProduct: {
  id: number;
  name: string;
  category?: string;
  slug?: string;
  description?: string;
  price: string | number;
  stock?: number;
  image_url?: string | null;
  active?: number;
  order?: number;
}): Product {
  const numericPrice = Number(apiProduct.price ?? 0);
  const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;

  return {
    id: String(apiProduct.id),
    slug: apiProduct.slug || slugify(apiProduct.name),
    name: apiProduct.name,
    category: apiProduct.category || "Sem categoria",
    description: apiProduct.description || "Produto da Laís Inc.",
    price: Math.round(safePrice * 100),
    image: getImageUrl(apiProduct.image_url),
    images: [getImageUrl(apiProduct.image_url)],
    badge:
      apiProduct.active === 1 || apiProduct.order === 0 ? "Novo" : undefined,
    stock: Number(apiProduct.stock ?? 0),
    featured: true,
  };
}

export async function loadProducts(): Promise<Product[]> {
  const data = await getProducts();
  return data.map(normalizeApiProduct);
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await loadProducts();

        if (!isMounted) {
          return;
        }

        setProducts(result);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);

        if (!isMounted) {
          return;
        }

        setError("Não foi possível carregar os produtos.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <ProductGrid products={[]} loading={true} skeletonCount={4} />;
  }

  if (error) {
    return <p className="text-center text-cinza-amarronzado">{error}</p>;
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-cinza-amarronzado">
        Nenhum produto cadastrado.
      </p>
    );
  }

  return (
    <ProductGrid
      products={products.slice(0, 8)}
      loading={false}
      onAddToCart={() => {}}
      emptyMessage="Nenhum produto cadastrado."
    />
  );
}
