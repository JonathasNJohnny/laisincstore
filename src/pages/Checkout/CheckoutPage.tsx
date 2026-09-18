import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Smartphone,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { useCart } from "../../contexts/CartContext";
import { getImageUrl } from "../../services/api";
import { formatCurrency } from "../../utils/currency";
import { useAuth } from "../../contexts/AuthContext";
import {
  ApiRequestError,
  createOrder,
  createPixPayment,
  type PixPayment,
} from "../../services/api";

const shippingOptions = [
  {
    id: "pac",
    name: "PAC - Entrega Econômica",
    description: "Entrega em 5 a 10 dias úteis",
    price: 1590,
    estimatedDays: "5-10 dias",
  },
  {
    id: "sedex",
    name: "SEDEX - Entrega Expressa",
    description: "Entrega em 1 a 3 dias úteis",
    price: 2990,
    estimatedDays: "1-3 dias",
  },
  {
    id: "retirada",
    name: "Retirar na loja",
    description: "Disponível em 1 dia útil",
    price: 0,
    estimatedDays: "1 dia",
  },
];

const paymentMethods = [
  {
    id: "pix",
    icon: Smartphone,
    label: "PIX",
    description: "Pagamento instantâneo com desconto de 5%",
  },
  {
    id: "credit",
    icon: CreditCard,
    label: "Cartão de Crédito",
    description: "Até 6x sem juros",
  },
  {
    id: "boleto",
    icon: FileText,
    label: "Boleto Bancário",
    description: "Vencimento em 3 dias úteis",
  },
];

export function CheckoutPage() {
  const { items, getSubtotal, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState(shippingOptions[0].id);
  const [payment, setPayment] = useState("pix");
  const [paymentError, setPaymentError] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const subtotal = getSubtotal();
  const selectedShipping = shippingOptions.find((s) => s.id === shipping);
  const shippingCost = selectedShipping?.price || 0;
  const total = getTotal() + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 lg:py-24">
        <div className="container text-center">
          <h1 className="font-serif text-3xl font-bold text-roxo-profundo mb-3">
            Carrinho vazio
          </h1>
          <p className="text-cinza-amarronzado mb-8">
            Adicione produtos para finalizar a compra.
          </p>
          <Button asChild variant="primary" size="lg">
            <Link to="/loja">
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Continuar comprando
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 4) return;
    if (step < 3) {
      setStep((prev) => prev + 1);
      return;
    }

    if (!user) {
      setPaymentError("Entre na sua conta para finalizar a compra.");
      return;
    }
    if (payment !== "pix") {
      setPaymentError("No momento, apenas o Pix via Mercado Pago está disponível.");
      return;
    }

    setIsCreatingPayment(true);
    setPaymentError("");
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        email: formData.email,
        shippingMethod: shipping,
        shippingAddress: {
          name: formData.name, phone: formData.phone, cpf: formData.cpf, cep: formData.cep,
          address: formData.address, number: formData.number, complement: formData.complement,
          neighborhood: formData.neighborhood, city: formData.city, state: formData.state,
        },
      });
      setPixPayment(await createPixPayment(order.id, formData.email));
      setStep(4);
    } catch (error) {
      const code = error instanceof ApiRequestError ? error.code : undefined;
      const messages: Record<string, string> = {
        MERCADO_PAGO_NOT_CONNECTED: "O Mercado Pago não está conectado. Avise a administração da loja.",
        MERCADO_PAGO_RECONNECT_REQUIRED: "A conta Mercado Pago precisa ser conectada novamente.",
        PAYMENT_ALREADY_PAID: "Este pedido já foi pago.",
        PAYMENT_INVALID_ORDER: "Este pedido não pode ser pago.",
        PAYMENT_ORDER_NOT_CONFIGURED: "O checkout ainda não foi configurado pela loja.",
        PAYMENT_PROVIDER_ERROR: "Não foi possível gerar o pagamento agora. Tente novamente.",
      };
      setPaymentError((code && messages[code]) || (error instanceof Error ? error.message : "Não foi possível iniciar o pagamento."));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const steps = [
    { number: 1, label: "Dados" },
    { number: 2, label: "Entrega" },
    { number: 3, label: "Pagamento" },
    { number: 4, label: "Confirmação" },
  ];

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        <div className="flex items-center gap-2 text-sm text-cinza-amarronzado mb-8">
          <Link
            to="/carrinho"
            className="hover:text-rosa-lais transition-colors"
          >
            Carrinho
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-grafite-arroxeado font-medium">Checkout</span>
        </div>

        <nav className="mb-8" aria-label="Progresso do checkout">
          <ol className="flex items-center justify-center gap-4" role="list">
            {steps.map((s, idx) => (
              <li key={s.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                    step >= s.number
                      ? "bg-dourado-suave text-roxo-profundo"
                      : "bg-cinza-quente text-cinza-amarronzado"
                  }`}
                  aria-current={step === s.number ? "step" : undefined}
                >
                  {step > s.number ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    s.number
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`hidden lg:block w-16 h-1 mx-2 rounded ${step > s.number ? "bg-dourado-suave" : "bg-cinza-quente"}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`hidden lg:block text-sm font-medium ${step >= s.number ? "text-roxo-profundo" : "text-cinza-amarronzado"}`}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-8 lg:gap-12"
        >
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <section
                className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8 shadow-sm"
                aria-labelledby="step1-title"
              >
                <h2
                  id="step1-title"
                  className="font-serif text-xl font-bold text-roxo-profundo mb-6"
                >
                  Dados do cliente
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-grafite-arroxeado mb-1"
                    >
                      Nome completo *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-grafite-arroxeado mb-1"
                    >
                      Telefone *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cpf"
                      className="block text-sm font-medium text-grafite-arroxeado mb-1"
                    >
                      CPF *
                    </label>
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      required
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <>
                <section
                  className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8 shadow-sm"
                  aria-labelledby="step2-title"
                >
                  <h2
                    id="step2-title"
                    className="font-serif text-xl font-bold text-roxo-profundo mb-6"
                  >
                    Endereço de entrega
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label
                        htmlFor="cep"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        CEP *
                      </label>
                      <input
                        id="cep"
                        name="cep"
                        type="text"
                        value={formData.cep}
                        onChange={handleInputChange}
                        required
                        placeholder="00000-000"
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        Endereço *
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="number"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        Número *
                      </label>
                      <input
                        id="number"
                        name="number"
                        type="text"
                        value={formData.number}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="complement"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        Complemento
                      </label>
                      <input
                        id="complement"
                        name="complement"
                        type="text"
                        value={formData.complement}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="neighborhood"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        Bairro *
                      </label>
                      <input
                        id="neighborhood"
                        name="neighborhood"
                        type="text"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        Cidade *
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-grafite-arroxeado mb-1"
                      >
                        Estado *
                      </label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-branco border border-cinza-quete rounded-xl text-grafite-arroxeado focus:outline-none focus:ring-2 focus:ring-rosa-lais focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        {[
                          "AC",
                          "AL",
                          "AP",
                          "AM",
                          "BA",
                          "CE",
                          "DF",
                          "ES",
                          "GO",
                          "MA",
                          "MT",
                          "MS",
                          "MG",
                          "PA",
                          "PB",
                          "PR",
                          "PE",
                          "PI",
                          "RJ",
                          "RN",
                          "RS",
                          "RO",
                          "RR",
                          "SC",
                          "SP",
                          "SE",
                          "TO",
                        ].map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section
                  className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8 shadow-sm"
                  aria-labelledby="shipping-title"
                >
                  <h2
                    id="shipping-title"
                    className="font-serif text-xl font-bold text-roxo-profundo mb-4"
                  >
                    Forma de envio
                  </h2>
                  <div
                    className="space-y-3"
                    role="radiogroup"
                    aria-label="Opções de frete"
                  >
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          shipping === option.id
                            ? "border-rosa-lais bg-rosa-lais/5"
                            : "border-cinza-quete hover:border-cinza-quente/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={shipping === option.id}
                          onChange={() => setShipping(option.id)}
                          className="sr-only"
                          aria-label={option.name}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-grafite-arroxeado">
                              {option.name}
                            </span>
                            <span className="font-bold text-rosa-lais">
                              {option.price === 0
                                ? "Grátis"
                                : formatCurrency(option.price)}
                            </span>
                          </div>
                          <p className="text-sm text-cinza-amarronzado mt-1">
                            {option.description}
                          </p>
                        </div>
                        <Truck
                          className="w-6 h-6 text-rosa-lais flex-shrink-0 mt-1"
                          aria-hidden="true"
                        />
                      </label>
                    ))}
                  </div>
                </section>
              </>
            )}

            {step === 3 && (
              <section
                className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8 shadow-sm"
                aria-labelledby="step3-title"
              >
                <h2
                  id="step3-title"
                  className="font-serif text-xl font-bold text-roxo-profundo mb-6"
                >
                  Forma de pagamento
                </h2>
                <div
                  className="space-y-3"
                  role="radiogroup"
                  aria-label="Formas de pagamento"
                >
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        payment === method.id
                          ? "border-rosa-lais bg-rosa-lais/5"
                          : "border-cinza-quete hover:border-cinza-quente/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={payment === method.id}
                        onChange={() => setPayment(method.id)}
                        className="sr-only"
                        aria-label={method.label}
                      />
                      <method.icon
                        className="w-8 h-8 text-rosa-lais flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-grafite-arroxeado">
                          {method.label}
                        </span>
                        <p className="text-sm text-cinza-amarronzado mt-0.5">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {payment === "pix" && (
                  <div className="mt-6 p-4 bg-dourado-suave/10 border border-dourado-suave/30 rounded-xl">
                    <p className="text-sm text-grafite-arroxeado">
                      <strong>Desconto de 5% aplicado:</strong> Total com
                      desconto:{" "}
                      <span className="font-bold text-rosa-lais">
                        {formatCurrency(Math.round(total * 0.95))}
                      </span>
                    </p>
                  </div>
                )}
                {paymentError && (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{paymentError}</p>
                )}
              </section>
            )}

            {step === 4 && (
              <section
                className="bg-branco rounded-2xl border border-cinza-quete p-6 lg:p-8 shadow-sm text-center"
                aria-labelledby="step4-title"
              >
                <div className="w-16 h-16 bg-rosa-lais/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check
                    className="w-8 h-8 text-rosa-lais"
                    aria-hidden="true"
                  />
                </div>
                <h2 id="step4-title" className="font-serif text-2xl font-bold text-roxo-profundo mb-3">
                  Pague com Pix
                </h2>
                <p className="text-cinza-amarronzado mb-6">
                  Seu pagamento está pendente. A confirmação ocorre automaticamente após o Mercado Pago processar o Pix.
                </p>
                {pixPayment?.qrCodeBase64 && (
                  <img
                    alt="QR Code Pix"
                    src={`data:image/jpeg;base64,${pixPayment.qrCodeBase64}`}
                    className="mx-auto mb-6 h-56 w-56 rounded-xl border border-cinza-quente object-contain"
                  />
                )}
                {pixPayment?.qrCode && (
                  <button type="button" onClick={() => void navigator.clipboard.writeText(pixPayment.qrCode!)} className="mb-4 rounded-xl border border-cinza-quente px-4 py-2 text-sm font-semibold text-grafite-arroxeado">
                    Copiar código Pix
                  </button>
                )}
                {pixPayment?.ticketUrl && (
                  <a href={pixPayment.ticketUrl} target="_blank" rel="noreferrer" className="mb-6 block text-sm font-semibold text-rosa-lais underline">Abrir pagamento em nova aba</a>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    clearCart();
                  }}
                  asChild
                >
                  <Link to="/">Voltar para a loja</Link>
                </Button>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-branco rounded-2xl border border-cinza-quete p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-roxo-profundo mb-4">
                Resumo do pedido
              </h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={getImageUrl(item.product.image)}
                      alt=""
                      crossOrigin="anonymous"
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-medium text-grafite-arroxeado truncate">
                        {item.product.name}
                      </p>
                      <p className="text-cinza-amarronzado">
                        Qtd: {item.quantity}
                      </p>
                      <p className="font-medium text-rosa-lais">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-cinza-quete pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-cinza-amarronzado">Subtotal</span>
                  <span className="font-medium text-grafite-arroxeado">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cinza-amarronzado">Frete</span>
                  <span className="font-medium text-grafite-arroxeado">
                    {shippingCost === 0
                      ? "Grátis"
                      : formatCurrency(shippingCost)}
                  </span>
                </div>
                {payment === "pix" && (
                  <div className="flex justify-between text-rosa-lais font-medium">
                    <span>Desconto PIX (5%)</span>
                    <span>-{formatCurrency(Math.round(total * 0.05))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-roxo-profundo pt-2 border-t border-cinza-quete">
                  <span>Total</span>
                  <span>
                    {payment === "pix"
                      ? formatCurrency(Math.round(total * 0.95))
                      : formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-cinza-quete space-y-2">
                <button
                  type="submit"
                  disabled={step < 3 || isCreatingPayment}
                  className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
                    step < 3
                      ? "bg-cinza-quete text-cinza-amarronzado cursor-not-allowed"
                      : step === 3
                        ? "bg-dourado-suave text-roxo-profundo hover:bg-dourado-suave/90"
                        : "bg-rosa-lais text-branco hover:bg-rosa-lais/90"
                  }`}
                >
                  {step < 3
                    ? "Continuar"
                    : step === 3
                      ? isCreatingPayment ? "Gerando Pix..." : "Gerar Pix"
                      : "Ver pedido"}
                </button>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => prev - 1)}
                    className="w-full py-3 rounded-xl font-medium text-sm text-cinza-amarronzado hover:text-rosa-lais transition-colors"
                  >
                    Voltar
                  </button>
                )}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
