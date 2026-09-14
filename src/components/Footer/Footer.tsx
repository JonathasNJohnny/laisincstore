import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Clock, Heart, Sparkles } from "lucide-react";
import { SocialLinks } from "../SocialLinks/SocialLinks";
import type { FooterSection, SocialLink } from "../../types";
import logo from "../../assets/logo.png";

const footerSections: FooterSection[] = [
  {
    title: "Ajuda",
    links: [
      { label: "Central de Ajuda", href: "/ajuda" },
      { label: "Rastrear Pedido", href: "/rastrear" },
      { label: "Trocas e Devoluções", href: "/trocas" },
      { label: "Perguntas Frequentes", href: "/faq" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Laís Inc",
    links: [
      { label: "Nossa História", href: "/sobre" },
      { label: "Agradecimentos", href: "/agradecimentos" },
      { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
      { label: "Imprensa", href: "/imprensa" },
      { label: "Sustentabilidade", href: "/sustentabilidade" },
    ],
  },
  {
    title: "Políticas",
    links: [
      { label: "Política de Privacidade", href: "/politica-de-privacidade" },
      { label: "Termos de Uso", href: "/termos" },
      { label: "Política de Cookies", href: "/cookies" },
      { label: "LGPD", href: "/lgpd" },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { platform: "twitch", url: "https://www.twitch.tv/laisinc", label: "Twitch" },
  {
    platform: "youtube",
    url: "https://www.youtube.com/@laisinc",
    label: "YouTube",
  },
  {
    platform: "discord",
    url: "https://discord.com/invite/haQ67m5tU8",
    label: "Discord",
  },
  {
    platform: "tiktok",
    url: "https://www.tiktok.com/@lais_inc",
    label: "TikTok",
  },
  {
    platform: "instagram",
    url: "https://www.instagram.com/lais.inc",
    label: "Instagram",
  },
  {
    platform: "twitter",
    url: "https://www.instagram.com/lais.inc",
    label: "Twitter",
  },
];

const contactInfo = [
  {
    icon: Mail,
    label: "contato@laisinc.com",
    href: "mailto:contato@laisinc.com",
  },
  { icon: MapPin, label: "São Paulo - SP, Brasil", href: "#" },
  { icon: Phone, label: "(11) 99999-9999", href: "tel:+5511999999999" },
  { icon: Clock, label: "Seg-Sex: 9h às 18h", href: "#" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-roxo-profundo text-branco" role="contentinfo">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Link
              to="/"
              className="inline-flex items-center mt-4"
              aria-label="Laís Inc Store - Início"
            >
              <img
                src={logo}
                alt="Laís Inc Store"
                className="w-40 h-auto object-contain"
              />
            </Link>
            <p className="text-branco/70 max-w-sm">
              Um universo de coisas lindas para você. Produtos criativos,
              delicados e feitos à mão com muito carinho para deixar seus
              momentos ainda mais especiais.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rosa-lais/20 text-rosa-lais text-sm font-medium">
                <Heart className="w-4 h-4" aria-hidden="true" />
                Feito com amor
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dourado-suave/20 text-dourado-suave text-sm font-medium">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Artesanal
              </span>
            </div>
          </div>

          {footerSections.map((section) => (
            <nav
              key={section.title}
              aria-labelledby={`footer-${section.title.toLowerCase()}`}
            >
              <h3
                id={`footer-${section.title.toLowerCase()}`}
                className="font-semibold text-lg mb-4"
              >
                {section.title}
              </h3>
              <ul className="space-y-3" role="list">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-branco/70 hover:text-dourado-suave transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-semibold text-lg">Contato</h3>
            <ul className="space-y-3" role="list">
              {contactInfo.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 text-branco/70 hover:text-dourado-suave transition-colors text-sm"
                  >
                    <item.icon
                      className="w-5 h-5 text-dourado-suave flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div>
              <h3 className="font-semibold text-lg mb-4">Redes Sociais</h3>
              <SocialLinks links={socialLinks} variant="footer" />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-branco/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-branco/50 text-sm text-center lg:text-left">
              © {currentYear} Laís Inc Store. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-branco/50">
              <Link
                to="/politica-de-privacidade"
                className="hover:text-dourado-suave transition-colors"
              >
                Privacidade
              </Link>
              <Link
                to="/termos"
                className="hover:text-dourado-suave transition-colors"
              >
                Termos
              </Link>
              <Link
                to="/cookies"
                className="hover:text-dourado-suave transition-colors"
              >
                Cookies
              </Link>
            </div>
            <p className="text-branco/50 text-sm text-center lg:text-right">
              Feito com{" "}
              <span
                className="inline-flex items-center gap-1"
                aria-hidden="true"
              >
                <Heart className="w-4 h-4 text-rosa-lais" fill="currentColor" />
                <Sparkles
                  className="w-4 h-4 text-dourado-suave"
                  fill="currentColor"
                />
              </span>{" "}
              no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
