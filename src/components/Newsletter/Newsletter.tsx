import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, Check } from "lucide-react";
import { Button } from "../Button/Button";

interface NewsletterProps {
  title?: string;
  description?: string;
  className?: string;
}

export function Newsletter({
  title = "Receba novidades no seu e-mail",
  description = "Cadastre-se e ganhe 10% de desconto na primeira compra. Prometemos só enviar coisas lindas!",
  className = "",
}: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Por favor, insira um e-mail válido");
      return;
    }

    setStatus("loading");
    setMessage("");

    // Simular chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Em produção, aqui faria a chamada real para a API
    try {
      // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      setStatus("success");
      setMessage(
        "Obrigada por se cadastrar! Verifique seu e-mail para confirmar.",
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Ops! Algo deu errado. Tente novamente mais tarde.");
    }
  };

  return (
    <section
      className={`relative bg-roxo-profundo p-6 sm:p-8 lg:p-12 text-center ${className}`}
      aria-labelledby="newsletter-title"
    >
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-rosa-lais/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-dourado-suave/20 rounded-full blur-3xl" />
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute text-dourado-suave/50"
            style={{
              top: `${10 + i * 20}%`,
              left: `${15 + i * 15}%`,
              fontSize: `${12 + i * 4}px`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div className="relative max-w-xl mx-auto">
        <h2
          id="newsletter-title"
          className="font-serif text-2xl sm:text-3xl font-bold text-branco mb-3"
        >
          {title}
        </h2>
        <p className="text-branco/80 mb-6">{description}</p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          noValidate
        >
          <label htmlFor="newsletter-email" className="visually-hidden">
            Seu e-mail
          </label>
          <div className="relative flex-1">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-branco/50"
              aria-hidden="true"
            />
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={status === "loading" || status === "success"}
              className="w-full pl-12 pr-4 py-3 bg-branco/10 border border-branco/20 rounded-xl text-branco placeholder-branco/50 focus:outline-none focus:ring-2 focus:ring-dourado-suave focus:border-transparent transition-all"
              aria-label="Seu e-mail"
              autoComplete="email"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={status === "loading"}
            className="whitespace-nowrap"
            disabled={status === "success"}
          >
            {status === "success" ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Cadastrado!
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm transition-all ${
              status === "success" ? "text-dourado-suave" : "text-red-300"
            }`}
            role="status"
            aria-live="polite"
          >
            {status === "success" && (
              <Check className="w-4 h-4 inline mr-1" aria-hidden="true" />
            )}
            {message}
          </p>
        )}

        <p className="mt-6 text-xs text-branco/40">
          Respeitamos sua privacidade. Seu e-mail não será compartilhado.
        </p>
      </div>
    </section>
  );
}
