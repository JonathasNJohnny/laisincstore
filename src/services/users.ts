const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3017").replace(/\/+$/, "");

export const AUTH_TOKEN_KEY = "laisinc_auth_token";

export interface User {
  id: number | string;
  nome: string;
  email: string;
  admin?: boolean;
  telefone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  cep?: string | null;
  bairro?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  recebedor?: string | null;
}

export type UserPayload = Omit<User, "id" | "email" | "admin"> & { senha?: string };
export type RegistrationPayload = Omit<User, "id" | "admin"> & { senha: string };

function messageFrom(data: unknown): string {
  if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível concluir a solicitação.";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api/users${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(messageFrom(data));
  return data as T;
}

export async function authenticatedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return request<T>(path, {
    ...init,
    headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

function normalizeUser(data: any): User {
  const user = data.user ?? data.data?.user ?? data.data ?? data;
  return { ...user, admin: user.admin === true || user.admin === 1 } as User;
}

function unwrapUser(data: any): User {
  return normalizeUser(data);
}

export async function login(email: string, senha: string) {
  const data = await request<any>("/login", { method: "POST", body: JSON.stringify({ email, senha }) });
  const token = data.token ?? data.accessToken ?? data.data?.token;
  if (!token) throw new Error("A API não retornou um token de acesso.");
  return {
    token: String(token),
    user: data.user || data.data?.user ? normalizeUser(data) : null,
  };
}

export async function getCurrentUser() {
  return unwrapUser(await authenticatedFetch<any>("/me"));
}

export async function registerUser(payload: RegistrationPayload) {
  return request<any>("", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateUser(id: User["id"], payload: Partial<UserPayload>) {
  return unwrapUser(await authenticatedFetch<any>(`/${id}`, { method: "PUT", body: JSON.stringify(payload) }));
}
