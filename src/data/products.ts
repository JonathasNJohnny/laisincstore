import rawProducts from "../tempProducts/products.json";
import rawCategories from "../tempProducts/categories.json";
import productImage from "../tempProducts/imgs/product1.jpeg";
import { getCategoryBySlug } from "./categories";
import { formatCurrency } from "../utils/currency";
import { slugify } from "../utils/slugify";
import type { Product } from "../types";

export { formatCurrency, getCategoryBySlug };

function parsePrice(value: string): number {
  return Math.round(Number(value.replace(".", "").replace(",", ".")) * 100);
}

export const products: Product[] = rawProducts.map((product, index) => ({
  id: String(index + 1),
  slug: slugify(product.item),
  name: product.item,
  category:
    rawCategories.find((category) => category.value === product.category)
      ?.label ?? "Sem categoria",
  description: product.description
    .split("|")
    .map((part) => part.trim())
    .join(" "),
  price: parsePrice(product.price),
  image: productImage,
  images: [productImage],
  badge: "Novo",
  stock: 10,
  featured: true,
}));

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getProductsByBadge(badge: Product["badge"]): Product[] {
  return products.filter((product) => product.badge === badge);
}

export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return products;

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery),
  );
}

export function getAllCategories(): string[] {
  return [...new Set(products.map((product) => product.category))].sort();
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = products.find((item) => item.id === productId);
  if (!product) return [];

  return products
    .filter(
      (item) => item.id !== productId && item.category === product.category,
    )
    .slice(0, limit);
}
