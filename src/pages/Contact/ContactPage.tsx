import { useState } from "react";
import type { FormEvent } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import { SectionTitle } from "../../components/SectionTitle/SectionTitle";
import { Button } from "../../components/Button/Button";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular envio
    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "E-mail",
      value: "contato@laisinc.com",
      href: "mailto:contato@laisinc.com",
    },
    {
      icon: MapPin,
      title: "Endereço",
      value: "São Paulo - SP, Brasil",
      href: "#",
    },
    {
      icon: Phone,
      title: "WhatsApp",
      value: "(11) 99999-9999",
      href: "https://wa.me/5511999999999",
    },
    {
      icon: Clock,
      title: "Atendimento",
      value: "Seg a Sex: 9h às 18h",
      href: "#",
    },
  ];

  const subjects = [
    { value: "", label: "Selecione um assunto" },
    { value: "pedido", label: "Dúvida sobre pedido" },
    { value: "produto", label: "Informações sobre produto" },
    { value: "troca", label: "Troca ou devolução" },
    { value: "parceria", label: "Parcerias e colaborações" },
    { value: "outro", label: "Outro assunto" },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-rosa-lais mb-2 uppercase tracking-wide">
              Fale conosco
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-roxo-profundo mb-6">
              Adoramos ouvir você
            </h1>
            <p className="text-lg text-cinza-amarronzado leading-relaxed">
              Tem alguma dúvida, sugestão ou só quer mandar um oi? Estamos aqui
              para ajudar! Responderemos o mais rápido possível, com todo
              carinho.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-8">
            <SectionTitle
              title="Canais de atendimento"
              subtitle="Escolha como prefere falar com a gente"
            />

            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="p-6 bg-branco rounded-2xl border border-cinza-quete hover:shadow-xl hover:border-rosa-lais/50 transition-all"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  <div className="w-12 h-12 rounded-xl bg-rosa-lais/10 flex items-center justify-center mb-3">
                    <item.icon
                      className="w-6 h-6 text-rosa-lais"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold text-grafite-arroxeado mb-1">
                    {item.title}
                  </h3>
                  <p className="text-cinza-amarronzado text-sm">{item.value}</p>
                </a>
              ))}
            </div>

            <div className="p-6 bg-branco rounded-2xl border border-cinza-quete">
              <h3 className="font-serif text-lg font-bold text-roxo-profundo mb-4">
                Perguntas frequentes
              </h3>
              <div className="space-y-4">
                {[
                  {
                    q: "Qual o prazo de entrega?",
                    a: "O prazo varia conforme seu CEP e a forma de envio escolhida. Você pode simular no carrinho ou na página do produto.",
                  },
                  {
                    q: "Como faço para trocar um produto?",
                    a: "Entre em contato em até 7 dias após o recebimento. O produto deve estar sem uso e na embalagem original.",
                  },
                  {
                    q: "Vocês enviam para todo o Brasil?",
                    a: "Sim! Enviamos para todo o território nacional via Correios (PAC e SEDEX).",
                  },
                  {
                    q: "Posso personalizar meu pedido?",
                    a: "Muitos dos nossos produtos permitem personalização. Verifique na página do produto ou fale conosco!",
                  },
                ].map((faq, idx) => (
                  <details key={idx} className="group">
                    <summary className="flex items-center justify-between cursor-pointer font-medium text-grafite-arroxeado list-none">
                      {faq.q}
                      <MessageCircle
                        className="w-5 h-5 text-rosa-lais transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="text-cinza-amarronzado text-sm mt-2 pb-2 border-b border-cinza-quete">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8 shadow-sm sticky top-24">
              <SectionTitle
                title="Envie uma mensagem"
                subtitle="Preencha o formulário e retornaremos em breve"
              />
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-grafite-arroxeado mb-1"
                  >
                    Nome *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-grafite-arroxeado mb-1"
                  >
                    E-mail *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-grafite-arroxeado mb-1"
                  >
                    Assunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                  >
                    {subjects.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-grafite-arroxeado mb-1"
                  >
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent resize-y"
                    placeholder="Conte-nos como podemos ajudar..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={status === "loading"}
                >
                  {status === "success" ? (
                    <>
                      <Check className="w-5 h-5" aria-hidden="true" />
                      Enviado com sucesso!
                    </>
                  ) : status === "loading" ? (
                    <>
                      <Loader2
                        className="w-5 h-5 animate-spin"
                        aria-hidden="true"
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden="true" />
                      Enviar mensagem
                    </>
                  )}
                </Button>

                {status === "error" && (
                  <p className="text-sm text-red-500 text-center" role="alert">
                    Ops! Algo deu errado. Tente novamente mais tarde.
                  </p>
                )}

                <p className="text-xs text-cinza-amarronzado text-center">
                  Ao enviar, você concorda com nossa{" "}
                  <a
                    href="/politica-de-privacidade"
                    className="text-rosa-lais hover:underline"
                  >
                    Política de Privacidade
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
