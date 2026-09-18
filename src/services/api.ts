export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3017").replace(
  /\/+$/,
  "",
);

export class ApiRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = localStorage.getItem("laisinc_auth_token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function integrationRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: authHeaders(init.headers),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
      ? data.message
      : "Não foi possível concluir a solicitação.";
    const code = data && typeof data === "object" && "code" in data && typeof data.code === "string"
      ? data.code
      : undefined;
    throw new ApiRequestError(message, code);
  }

  return data as T;
}

export interface MercadoPagoIntegration {
  provider: "mercado_pago";
  connected: boolean;
  active: boolean;
}

export function getMercadoPagoIntegration() {
  return integrationRequest<MercadoPagoIntegration>("/api/integrations/mercado-pago/status");
}

export function connectMercadoPago() {
  return integrationRequest<{ authorizationUrl: string }>("/api/integrations/mercado-pago/connect", {
    headers: { Accept: "application/json" },
  });
}

export function disconnectMercadoPago() {
  return integrationRequest<void>("/api/integrations/mercado-pago", { method: "DELETE" });
}

export interface PixPayment {
  id: number | string;
  paymentId: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
}

export function createPixPayment(orderId: number | string, payerEmail: string) {
  return integrationRequest<PixPayment>("/api/payments/pix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, payerEmail }),
  });
}

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  email: string;
  shippingMethod: string;
  shippingAddress: Record<string, string>;
}

export function createOrder(payload: CreateOrderPayload) {
  return integrationRequest<{ id: number | string }>("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

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

interface ProductResponse {
  status?: string;
  product: ApiProduct;
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

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("/assets/") ||
    imageUrl === "/imagem-padrao.png"
  ) {
    return imageUrl;
  }

  return `${API_URL}/${imageUrl.replace(/^\/+/, "")}`;
}

export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  const response = await fetch(
    `${API_URL}/api/products/slug/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    throw new Error("NÃ£o foi possÃ­vel carregar o produto.");
  }

  const data = (await response.json()) as ProductResponse;

  if (!data.product) {
    throw new Error("Produto nÃ£o encontrado.");
  }

  return data;
}
