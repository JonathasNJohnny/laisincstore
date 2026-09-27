import { useEffect, useState } from "react";
import { getAdminOrders, type AdminOrder } from "../../services/api";
import { formatCurrencyReal } from "../../utils/currency";

export function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
