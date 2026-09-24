import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import { ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { getHeroBannerImageUrl, type HeroBanner } from "../../services/api";

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
  banners?: HeroBanner[];
}

function HeroBannerCarousel({ banners }: { banners: HeroBanner[] }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const hasMultipleBanners = banners.length > 1;

  useEffect(() => {
    setCurrentBanner(0);
  }, [banners.length]);

  useEffect(() => {
    if (!hasMultipleBanners) return;
    const timer = window.setInterval(
      () => setCurrentBanner((current) => (current + 1) % banners.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [banners.length, hasMultipleBanners]);

  const changeBanner = (direction: number) => {
    setCurrentBanner(
      (current) => (current + direction + banners.length) % banners.length,
    );
  };

  return (
    <section
      className="bg-branco px-4 pt-0 pb-0 sm:px-6"
      aria-label="Banners em destaque"
    >
      <div className="grid grid-cols-1 grid-rows-1 relative mx-auto w-full max-w-10xl overflow-hidden rounded-2xl shadow-sm">
        {banners.map((banner, index) => {
          const imageUrl = getHeroBannerImageUrl(banner);
          const content = (
            <div className="relative w-full overflow-hidden bg-branco rounded-2xl">
              <img
                src={imageUrl}
                alt="Banner em destaque"
                crossOrigin="anonymous"
                className="w-full h-auto block rounded-2xl object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          );
          const isCurrent = index === currentBanner;
          return (
            <div
              key={banner.id}
              className={`col-start-1 row-start-1 w-full transition-opacity duration-700 ${
                isCurrent ? "opacity-100 z-10" : "pointer-events-none opacity-0 z-0"
              }`}
              aria-hidden={!isCurrent}
            >
              {banner.redirect_link ? (
                banner.redirect_link.startsWith("/") ? (
                  <Link
                    to={banner.redirect_link}
                    tabIndex={isCurrent ? 0 : -1}
                    className="block w-full"
                  >
                    {content}
                  </Link>
                ) : (
                  <a
                    href={banner.redirect_link}
                    tabIndex={isCurrent ? 0 : -1}
                    className="block w-full"
                  >
                    {content}
                  </a>
                )
              ) : (
                content
              )}
            </div>
          );
        })}
        {hasMultipleBanners && (
          <>
            <button
              type="button"
              onClick={() => changeBanner(-1)}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-branco/85 p-2 text-roxo-profundo shadow-md transition hover:bg-branco focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais sm:left-5"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => changeBanner(1)}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-branco/85 p-2 text-roxo-profundo shadow-md transition hover:bg-branco focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais sm:right-5"
              aria-label="Próximo banner"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
            <div
              className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2"
              role="tablist"
              aria-label="Selecionar banner"
            >
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-branco ${index === currentBanner ? "w-7 bg-branco" : "w-2.5 bg-branco/60 hover:bg-branco"}`}
                  aria-label={`Exibir banner ${index + 1}`}
                  aria-selected={index === currentBanner}
                  role="tab"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function Hero({
  title = "Um universo de coisas lindas para você",
  subtitle = "Descubra produtos criativos, delicados e feitos para deixar seus momentos ainda mais especiais.",
  primaryAction = { label: "Conhecer a loja", href: "/loja" },
  secondaryAction = { label: "Ver novidades", href: "/loja?sort=newest" },
  className = "",
  banners = [],
}: HeroProps) {
  return (
    <>
      {banners.length > 0 && <HeroBannerCarousel banners={banners} />}
      <section
        className={`relative overflow-hidden bg-gradient-to-br from-cream via-branco to-cream px-6 pt-6 pb-7 sm:px-8 sm:pt-8 lg:px-12 lg:pt-12 ${className}`}
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
          />
        </div>
      </section>
    </>
  );
}
