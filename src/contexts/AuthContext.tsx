import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AUTH_TOKEN_KEY, getCurrentUser, login as loginRequest, type User } from "../services/users";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) { setLoading(false); return; }
    refreshUser().catch(logout).finally(() => setLoading(false));
  }, [logout, refreshUser]);

  const login = useCallback(async (email: string, senha: string) => {
    const result = await loginRequest(email, senha);
    localStorage.setItem(AUTH_TOKEN_KEY, result.token);
    if (result.user) setUser(result.user);
    else await refreshUser();
  }, [refreshUser]);

  return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
