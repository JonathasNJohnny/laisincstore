import type { BadgeType } from "../../types";

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

export function Badge({ type, className = "" }: BadgeProps) {
  const styles = {
    Novo: "bg-rosa-lais text-branco",
    Oferta: "bg-dourado-suave text-roxo-profundo",
    Destaque: "bg-roxo-medio text-branco",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${styles[type]} ${className}`}
      aria-label={type}
    >
      {type}
    </span>
  );
}
