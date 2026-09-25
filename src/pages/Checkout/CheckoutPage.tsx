import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Smartphone,
  Check,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { useCart } from "../../contexts/CartContext";
import { getImageUrl, getShippingQuote, type ShippingQuote } from "../../services/api";
import { formatCurrency, formatCurrencyReal } from "../../utils/currency";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getCurrentUser, type User } from "../../services/users";
import {
  ApiRequestError,
  createCardPayment,
  createOrder,
  createPixPayment,
  getOrder,
  updateOrder,
  type Order,
  type PixPayment,
} from "../../services/api";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { QRCodeSVG } from "qrcode.react";

const mercadoPagoPublicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;

if (mercadoPagoPublicKey) initMercadoPago(mercadoPagoPublicKey);

const paymentMethods = [
  {
    id: "pix",
    icon: Smartphone,
    label: "PIX",
    description: "Pagamento instantâneo",
  },
  {
    id: "credit",
    icon: CreditCard,
    label: "Cartão de Crédito",
    description: "Até 6x sem juros",
  },
];

const noFreteOption: ShippingQuote = {
  serviceId: "no_frete",
  name: "NoFrete",
  company: "Administracao",
  price: 0,
  deliveryTime: 0,
};

const CHECKOUT_STORAGE_PREFIX = "laisinc_checkout_missing_fields";

const emptyCheckoutForm = {
  name: "",
  phone: "",
  cpf: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

type CheckoutForm = typeof emptyCheckoutForm;
type CheckoutField = keyof CheckoutForm;

function checkoutValuesFromUser(currentUser: User): Partial<CheckoutForm> {
  return {
    name: currentUser.recebedor || currentUser.nome || "",
    phone: currentUser.telefone || "",
    cpf: currentUser.cpf || "",
    cep: currentUser.cep || "",
    address: currentUser.rua || "",
    number: currentUser.numero || "",
    complement: currentUser.complemento || "",
    neighborhood: currentUser.bairro || "",
  };
}

function checkoutStorageKey(userId: User["id"]) {
  return `${CHECKOUT_STORAGE_PREFIX}:${userId}`;
}

function readStoredCheckoutFields(userId: User["id"]): Partial<CheckoutForm> {
  try {
    const stored = localStorage.getItem(checkoutStorageKey(userId));
    return stored ? JSON.parse(stored) as Partial<CheckoutForm> : {};
  } catch {
    return {};
  }
}

function formatOrderExpiry(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function CheckoutPage() {
  const { items, getSubtotal, getTotal, clearCart } = useCart();
  const { user, loading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const continueOrderId = searchParams.get("continueOrder");
  const isContinuingPayment = Boolean(continueOrderId);
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingQuote[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [payment, setPayment] = useState("pix");
  const [paymentError, setPaymentError] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>(emptyCheckoutForm);
  const [missingProfileFields, setMissingProfileFields] = useState<CheckoutField[]>([]);
  const [isLoadingContinuation, setIsLoadingContinuation] = useState(Boolean(continueOrderId));

  const subtotal = getSubtotal();
  const availableShippingOptions = user?.admin ? [...shippingOptions, noFreteOption] : shippingOptions;
  const selectedShipping = availableShippingOptions.find((s) => String(s.serviceId) === shipping);
  const isNoFreteSelected = selectedShipping?.serviceId === noFreteOption.serviceId;
  const shippingCost = selectedShipping?.price || 0;
  const total = getTotal() + Math.round(shippingCost * 100);
  const pixCode = pixPayment?.qrCode ?? order?.pixCopyPaste ?? "";
  const paymentTotal = order ? Number(order.total_amount) : total / 100;
  const orderId = order?.id;
  const orderStatus = order?.status;
  const orderTotalAmount = order?.total_amount;
  const orderEmail = order?.email;
  const orderSubtotal = order?.items.reduce((sum, item) => sum + Number(item.subtotal), 0) ?? 0;
  const orderShippingPrice = Number(order?.shipping_price ?? 0);
  const isOrderInvalid = order?.validOrder === false || order?.isExpired === true;
  const orderExpiry = formatOrderExpiry(order?.expiresAt);
  const userId = user?.id;
  const orderItemsSignature = order?.items.map((item) => `${item.productId}:${item.quantity}:${item.weightGrams ?? 0}`).join("|") ?? "";
  const shippingQuoteItems = useMemo(() => {
    if (isContinuingPayment) {
      return order?.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        weightGrams: Number(item.weightGrams ?? 0),
      })) ?? [];
    }
    return items.map((item) => ({ productId: item.product.id, quantity: item.quantity }));
  }, [isContinuingPayment, items, orderItemsSignature]);

  useEffect(() => {
    if (!user || isContinuingPayment) return;

    let active = true;
    const fillCheckoutFromProfile = async () => {
      try {
        // Busca a fonte atual dos dados cadastrados para este checkout.
        const currentUser = await getCurrentUser();
        if (!active) return;

        const profileValues = checkoutValuesFromUser(currentUser);
        const storedValues = readStoredCheckoutFields(currentUser.id);
        const missingFields = (Object.keys(emptyCheckoutForm) as CheckoutField[]).filter(
          (field) => !profileValues[field],
        );

        setMissingProfileFields(missingFields);
        setFormData((current) => {
          const next = { ...current };
          (Object.keys(emptyCheckoutForm) as CheckoutField[]).forEach((field) => {
            // Dados do cadastro sempre prevalecem; o navegador só completa lacunas.
            next[field] = profileValues[field] || storedValues[field] || current[field];
          });
          return next;
        });
      } catch {
        // O contexto ainda oferece os dados disponíveis se a atualização falhar.
        const profileValues = checkoutValuesFromUser(user);
        const storedValues = readStoredCheckoutFields(user.id);
        const missingFields = (Object.keys(emptyCheckoutForm) as CheckoutField[]).filter(
          (field) => !profileValues[field],
        );
        setMissingProfileFields(missingFields);
        setFormData((current) => {
          const next = { ...current };
          (Object.keys(emptyCheckoutForm) as CheckoutField[]).forEach((field) => {
            next[field] = profileValues[field] || storedValues[field] || current[field];
          });
          return next;
        });
      }
    };

    void fillCheckoutFromProfile();
    return () => { active = false; };
  }, [isContinuingPayment, user]);

  useEffect(() => {
    if (!user || !missingProfileFields.length) return;

    const missingValues = Object.fromEntries(
      missingProfileFields
        .filter((field) => formData[field].trim())
        .map((field) => [field, formData[field]]),
    );
    try {
      localStorage.setItem(checkoutStorageKey(user.id), JSON.stringify(missingValues));
    } catch {
      // O checkout continua funcional quando o armazenamento não está disponível.
    }
  }, [formData, missingProfileFields, user]);

  const destinationPostalCode = formData.cep.replace(/\D/g, "");

  useEffect(() => {
    if (isContinuingPayment && !orderId) return;

    setShipping("");
    if (!isContinuingPayment) setShippingOptions([]);

    if (!destinationPostalCode) {
      setShippingError("");
      setIsLoadingShipping(false);
      return;
    }

    if (destinationPostalCode.length !== 8) {
      setShippingError("Informe um CEP válido com oito dígitos para calcular o frete.");
      setIsLoadingShipping(false);
      return;
    }

    let active = true;
    setIsLoadingShipping(true);
    setShippingError("");

    void getShippingQuote(
      destinationPostalCode,
      shippingQuoteItems,
      isContinuingPayment ? orderId : undefined,
    )
      .then((options) => {
        if (!active) return;
        if (options.length === 0) {
          setShippingError("Não encontramos opções de entrega para este CEP.");
          return;
        }
        setShippingOptions(options);
        setShipping(String(options[0].serviceId));
      })
      .catch((error) => {
        if (!active) return;
        setShippingError(error instanceof Error ? error.message : "Não foi possível calcular o frete. Verifique o CEP e tente novamente.");
      })
      .finally(() => {
        if (active) setIsLoadingShipping(false);
      });

    return () => { active = false; };
  }, [destinationPostalCode, isContinuingPayment, orderId, shippingQuoteItems]);

  useEffect(() => {
    if (!orderId || orderStatus !== "pending_payment") return;
    const refreshOrder = async () => {
      try {
        const response = await getOrder(orderId);
        setOrder(response.order);
      } catch {
        // MantÃ©m o PIX visÃ­vel e tenta novamente no prÃ³ximo intervalo.
      }
    };
    void refreshOrder();
    const interval = window.setInterval(() => void refreshOrder(), 4000);
    return () => window.clearInterval(interval);
  }, [orderId, orderStatus]);

  useEffect(() => {
    if (!continueOrderId) return;
    if (!userId) {
      if (!isAuthLoading) setIsLoadingContinuation(false);
      return;
    }

    let active = true;
    setIsLoadingContinuation(true);
    void getOrder(continueOrderId)
      .then((response) => {
        if (!active) return;
        const resumedOrder = response.order;
        setOrder(resumedOrder);
        const savedAddress = resumedOrder.address;
        setFormData((current) => ({
          ...current,
          name: savedAddress?.recipient ?? current.name,
          phone: savedAddress?.phone ?? current.phone,
          cpf: savedAddress?.cpf ?? current.cpf,
          cep: savedAddress?.postalCode ?? current.cep,
          address: savedAddress?.street ?? current.address,
          number: savedAddress?.number ?? current.number,
          complement: savedAddress?.complement ?? current.complement,
          neighborhood: savedAddress?.neighborhood ?? current.neighborhood,
          city: savedAddress?.city ?? current.city,
          state: savedAddress?.state ?? current.state,
        }));
        const savedShipping = resumedOrder.shipping ?? {
          serviceId: "saved_order_shipping",
          name: "Frete selecionado",
          company: "Pedido original",
          price: Number(resumedOrder.shipping_price ?? 0),
          deliveryTime: 0,
          destinationPostalCode: savedAddress?.postalCode ?? "",
        };
        setShippingOptions([savedShipping]);
        setShipping(String(savedShipping.serviceId));

        if (resumedOrder.status !== "pending_payment") {
          setPaymentError("Este pedido nao esta disponivel para um novo pagamento.");
          return;
        }

        const lastPayment = resumedOrder.payment;
        if (lastPayment?.method === "pix" && lastPayment.status === "pending" && resumedOrder.pixCopyPaste) {
          setPayment("pix");
          setPixPayment({
            id: lastPayment.id,
            paymentId: String(lastPayment.id),
            status: "pending",
            qrCode: resumedOrder.pixCopyPaste,
          });
          setStep(4);
          return;
        }

        const paymentIsProcessing = lastPayment?.status === "pending" || lastPayment?.status === "in_process";
        if (paymentIsProcessing) {
          setPaymentError("Seu pagamento esta em processamento. Aguarde a confirmacao antes de tentar novamente.");
          setStep(3);
          return;
        }

        if (lastPayment?.method === "card") {
          setPayment("credit");
          if (lastPayment.status === "rejected") {
            setPaymentError(lastPayment.statusDetail === "cc_rejected_insufficient_amount"
              ? "Este cartao nao possui limite disponivel. Tente outro cartao ou PIX."
              : "O pagamento nao foi aprovado. Confira os dados ou tente outra forma de pagamento.");
          }
        } else {
          setPayment("pix");
        }
        setStep(1);
      })
      .catch((error) => {
        if (active) setPaymentError(error instanceof Error ? error.message : "Nao foi possivel carregar este pedido.");
      })
      .finally(() => {
        if (active) setIsLoadingContinuation(false);
      });

    return () => { active = false; };
  }, [continueOrderId, isAuthLoading, userId]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const orderDataFromForm = (shippingOption: ShippingQuote) => ({
    shipping: {
      serviceId: shippingOption.serviceId,
      name: shippingOption.name,
      company: shippingOption.company,
      price: shippingOption.price,
      deliveryTime: shippingOption.deliveryTime,
      destinationPostalCode,
    },
    address: {
      recipient: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      postalCode: destinationPostalCode,
      street: formData.address,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 4) return;
    if (step === 2 && (!shipping || (!isNoFreteSelected && (isLoadingShipping || shippingError)))) {
      setShippingError(shippingError || "Aguarde o cálculo do frete antes de continuar.");
      return;
    }
    if (step < 3) {
      if (step === 2 && order) {
        if (order.status !== "pending_payment") {
          setPaymentError("Este pedido nao pode mais ser alterado.");
          return;
        }
        setIsCreatingPayment(true);
        try {
          const response = await updateOrder(order.id, orderDataFromForm(selectedShipping!));
          setOrder(response.order);
        } catch (error) {
          setShippingError(error instanceof Error ? error.message : "Nao foi possivel atualizar o pedido.");
          return;
        } finally {
          setIsCreatingPayment(false);
        }
      }
      setStep((prev) => prev + 1);
      return;
    }

    if (!user) {
      setPaymentError("Entre na sua conta para finalizar a compra.");
      return;
    }
    if (!order && (!selectedShipping || destinationPostalCode.length !== 8)) {
      setPaymentError("Selecione uma opção de frete válida antes de finalizar o pedido.");
      return;
    }
    setIsCreatingPayment(true);
    setPaymentError("");
    try {
      const createdOrder = order ?? (await createOrder(orderDataFromForm(selectedShipping!))).order;
      if (!order) {
        setOrder(createdOrder);
        // O backend limpa o carrinho ao reservar o estoque para este pedido.
        await clearCart(false);
      }

      if (payment === "credit") return;
      if (payment !== "pix") {
        setPaymentError("Escolha PIX ou cartão de crédito para continuar.");
        return;
      }

      setPixCopied(false);
      setPixPayment(await createPixPayment(createdOrder.id));
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

  const handleCardSubmit = useCallback(async (cardData: {
    token: string;
    payment_method_id: string;
    installments: number;
    issuer_id?: string;
  }) => {
    if (!orderId) return;
    setIsCreatingPayment(true);
    setPaymentError("");
    try {
      await createCardPayment({
        orderId,
        cardToken: cardData.token,
        paymentMethodId: cardData.payment_method_id,
        installments: Number(cardData.installments),
        issuerId: cardData.issuer_id || undefined,
      });
      setStep(4);
    } catch (error) {
      let message = error instanceof Error ? error.message : "Nao foi possivel processar o cartao.";
      try {
        const response = await getOrder(orderId);
        setOrder(response.order);
        if (response.order.payment?.status === "rejected") {
          message = response.order.payment.statusDetail === "cc_rejected_insufficient_amount"
            ? "Este cartao nao possui limite disponivel. Tente outro cartao ou PIX."
            : "O pagamento nao foi aprovado. Confira os dados ou tente outra forma de pagamento.";
        }
      } catch {
        // Mantem a mensagem da tentativa original se a atualizacao do pedido falhar.
      }
      setPaymentError(message);
    } finally {
      setIsCreatingPayment(false);
    }
  }, [orderId]);

  const cardPaymentInitialization = useMemo(() => {
    if (orderTotalAmount === undefined) return undefined;
    return {
      amount: Number(orderTotalAmount),
      payer: { email: orderEmail },
    };
  }, [orderTotalAmount, orderEmail]);

  const cardPaymentCustomization = useMemo(() => ({
    visual: {
      style: {
        theme: theme === "dark" ? "dark" : "default",
      },
    },
  }), [theme]);

  const handleCardError = useCallback(() => {
    setPaymentError("Nao foi possivel carregar o formulario de cartao.");
  }, []);

  if (isLoadingContinuation) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 lg:py-24">
        <p className="text-cinza-amarronzado">Carregando pagamento...</p>
      </div>
    );
  }

  if (order && isOrderInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 lg:py-24">
        <div className="container max-w-lg text-center">
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Este pedido expirou.</p>
          {orderExpiry && <p className="mt-3 text-sm text-cinza-amarronzado">O prazo para pagamento expirou em {orderExpiry}.</p>}
          <Link to="/perfil/pedidos" className="mt-5 inline-flex rounded-xl bg-rosa-lais px-4 py-2.5 font-semibold text-branco">Voltar aos pedidos</Link>
        </div>
      </div>
    );
  }

  if (continueOrderId && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 lg:py-24">
        <div className="container max-w-lg text-center">
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{paymentError || "Nao foi possivel carregar este pagamento."}</p>
          <Link to="/perfil/pedidos" className="mt-5 inline-flex rounded-xl bg-rosa-lais px-4 py-2.5 font-semibold text-branco">Voltar aos pedidos</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !order) {
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

  const copyPixCode = async () => {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
  };

  const steps = [
    { number: 1, label: "Recebedor" },
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

        {isContinuingPayment && orderExpiry && (
          <p className="mb-6 rounded-xl border border-dourado-suave/40 bg-dourado-suave/10 px-4 py-3 text-sm text-grafite-arroxeado">
            Este pedido pode ser pago ate {orderExpiry}.
          </p>
        )}

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
                  Dados do recebedor
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
                  {isLoadingShipping && (
                    <p className="mb-4 rounded-xl bg-cream px-4 py-3 text-sm text-grafite-arroxeado">
                      Calculando as opções de frete para este CEP...
                    </p>
                  )}
                  {shippingError && (
                    <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {shippingError}
                    </p>
                  )}
                  {!isLoadingShipping && !shippingError && !destinationPostalCode && (
                    <p className="mb-4 rounded-xl bg-cream px-4 py-3 text-sm text-cinza-amarronzado">
                      Informe o CEP de entrega para ver as opções de frete.
                    </p>
                  )}
                  <div
                    className="space-y-3"
                    role="radiogroup"
                    aria-label="Opções de frete"
                  >
                    {availableShippingOptions.map((option) => (
                      <label
                        key={option.serviceId}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          shipping === String(option.serviceId)
                            ? "border-rosa-lais bg-rosa-lais/5"
                            : "border-cinza-quete hover:border-cinza-quente/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={String(option.serviceId)}
                          checked={shipping === String(option.serviceId)}
                          onChange={() => setShipping(String(option.serviceId))}
                          disabled={isLoadingShipping && option.serviceId !== noFreteOption.serviceId}
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
                                : formatCurrencyReal(option.price)}
                            </span>
                          </div>
                          <p className="text-sm text-cinza-amarronzado mt-1">
                            {option.company} · {option.deliveryTime} {option.deliveryTime === 1 ? "dia útil" : "dias úteis"}
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

                {payment === "credit" && !order && (
                  <p className="mt-6 text-sm text-cinza-amarronzado">
                    Confirme para criar o pedido e carregar o formulário seguro do Mercado Pago.
                  </p>
                )}
                {payment === "credit" && order && (
                  <div className="mt-6 rounded-xl border border-cinza-quente p-4">
                    {mercadoPagoPublicKey && cardPaymentInitialization ? (
                      <CardPayment
                        initialization={cardPaymentInitialization}
                        customization={cardPaymentCustomization}
                        locale="pt-BR"
                        onSubmit={handleCardSubmit}
                        onError={handleCardError}
                      />
                    ) : (
                      <p className="text-sm text-rose-700">Configure VITE_MERCADO_PAGO_PUBLIC_KEY para habilitar pagamento com cartão.</p>
                    )}
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
                  {order?.status === "paid" ? "Pagamento aprovado" : payment === "credit" ? "Pagamento em processamento" : "Pague com Pix"}
                </h2>
                <p className="text-cinza-amarronzado mb-6">
                  {order?.status === "paid"
                    ? "Pagamento realizado com Pix. Obrigada pela compra!"
                    : "Seu pagamento está pendente. A confirmação é atualizada automaticamente."}
                </p>
                {order?.status !== "paid" && (
                  <p className="mb-5 text-lg font-semibold text-roxo-profundo">
                    Valor a pagar: {formatCurrencyReal(paymentTotal)}
                  </p>
                )}
                {order?.status !== "paid" && pixCode ? (
                  <div className="mx-auto mb-6 flex h-56 w-56 items-center justify-center rounded-xl border border-cinza-quente bg-branco p-3">
                    <QRCodeSVG value={pixCode} size={200} level="M" includeMargin />
                  </div>
                ) : order?.status !== "paid" && pixPayment?.qrCodeBase64 && (
                  <img
                    alt="QR Code Pix"
                    src={pixPayment.qrCodeBase64.startsWith("data:image/")
                      ? pixPayment.qrCodeBase64
                      : `data:image/png;base64,${pixPayment.qrCodeBase64}`}
                    className="mx-auto mb-6 h-56 w-56 rounded-xl border border-cinza-quente object-contain"
                  />
                )}
                {order?.status !== "paid" && pixCode && (
                  <div className="mx-auto mb-6 max-w-lg text-left">
                    <label htmlFor="pix-copy-paste" className="mb-2 block text-sm font-semibold text-grafite-arroxeado">
                      Pix copia e cola
                    </label>
                    <textarea
                      id="pix-copy-paste"
                      value={pixCode}
                      readOnly
                      rows={4}
                      className="w-full resize-none rounded-xl border border-cinza-quente bg-cream p-3 text-xs text-grafite-arroxeado"
                    />
                    <button type="button" onClick={() => void copyPixCode()} className="mt-3 rounded-xl border border-cinza-quente px-4 py-2 text-sm font-semibold text-grafite-arroxeado">
                      {pixCopied ? "Código Pix copiado" : "Copiar código Pix"}
                    </button>
                  </div>
                )}
                {order?.status !== "paid" && !pixCode && !pixPayment?.qrCodeBase64 && (
                  <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Não foi possível carregar os dados do Pix. Tente gerar o pagamento novamente.
                  </p>
                )}
                {order?.status !== "paid" && pixPayment?.ticketUrl && (
                  <a href={pixPayment.ticketUrl} target="_blank" rel="noreferrer" className="mb-6 block text-sm font-semibold text-rosa-lais underline">Abrir pagamento em nova aba</a>
                )}
                <div className="flex flex-wrap justify-center gap-3">
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
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/perfil/pedidos">Meus pedidos</Link>
                  </Button>
                </div>
              </section>
            )}
          </div>

          {step !== 4 && (
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-branco rounded-2xl border border-cinza-quete p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-roxo-profundo mb-4">
                Resumo do pedido
              </h3>
              <div className="space-y-3 mb-4">
                {order ? order.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt=""
                        crossOrigin="anonymous"
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-rosa-lais/10 text-xs font-semibold text-rosa-lais">Item</div>
                    )}
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-medium text-grafite-arroxeado truncate">
                        {item.productName || `Produto #${item.productId}`}
                      </p>
                      <p className="text-cinza-amarronzado">Qtd: {item.quantity}</p>
                      <p className="font-medium text-rosa-lais">{formatCurrencyReal(Number(item.subtotal))}</p>
                    </div>
                  </div>
                )) : items.map((item) => (
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
                    {order ? formatCurrencyReal(orderSubtotal) : formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cinza-amarronzado">Frete</span>
                  <span className="font-medium text-grafite-arroxeado">
                    {order
                      ? orderShippingPrice === 0
                        ? "GrÃ¡tis"
                        : formatCurrencyReal(orderShippingPrice)
                      : !selectedShipping
                      ? "A calcular"
                      : shippingCost === 0
                      ? "Grátis"
                      : formatCurrencyReal(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-roxo-profundo pt-2 border-t border-cinza-quete">
                  <span>Total</span>
                  <span>{order ? formatCurrencyReal(Number(order.total_amount)) : formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-cinza-quete space-y-2">
                <button
                  type="submit"
                  disabled={isCreatingPayment || step === 4 || (step === 2 && (!shipping || (!isNoFreteSelected && (isLoadingShipping || Boolean(shippingError))))) || (payment === "credit" && Boolean(order)) || order?.payment?.status === "pending" || order?.payment?.status === "in_process"}
                  className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
                    step < 3
                      ? "bg-dourado-suave text-roxo-profundo hover:bg-dourado-suave/90"
                      : step === 3
                        ? "bg-dourado-suave text-roxo-profundo hover:bg-dourado-suave/90"
                        : "bg-rosa-lais text-branco hover:bg-rosa-lais/90"
                  }`}
                >
                  {step < 3
                    ? "Continuar"
                    : step === 3
                      ? isCreatingPayment
                        ? "Processando..."
                        : order?.payment?.status === "pending" || order?.payment?.status === "in_process"
                          ? "Pagamento em processamento"
                        : payment === "credit"
                          ? order ? "Preencha o cartão abaixo" : "Continuar para cartão"
                          : "Gerar Pix"
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
          )}
        </form>
      </div>
    </div>
  );
}
