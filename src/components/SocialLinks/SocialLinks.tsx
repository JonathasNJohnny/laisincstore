import {
  FaDiscord,
  FaInstagram,
  FaTiktok,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { SocialLink } from "../../types";

const socialIcons: Record<
  SocialLink["platform"],
  React.ComponentType<{ className?: string }>
> = {
  twitch: FaTwitch,
  youtube: FaYoutube,
  discord: FaDiscord,
  tiktok: FaTiktok,
  instagram: FaInstagram,
  twitter: FaTwitter,
};

const socialColors: Record<SocialLink["platform"], string> = {
  instagram: "hover:text-pink-500",
  twitter: "hover:text-sky-400",
  youtube: "hover:text-red-500",
  discord: "hover:text-violet-400",
  tiktok: "hover:text-pink-600",
  twitch: "hover:text-violet-500",
};

interface SocialLinksProps {
  links: SocialLink[];
  variant?: "default" | "compact" | "footer";
  className?: string;
}

export function SocialLinks({
  links,
  variant = "default",
  className = "",
}: SocialLinksProps) {
  const sizeClasses = {
    default: "w-5 h-5",
    compact: "w-4 h-4",
    footer: "w-5 h-5",
  };

  const gapClasses = {
    default: "gap-3",
    compact: "gap-2",
    footer: "gap-4",
  };

  const variantStyles = {
    default: "bg-cinza-quente/50 text-grafite-arroxeado hover:bg-rosa-lais/10",
    compact: "bg-cinza-quente/50 text-grafite-arroxeado hover:bg-rosa-lais/10",
    footer: "bg-branco/10 text-branco hover:bg-rosa-lais/20 hover:text-dourado-suave",
  };

  return (
    <nav
      className={`flex items-center ${gapClasses[variant]} ${className}`}
      aria-label="Redes sociais"
    >
      <ul className="flex items-center gap-3" role="list">
        {links.map((link) => {
          const Icon = socialIcons[link.platform];
          return (
            <li key={link.platform}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 ${variantStyles[variant]} ${socialColors[link.platform]} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais`}
                aria-label={link.label}
              >
                <Icon className={sizeClasses[variant]} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
