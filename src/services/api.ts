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

export interface SuperFreteIntegration {
  provider: "superfrete";
  connected: boolean;
  active: boolean;
  originPostalCode?: string | null;
}

export interface SuperFreteConnectionPayload {
  token: string;
  originPostalCode: string;
}

export function getSuperFreteIntegration() {
  return integrationRequest<SuperFreteIntegration>("/api/integrations/superfrete/status");
}

export function saveSuperFreteIntegration(payload: SuperFreteConnectionPayload) {
  return integrationRequest<SuperFreteIntegration>("/api/integrations/superfrete", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function disconnectSuperFrete() {
  return integrationRequest<void>("/api/integrations/superfrete", { method: "DELETE" });
}

export interface ShippingQuote {
  serviceId: number | string;
  name: string;
  company: string;
  price: number;
  deliveryTime: number;
}

interface RawShippingQuote {
  serviceId?: number | string;
  service_id?: number | string;
  id?: number | string;
  name?: string;
  company?: string;
  carrier?: string;
  price?: number | string;
  deliveryTime?: number | string;
  delivery_time?: number | string;
}

interface ShippingQuoteResponse {
  options?: RawShippingQuote[];
  quotes?: RawShippingQuote[];
  services?: RawShippingQuote[];
}

export async function getShippingQuote(
  destinationPostalCode: string,
  items: Array<{ productId: number | string; quantity: number }>,
): Promise<ShippingQuote[]> {
  const response = await integrationRequest<RawShippingQuote[] | ShippingQuoteResponse>("/api/shipping/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destinationPostalCode, items }),
  });

  const quotes = Array.isArray(response)
    ? response
    : response.options ?? response.quotes ?? response.services ?? [];

  return quotes.flatMap((quote) => {
    const serviceId = quote.serviceId ?? quote.service_id ?? quote.id;
    const price = Number(quote.price);
    const deliveryTime = Number(quote.deliveryTime ?? quote.delivery_time);
    if (serviceId == null || !quote.name || !Number.isFinite(price) || !Number.isFinite(deliveryTime)) return [];

    return [{
      serviceId,
      name: quote.name,
      company: quote.company ?? quote.carrier ?? "Transportadora",
      price,
      deliveryTime,
    }];
  });
}

export interface PixPayment {
  id: number | string;
  paymentId: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
}

interface PixPaymentApiResponse {
  id?: number | string;
  paymentId?: string;
  payment_id?: string;
  status?: PixPayment["status"];
  qrCode?: string;
  qr_code?: string;
  qrCodeBase64?: string;
  qr_code_base64?: string;
  ticketUrl?: string;
  ticket_url?: string;
  payment?: PixPaymentApiResponse;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
}

export interface CartItemResponse {
  productId: number | string;
  quantity: number;
  name: string;
  price: string | number;
  stock: number;
}

export interface ApiCart {
  items: CartItemResponse[];
  total: string | number;
}

export interface Order {
  id: number | string;
  status: "pending_payment" | "paid" | "cancelled";
  total_amount: string | number;
  currency: string;
  email: string;
  created_at?: string;
  paid_at?: string | null;
  pixCopyPaste?: string | null;
  items: Array<{
    productId: number | string;
    quantity: number;
    unitPrice: string | number;
    subtotal: string | number;
  }>;
}

export function getCart() {
  return integrationRequest<{ status: string; cart: ApiCart }>("/api/cart");
}

export function addCartItem(productId: number | string, quantity: number) {
  return integrationRequest<void>("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(productId: number | string, quantity: number) {
  return integrationRequest<void>(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(productId: number | string) {
  return integrationRequest<void>(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export function createPixPayment(orderId: number | string) {
  return integrationRequest<PixPaymentApiResponse>("/api/payments/pix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  }).then((response) => {
    const payment = response.payment ?? response;
    const transactionData = payment.point_of_interaction?.transaction_data;
    return {
      id: payment.id ?? orderId,
      paymentId: payment.paymentId ?? payment.payment_id ?? String(payment.id ?? orderId),
      status: payment.status ?? "pending",
      qrCode: payment.qrCode ?? payment.qr_code ?? transactionData?.qr_code,
      qrCodeBase64: payment.qrCodeBase64 ?? payment.qr_code_base64 ?? transactionData?.qr_code_base64,
      ticketUrl: payment.ticketUrl ?? payment.ticket_url ?? transactionData?.ticket_url,
    } satisfies PixPayment;
  });
}

export interface OrderShipping {
  serviceId: number | string;
  name: string;
  company: string;
  price: number;
  deliveryTime: number;
  destinationPostalCode: string;
}

export function createOrder(payerEmail: string, shipping: OrderShipping) {
  return integrationRequest<{ status: string; order: Order }>("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payerEmail, shipping }),
  });
}

export function getOrder(orderId: number | string) {
  return integrationRequest<{ status: string; order: Order }>(`/api/orders/${encodeURIComponent(orderId)}`);
}

export function getOrders() {
  return integrationRequest<{ status: string; orders: Order[] }>("/api/orders");
}

export interface AdminOrder extends Order {
  customer: { id: number | string; name: string; email: string };
  items: Array<{
    productId: number | string;
    productName?: string;
    quantity: number;
    unitPrice: string | number;
    subtotal: string | number;
  }>;
}

export function getAdminOrders() {
  return integrationRequest<{ status: string; orders: AdminOrder[] }>("/api/orders/admin");
}

export interface CardPaymentPayload {
  orderId: number | string;
  cardToken: string;
  paymentMethodId: string;
  installments: number;
  issuerId?: string;
}

export function createCardPayment(payload: CardPaymentPayload) {
  return integrationRequest<PixPayment>("/api/payments/card", {
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
  weight_grams?: number | null;
  image_url?: string | null;
  uploads?: Array<{
    id: number | string;
    product_id: number | string;
    url: string;
    position: number;
  }>;
  active?: number | boolean | string;
  order?: number;
}

interface ProductsResponse {
  products?: ApiProduct[];
}

export interface HeroBanner {
  id: number | string;
  image_url?: string | null;
  image?: string | null;
  redirect_link?: string | null;
  active?: number | boolean | string;
  position?: number | string;
  created_at?: string;
  updated_at?: string;
}

function heroBannerImageUrl(banner: HeroBanner): string | null {
  return banner.image_url ?? banner.image ?? null;
}

export function getHeroBannerImageUrl(banner: HeroBanner): string {
  return getImageUrl(heroBannerImageUrl(banner));
}

export async function getAdminHeroBanners(): Promise<HeroBanner[]> {
  const response = await fetch(`${API_URL}/api/hero-banners/admin`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Não foi possível carregar os banners.");
  const data = await response.json() as HeroBanner[] | { banners?: HeroBanner[] };
  return Array.isArray(data) ? data : data.banners ?? [];
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const response = await fetch(`${API_URL}/api/hero-banners`);
  if (!response.ok) throw new Error("Não foi possível carregar os banners.");
  const data = await response.json() as HeroBanner[] | { banners?: HeroBanner[] };
  return (Array.isArray(data) ? data : data.banners ?? [])
    .filter((banner) => banner.active !== 0 && banner.active !== false && banner.active !== "0")
    .sort((first, second) => Number(first.position ?? 0) - Number(second.position ?? 0));
}

export async function createHeroBanner(formData: FormData) {
  const response = await fetch(`${API_URL}/api/hero-banners`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error("Não foi possível criar o banner.");
  return response.json();
}

export async function updateHeroBanner(id: number | string, formData: FormData) {
  const response = await fetch(`${API_URL}/api/hero-banners/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error("Não foi possível atualizar o banner.");
  return response.json();
}

export async function deleteHeroBanner(id: number | string) {
  const response = await fetch(`${API_URL}/api/hero-banners/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Não foi possível excluir o banner.");
  return response.json();
}

interface ProductResponse {
  status?: string;
  product: ApiProduct;
}

function isActiveProduct(product: ApiProduct): boolean {
  return product.active !== 0 && product.active !== false && product.active !== "0";
}

export async function getProducts(options: { includeInactive?: boolean } = {}): Promise<ApiProduct[]> {
  const response = await fetch(`${API_URL}/api/products`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos.");
  }

  const data = (await response.json()) as ApiProduct[] | ProductsResponse;
  const products = Array.isArray(data) ? data : (data.products ?? []);

  return options.includeInactive
    ? products
    : products.filter(isActiveProduct);
}

export async function createProduct(formData: FormData) {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: authHeaders(),
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
    headers: authHeaders(),
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
    headers: authHeaders(),
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

  if (!isActiveProduct(data.product)) {
    throw new Error("Produto indisponÃ­vel.");
  }

  return data;
}
