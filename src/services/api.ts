const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3017").replace(
  /\/+$/,
  "",
);

export interface ApiProduct {
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
}

interface ProductsResponse {
  products?: ApiProduct[];
}

export async function getProducts(): Promise<ApiProduct[]> {
  const response = await fetch(`${API_URL}/api/products`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos.");
  }

  const data = (await response.json()) as ApiProduct[] | ProductsResponse;
  return Array.isArray(data) ? data : (data.products ?? []);
}

export async function createProduct(formData: FormData) {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar o produto.");
  }

  return response.json();
}

export async function updateProduct(id: number | string, formData: FormData) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar o produto.");
  }

  return response.json();
}

export async function deleteProduct(id: number | string) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Não foi possível remover o produto.");
  }

  return response.json();
}

export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return "/imagem-padrao.png";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_URL}/${imageUrl.replace(/^\/+/, "")}`;
}
