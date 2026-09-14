import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, User, Heart } from "lucide-react";
import { SocialLinks } from "../SocialLinks/SocialLinks";
import { SearchBar } from "../SearchBar/SearchBar";
import { CartDrawer } from "../CartDrawer/CartDrawer";
import { useCart } from "../../contexts/CartContext";
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
  const location = useLocation();
  const { getItemCount, toggleCart } = useCart();

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
  }, [location]);

  const itemCount = getItemCount();

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
                {navItems.map((item) => (
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

            <div className="flex items-center gap-2 shrink-0">
              <button
                className="relative p-2 rounded-xl text-grafite-arroxeado hover:bg-cinza-quente/50 transition-colors lg:p-2.5"
                aria-label="Minha conta"
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
              {navItems.map((item) => (
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
