import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../contexts/AuthContext";
import { getOrders, type Order } from "../../services/api";
import { formatCurrencyReal } from "../../utils/currency";

const statusInfo = {
  pending_payment: { label: "Aguardando pagamento", className: "bg-amber-100 text-amber-800" },
  paid: { label: "Pago", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelado", className: "bg-rose-100 text-rose-800" },
} as const;

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function canContinuePayment(order: Order) {
  return order.status === "pending_payment" &&
    (!order.payment || ["rejected", "pending", "in_process"].includes(order.payment.status));
}

function rejectedPaymentMessage(statusDetail?: string | null) {
  if (statusDetail === "cc_rejected_insufficient_amount") {
    return "Este cartao nao possui limite disponivel. Tente outro cartao ou PIX.";
  }
  return "O pagamento nao foi aprovado. Confira os dados ou tente outra forma de pagamento.";
}

export function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!user) return;
    getOrders()
      .then((response) => setOrders(response.orders))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Não foi possível carregar seus pedidos."))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!loading && !user) { navigate("/"); return null; }
  if (!user) return null;

  const copyPixCode = async (orderId: string | number, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedOrderId(orderId);
      window.setTimeout(() => setCopiedOrderId(null), 2000);
    } catch {
      setError("Não foi possível copiar o código PIX. Selecione-o e copie manualmente.");
    }
  };

  return (
    <main className="container max-w-4xl py-12 lg:py-20">
      <Link to="/perfil" className="inline-flex items-center gap-2 text-sm font-medium text-cinza-amarronzado transition-colors hover:text-rosa-lais">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar ao perfil
      </Link>
      <h1 className="mt-5 font-serif text-3xl font-bold text-roxo-profundo">Meus pedidos</h1>
      <p className="mt-2 text-cinza-amarronzado">Acompanhe seus pedidos, do mais recente ao mais antigo.</p>

      {isLoading ? (
        <p className="mt-8 text-cinza-amarronzado">Carregando pedidos...</p>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-cinza-quente bg-branco p-10 text-center shadow-sm">
          <Package className="mx-auto h-10 w-10 text-cinza-amarronzado" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-xl font-bold text-roxo-profundo">Você ainda não fez pedidos</h2>
          <Link to="/loja" className="mt-5 inline-flex rounded-xl bg-rosa-lais px-4 py-2.5 font-semibold text-branco">Ir para a loja</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = statusInfo[order.status];
            const canContinue = canContinuePayment(order);
            const paymentIsProcessing = order.payment?.status === "pending" || order.payment?.status === "in_process";
            return <article key={order.id} className="rounded-2xl border border-cinza-quente bg-branco p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cinza-quente pb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-roxo-profundo">Pedido #{order.id}</h2>
                  <p className="mt-1 text-sm text-cinza-amarronzado">Realizado em {formatDate(order.created_at)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-grafite-arroxeado">
                {order.items.map((item) => <li key={item.productId} className="flex justify-between gap-4"><span>{item.quantity}× produto #{item.productId}</span><span className="font-medium">{formatCurrencyReal(Number(item.subtotal))}</span></li>)}
              </ul>
              <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-cinza-quente pt-4 text-sm">
                <span className="text-cinza-amarronzado">{order.paid_at ? `Pago em ${formatDate(order.paid_at)}` : "Pagamento ainda não confirmado"}</span>
                <span className="text-lg font-bold text-roxo-profundo">Total: {formatCurrencyReal(Number(order.total_amount))}</span>
              </div>
              {order.status === "paid" && order.pixCopyPaste ? (
                <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  Pagamento realizado com PIX.
                </p>
              ) : order.pixCopyPaste && (
                <div className="mt-5 rounded-xl border border-dourado-suave/40 bg-dourado-suave/10 p-4">
                  <h3 className="font-semibold text-roxo-profundo">Pagar com PIX</h3>
                  <p className="mt-1 text-sm text-cinza-amarronzado">Escaneie o QR Code ou copie o código para pagar no aplicativo do seu banco.</p>
                  <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="rounded-xl bg-branco p-3">
                      <QRCodeSVG value={order.pixCopyPaste} size={160} level="M" includeMargin />
                    </div>
                    <div className="min-w-0 flex-1">
                      <code className="block max-h-24 overflow-y-auto break-all rounded-lg bg-branco p-3 text-xs text-grafite-arroxeado">{order.pixCopyPaste}</code>
                      <button type="button" onClick={() => void copyPixCode(order.id, order.pixCopyPaste!)} className="mt-3 rounded-xl bg-rosa-lais px-4 py-2 text-sm font-semibold text-branco">
                        {copiedOrderId === order.id ? "Código copiado!" : "Copiar código PIX"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {order.payment?.status === "rejected" && (
                <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {rejectedPaymentMessage(order.payment.statusDetail)}
                </p>
              )}
              {canContinue && (
                <div className="mt-5 rounded-xl border border-cinza-quente bg-cream/60 p-4">
                  {paymentIsProcessing ? (
                    <>
                      <p className="text-sm text-cinza-amarronzado">Seu pagamento esta em processamento. Atualize a pagina em instantes antes de tentar novamente.</p>
                      <button type="button" disabled className="mt-3 rounded-xl bg-cinza-quente px-4 py-2 text-sm font-semibold text-cinza-amarronzado">Pagamento em processamento</button>
                    </>
                  ) : (
                    <Link to={`/checkout?continueOrder=${encodeURIComponent(order.id)}`} className="inline-flex rounded-xl bg-rosa-lais px-4 py-2 text-sm font-semibold text-branco">
                      Continuar pagamento
                    </Link>
                  )}
                </div>
              )}
            </article>;
          })}
        </div>
      )}
    </main>
  );
}
