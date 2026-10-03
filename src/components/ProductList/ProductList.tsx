import { useEffect, useState } from "react";
import { ProductGrid } from "../ProductGrid/ProductGrid";
import { getProducts, getImageUrl } from "../../services/api";
import type { ApiProduct } from "../../services/api";
import { slugify } from "../../utils/slugify";
import type { Product } from "../../types";
import { useCart } from "../../contexts/CartContext";

let productsRequest: Promise<Product[]> | null = null;

export function invalidateProductsCache() {
  productsRequest = null;
}

export function normalizeApiProduct(apiProduct: ApiProduct): Product {
  const numericPrice = Number(apiProduct.price ?? 0);
  const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;
  const numericSale = Number(apiProduct.sale ?? 0);
  const safeSale = Number.isFinite(numericSale) ? Math.max(0, numericSale) : 0;
  const apiFinalPrice = Number(apiProduct.final_price ?? apiProduct.finalPrice);
  const finalPrice = Number.isFinite(apiFinalPrice)
    ? Math.max(0, apiFinalPrice)
    : Math.max(0, safePrice - safeSale);
  const originalPriceInCents = Math.round(safePrice * 100);
  const finalPriceInCents = Math.round(finalPrice * 100);
  const images = (apiProduct.uploads ?? [])
    .slice()
    .sort((first, second) => (first.position ?? 0) - (second.position ?? 0))
    .map((upload) => getImageUrl(upload.url));
  const coverImage = images[0] ?? getImageUrl(apiProduct.image_url);

  return {
    id: String(apiProduct.id),
    slug: apiProduct.slug || slugify(apiProduct.name),
    name: apiProduct.name,
    variant: apiProduct.variant,
    category: apiProduct.category || "Sem categoria",
    description: apiProduct.description || "Produto da Laís Inc.",
    price: finalPriceInCents,
    oldPrice:
      finalPriceInCents < originalPriceInCents ? originalPriceInCents : undefined,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at,
    image: coverImage,
    images,
    badge:
      apiProduct.active === 1 || apiProduct.order === 0 ? "Novo" : undefined,
    stock: Number(apiProduct.stock ?? 0),
    featured: true,
    variants: apiProduct.variants?.map(normalizeApiProduct),
  };
}

export async function loadProducts(): Promise<Product[]> {
  if (!productsRequest) {
    productsRequest = getProducts()
      .then((data) => data.map(normalizeApiProduct))
      .catch((error) => {
        productsRequest = null;
        throw error;
      });
  }

  return productsRequest;
}

export function ProductList() {
  const { addItem } = useCart();
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
      onAddToCart={addItem}
      emptyMessage="Nenhum produto cadastrado."
    />
  );
}
