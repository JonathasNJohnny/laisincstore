import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, User, Heart, LogOut } from "lucide-react";
import { SocialLinks } from "../SocialLinks/SocialLinks";
import { SearchBar } from "../SearchBar/SearchBar";
import { CartDrawer } from "../CartDrawer/CartDrawer";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import type { NavItem } from "../../types";
import logo from "../../assets/logo.png";

const navItems: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Loja", href: "/loja" },
  { label: "Sobre", href: "/sobre" },
  { label: "Agradecimentos", href: "/agradecimentos" },
];

const socialLinks = [
  {
    platform: "twitch" as const,
    url: "https://www.twitch.tv/laisinc",
    label: "Twitch",
  },
  {
    platform: "youtube" as const,
    url: "https://www.youtube.com/@laisinc",
    label: "YouTube",
  },
  {
    platform: "discord" as const,
    url: "https://discord.com/invite/haQ67m5tU8",
    label: "Discord",
  },
  {
    platform: "tiktok" as const,
    url: "https://www.tiktok.com/@lais_inc",
    label: "TikTok",
  },
  {
    platform: "instagram" as const,
    url: "https://www.instagram.com/lais.inc",
    label: "Instagram",
  },
  {
    platform: "twitter" as const,
    url: "https://www.instagram.com/lais.inc",
    label: "Twitter",
  },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();
  const { getItemCount, toggleCart } = useCart();
  const { user, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsAccountOpen(false);
  }, [location]);

  const itemCount = getItemCount();
  const visibleNavItems = user?.admin === true
    ? [...navItems.slice(0, 2), { label: "Administrar", href: "/administrar" }, ...navItems.slice(2)]
    : navItems;
  const profileIncomplete = Boolean(
    user &&
      (["telefone", "cep", "bairro", "rua", "numero", "recebedor"].some(
        (field) => !user[field as keyof typeof user],
      ) ||
        (!user.cpf && !user.cnpj)),
  );

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError(""); setIsLoggingIn(true);
    try { await login(email, password); setIsAccountOpen(false); setPassword(""); }
    catch (error) { setLoginError(error instanceof Error ? error.message : "Não foi possível entrar."); }
    finally { setIsLoggingIn(false); }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-branco/95 backdrop-blur-md shadow-sm border-b border-cinza-quente"
            : "bg-transparent"
        }`}
        role="banner"
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            <Link
              to="/"
              className="flex items-center shrink-0 lg:mr-8"
              aria-label="Laís Inc Store - Início"
            >
              <img
                src={logo}
                alt="Laís Inc Store"
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </Link>

            <nav
              className="hidden lg:flex items-center gap-6 flex-1 justify-center"
              aria-label="Navegação principal"
            >
              <ul className="flex items-center gap-1" role="list">
                {visibleNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === item.href
                          ? "bg-rosa-lais/10 text-rosa-lais"
                          : "text-grafite-arroxeado hover:text-rosa-lais hover:bg-rosa-lais/10"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
              <SocialLinks links={socialLinks} variant="compact" />
            </div>

            <div className="hidden lg:block lg:mr-8">
              <SearchBar variant="header" placeholder="O que você procura?" />
            </div>

            <div className="relative flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAccountOpen((open) => !open)}
                className="relative p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors lg:p-2.5"
                aria-label="Minha conta"
                aria-expanded={isAccountOpen}
              >
                <User className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
              </button>
              <button
                className="relative p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors lg:p-2.5"
                aria-label="Favoritos"
              >
                <Heart className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
              </button>
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors lg:p-2.5"
                aria-label={`Carrinho de compras, ${itemCount} itens`}
              >
                <ShoppingBag
                  className="w-5 h-5 lg:w-6 lg:h-6"
                  aria-hidden="true"
                />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dourado-suave text-roxo-profundo text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
              {isAccountOpen && (
                <div className="absolute right-0 top-full z-[60] mt-3 w-[min(22rem,calc(100vw-2rem))] animate-[slideUp_180ms_ease-out] rounded-2xl border border-cinza-quente bg-branco p-5 shadow-xl">
                  {user ? <>
                    <p className="font-semibold text-roxo-profundo">{user.nome}</p>
                    <p className="mb-4 text-sm text-cinza-amarronzado">{user.email}</p>
                    {profileIncomplete && <Link to="/perfil" className="mb-2 block rounded-xl bg-dourado-suave/25 px-4 py-3 text-sm font-medium text-roxo-profundo">⚠️ Continuar cadastro</Link>}
                    <Link to="/perfil" className="mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-grafite-arroxeado hover:bg-cinza-quente/50">Meu perfil / Editar dados</Link>
                    <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Sair</button>
                  </> : <form onSubmit={handleLogin} className="space-y-3">
                    <h2 className="font-serif text-xl font-bold text-roxo-profundo">Entrar</h2>
                    <label className="grid gap-1 text-sm">E-mail<input className="rounded-xl border border-cinza-quente px-3 py-2" type="email" value={email} required onChange={(event) => setEmail(event.target.value)} /></label>
                    <label className="grid gap-1 text-sm">Senha<input className="rounded-xl border border-cinza-quente px-3 py-2" type="password" value={password} required onChange={(event) => setPassword(event.target.value)} /></label>
                    {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                    <button disabled={isLoggingIn} className="w-full rounded-xl bg-rosa-lais px-4 py-2.5 font-medium text-branco disabled:opacity-50">{isLoggingIn ? "Entrando..." : "Entrar"}</button>
                    <p className="text-center text-sm text-cinza-amarronzado">Ainda não tem conta? <Link className="font-medium text-rosa-lais" to="/cadastro">Cadastre-se</Link></p>
                  </form>}
                </div>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors"
                aria-label="Buscar"
                aria-expanded={isSearchOpen}
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors"
                aria-label={`Carrinho, ${itemCount} itens`}
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dourado-suave text-roxo-profundo text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors"
                aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {isSearchOpen && (
            <div className="lg:hidden py-4 border-t border-cinza-quente animate-slide-up">
              <SearchBar variant="page" placeholder="Buscar produtos..." />
            </div>
          )}

          <nav
            id="mobile-menu"
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
            aria-label="Menu mobile"
          >
            <div className="py-4 space-y-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    location.pathname === item.href
                      ? "bg-rosa-lais/10 text-rosa-lais"
                      : "text-grafite-arroxeado hover:text-rosa-lais hover:bg-rosa-lais/10"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-cinza-quete">
                <SocialLinks
                  links={socialLinks}
                  variant="default"
                  className="justify-center"
                />
              </div>
            </div>
          </nav>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
