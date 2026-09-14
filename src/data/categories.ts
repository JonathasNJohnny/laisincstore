import rawCategories from "../tempProducts/categories.json";
import rawProducts from "../tempProducts/products.json";
import categoryImage from "../tempProducts/imgs/product1.jpeg";
import { slugify } from "../utils/slugify";
import type { Category } from "../types";

export const categories: Category[] = rawCategories.map((category, index) => ({
  id: String(category.value),
  slug: `${slugify(category.label)}-${index + 1}`,
  name: category.label,
  description: `Produtos selecionados da categoria ${category.label}.`,
  image: categoryImage,
  productCount: rawProducts.filter(
    (product) => product.category === category.value,
  ).length,
}));

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return categories.find((category) => category.name === name);
}

export function getAllCategories(): Category[] {
  return categories;
}
