import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getAdminOrders, type AdminOrder } from "../../services/api";
import { formatCurrencyReal } from "../../utils/currency";

export function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleLabel = (orderId: number | string) => {
    const key = String(orderId);
    setExpandedOrders((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  useEffect(() => {
    getAdminOrders()
      .then(({ orders }) => setOrders(orders))
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível carregar os pedidos.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  return (
    <section
      role="tabpanel"
      aria-label="Pedidos"
      className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
            Pedidos
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-roxo-profundo">
            Todos os pedidos
          </h2>
          <p className="mt-2 text-sm text-cinza-amarronzado">
            Histórico de compras de todos os clientes.
          </p>
        </div>
        <span className="text-sm text-cinza-amarronzado">
          {orders.length} pedido{orders.length === 1 ? "" : "s"}
        </span>
      </div>
      {loading ? (
        <p className="mt-8 text-cinza-amarronzado">Carregando pedidos...</p>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-8 rounded-xl border border-cinza-quente bg-cream p-6 text-center text-cinza-amarronzado">
          Nenhum pedido encontrado.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const paid = order.status === "paid",
              cancelled = order.status === "cancelled";
            const label = order.dadosParaEtiqueta;
            const labelExpanded = expandedOrders.has(String(order.id));
            const createdAt = order.created_at
              ? new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(order.created_at))
              : "—";
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-cinza-quente p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cinza-quente pb-4">
                  <div>
                    <h3 className="font-semibold text-roxo-profundo">
                      Pedido #{order.id}
                    </h3>
                    <p className="mt-1 text-sm text-grafite-arroxeado">
                      {order.customer.name} · {order.customer.email}
                    </p>
                    <p className="mt-1 text-xs text-cinza-amarronzado">
                      Cliente #{order.customer.id} · Criado em {createdAt}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${paid ? "bg-emerald-100 text-emerald-700" : cancelled ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}
                  >
                    {paid
                      ? "Pago"
                      : cancelled
                        ? "Cancelado"
                        : "Aguardando pagamento"}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-grafite-arroxeado">
                  {order.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex flex-wrap justify-between gap-3"
                    >
                      <span>
                        {item.quantity}×{" "}
                        {item.productName || `Produto #${item.productId}`}
                      </span>
                      <span>{formatCurrencyReal(Number(item.subtotal))}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cinza-quente pt-4 text-sm">
                  <span className="text-cinza-amarronzado">
                    {order.paid_at
                      ? `Pago em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.paid_at))}`
                      : "Ainda não pago"}
                  </span>
                  <span className="text-lg font-bold text-roxo-profundo">
                    {formatCurrencyReal(Number(order.total_amount))}{" "}
                    {order.currency}
                  </span>
                </div>
                {paid && label && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleLabel(order.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dourado-suave bg-dourado-suave/20 px-4 py-2.5 text-sm font-semibold text-roxo-profundo transition-colors hover:bg-dourado-suave/40"
                      aria-expanded={labelExpanded}
                    >
                      {labelExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      {labelExpanded ? "Ocultar etiqueta" : "Ver etiqueta de envio"}
                    </button>
                    {labelExpanded && <ShippingLabel label={label} />}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function display(value: unknown) {
  return value == null || value === "" ? "Não informado" : String(value);
}

function ShippingLabel({ label }: { label: NonNullable<AdminOrder["dadosParaEtiqueta"]> }) {
  const recipient = label.destinatario;
  const sender = label.remetente;
  const shipping = label.frete;
  const packageData = label.embalagem;

  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-grafite-arroxeado/40 bg-white p-5 text-sm text-grafite-arroxeado shadow-inner">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-grafite-arroxeado pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cinza-amarronzado">
            Etiqueta de envio
          </p>
          <h4 className="mt-1 text-xl font-black text-roxo-profundo">
            Pedido #{display(label.orderId)}
          </h4>
        </div>
        <div className="rounded-lg border border-grafite-arroxeado px-3 py-2 text-right font-mono text-xs font-bold">
          CEP destino
          <div className="text-base">{display(recipient?.postalCode)}</div>
        </div>
      </div>

      <div className="grid gap-5 border-b border-cinza-quente py-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-cinza-amarronzado">Remetente</p>
          <p className="mt-1 font-semibold">{display(sender?.nome)}</p>
          <p>CEP: {display(sender?.postalCode)}</p>
          <p>Documento: {display(sender?.documento)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-cinza-amarronzado">Destinatário</p>
          <p className="mt-1 font-semibold">{display(recipient?.recipient)}</p>
          <p>{display(recipient?.street)}, {display(recipient?.number)}</p>
          {recipient?.complement && <p>{recipient.complement}</p>}
          <p>{display(recipient?.neighborhood)} · {display(recipient?.city)} / {display(recipient?.state)}</p>
          <p>CEP: {display(recipient?.postalCode)}</p>
          <p>Telefone: {display(recipient?.phone)}</p>
          <p>E-mail: {display(recipient?.email)}</p>
        </div>
      </div>

      <div className="grid gap-4 border-b border-cinza-quente py-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-cinza-amarronzado">Frete</p>
          <p className="mt-1 font-semibold">{display(shipping?.name)} · {display(shipping?.company)}</p>
          <p>Serviço: {display(shipping?.serviceId)} · Prazo: {display(shipping?.deliveryTime)} dias</p>
          <p>Valor: {shipping?.price == null ? "Não informado" : formatCurrencyReal(Number(shipping.price))}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-cinza-amarronzado">Embalagem</p>
          <p className="mt-1 font-semibold">{display(packageData?.name)}</p>
          <p>{display(packageData?.heightCm)} × {display(packageData?.widthCm)} × {display(packageData?.lengthCm)} cm</p>
          <p>Peso: {packageData?.weightKg == null ? "Não informado" : `${packageData.weightKg} kg`}</p>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-xs font-bold uppercase text-cinza-amarronzado">Produtos</p>
        <ul className="mt-2 space-y-2">
          {(label.produtos ?? []).map((product) => (
            <li key={product.productId} className="flex flex-wrap justify-between gap-3 border-b border-cinza-quente/70 pb-2 last:border-0">
              <span>{display(product.quantity)}× {display(product.name)}</span>
              <span>{product.unitPrice == null ? "Não informado" : formatCurrencyReal(Number(product.unitPrice))} · {display(product.weightGrams)} g</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right font-bold text-roxo-profundo">
          Valor dos produtos: {label.valorProdutos == null ? "Não informado" : formatCurrencyReal(Number(label.valorProdutos))}
        </p>
        {!!label.camposPendentes?.length && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Campos pendentes: {label.camposPendentes.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
