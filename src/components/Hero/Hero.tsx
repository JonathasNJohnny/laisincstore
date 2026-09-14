import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import { Sparkles, Star } from "lucide-react";

interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  image?: string;
  className?: string;
}

export function Hero({
  title = "Um universo de coisas lindas para você",
  subtitle = "Descubra produtos criativos, delicados e feitos para deixar seus momentos ainda mais especiais.",
  primaryAction = { label: "Conhecer a loja", href: "/loja" },
  secondaryAction = { label: "Ver novidades", href: "/loja?sort=newest" },
  // image = "/images/hero/hero-main.jpg",
  className = "",
}: HeroProps) {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-cream via-branco to-cream px-6 pt-6 pb-20 sm:px-8 sm:pt-8 lg:px-12 lg:pt-12 ${className}`}
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-10 right-10 w-24 h-24 bg-rosa-lais/10 rounded-full blur-3xl animate-pulse-soft" />
        <div
          className="absolute bottom-20 left-10 w-32 h-32 bg-dourado-suave/10 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-roxo-medio/5 rounded-full blur-3xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`absolute text-dourado-suave animate-sparkle ${
              [
                "top-10 left-20",
                "top-20 right-30",
                "bottom-30 left-30",
                "bottom-10 right-20",
                "top-1/2 left-10",
              ][i - 1]
            }`}
            style={{
              animationDelay: `${i * 0.3}s`,
              fontSize: `${16 + i * 4}px`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <div className="flex-1 max-w-2xl text-center lg:text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rosa-lais/10 text-rosa-lais text-sm font-medium mb-6">
            <Sparkles
              className="w-4 h-4 animate-pulse-soft"
              aria-hidden="true"
            />
            <span>Novidades chegando em breve ✨</span>
          </div>
          <h1
            id="hero-title"
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-roxo-profundo leading-tight mb-4"
          >
            {title}
          </h1>
          <p className="text-lg lg:text-xl text-cinza-amarronzado mb-8 max-w-xl mx-auto lg:mx-0">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button size="lg" asChild>
              <Link to={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-cinza-amarronzado">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rosa-lais"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Feito à mão</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rosa-lais"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-rosa-lais"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              <span>Frete para todo Brasil</span>
            </div>
          </div>
        </div>

        <div
          className="relative flex-1 max-w-lg animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          {/* <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-rosa-lais/20 via-dourado-suave/20 to-roxo-medio/20 rounded-3xl blur-xl" />
            <img
              src={image}
              alt=""
              className="relative w-full h-full object-cover rounded-2xl shadow-2xl"
              loading="eager"
            />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-dourado-suave rounded-full flex items-center justify-center shadow-lg">
              <Sparkles
                className="w-12 h-12 text-roxo-profundo animate-pulse-soft"
                aria-hidden="true"
              />
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
