export type BadgeType = "Novo" | "Oferta" | "Destaque";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  badge?: BadgeType;
  stock: number;
  featured?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

export type CartContextType = CartState & CartActions;

export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "name-asc" | "name-desc" | "price-asc" | "price-desc" | "newest";
  page?: number;
}

export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
}

export interface SocialLink {
  platform:
    | "twitch"
    | "youtube"
    | "discord"
    | "tiktok"
    | "instagram"
    | "twitter";
  url: string;
  label: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface NewsletterFormData {
  email: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface CheckoutFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  shipping: {
    cep: string;
    address: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shippingMethod: string;
  paymentMethod: "pix" | "credit" | "boleto" | "mercadopago";
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
