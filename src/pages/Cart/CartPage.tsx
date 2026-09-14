import { Link } from "react-router-dom";
import { Trash2, ArrowLeft, Truck, RotateCcw, Shield } from "lucide-react";
import { Button } from "../../components/Button/Button";
import { QuantitySelector } from "../../components/QuantitySelector/QuantitySelector";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/currency";

export function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    clearCart,
  } = useCart();

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = subtotal >= 29900 ? 0 : 1590;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 lg:py-24">
        <div className="container text-center">
          <div className="w-24 h-24 rounded-full bg-cinza-quente/50 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-cinza-amarronzado"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-roxo-profundo mb-3">
            Seu carrinho está vazio
          </h1>
          <p className="text-cinza-amarronzado mb-8 max-w-md mx-auto">
            Parece que você ainda não adicionou nenhum produto. Que tal explorar
            nossa loja?
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

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        <div className="flex items-center gap-2 text-sm text-cinza-amarronzado mb-8">
          <Link to="/" className="hover:text-rosa-lais transition-colors">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-grafite-arroxeado font-medium">Carrinho</span>
        </div>

        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-roxo-profundo mb-8">
          Meu Carrinho
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <article
                key={item.product.id}
                className="flex gap-4 p-4 bg-branco rounded-2xl border border-cinza-quete shadow-sm"
              >
                <Link
                  to={`/produto/${item.product.slug}`}
                  className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden"
                  aria-label={`Ver ${item.product.name}`}
                >
                  <img
                    src={item.product.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/produto/${item.product.slug}`}
                      className="font-medium text-grafite-arroxeado hover:text-rosa-lais transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-cinza-amarronzado mt-1">
                      {item.product.category}
                    </p>
                    <p className="text-sm font-medium text-rosa-lais mt-2">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(qty) => updateQuantity(item.product.id, qty)}
                      min={1}
                      max={item.product.stock}
                      aria-label={`Quantidade de ${item.product.name}`}
                    />
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-cinza-amarronzado hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      aria-label={`Remover ${item.product.name} do carrinho`}
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-grafite-arroxeado">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </article>
            ))}

            <div className="flex items-center justify-between p-4 bg-branco rounded-2xl border border-cinza-quete">
              <Button variant="ghost" asChild>
                <Link to="/loja">
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Continuar comprando
                </Link>
              </Button>
              <button
                onClick={clearCart}
                className="text-sm text-cinza-amarronzado hover:text-red-500 transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <aside className="sticky top-24 space-y-6">
              <div className="bg-branco rounded-2xl border border-cinza-quete p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-roxo-profundo mb-4">
                  Resumo do pedido
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cinza-amarronzado">
                      Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                      itens)
                    </span>
                    <span className="font-medium text-grafite-arroxeado">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cinza-amarronzado">
                      Frete estimado
                    </span>
                    <span className="font-medium text-grafite-arroxeado">
                      {shipping === 0 ? (
                        <span className="text-rosa-lais">Grátis!</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-rosa-lais text-center bg-rosa-lais/10 rounded-xl py-2">
                      Faltam {formatCurrency(29900 - subtotal)} para frete
                      grátis!
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-bold text-roxo-profundo pt-3 border-t border-cinza-quete">
                    <span>Total</span>
                    <span>{formatCurrency(total + shipping)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button variant="primary" fullWidth size="lg" asChild>
                    <Link to="/checkout">Finalizar compra</Link>
                  </Button>
                  <Button variant="outline" fullWidth asChild>
                    <Link to="/loja">Continuar comprando</Link>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-cinza-quete grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-cinza-quente/30 rounded-xl">
                    <Truck
                      className="w-6 h-6 text-rosa-lais mx-auto mb-1"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-cinza-amarronzado">
                      Entrega rápida
                    </p>
                  </div>
                  <div className="p-3 bg-cinza-quente/30 rounded-xl">
                    <Shield
                      className="w-6 h-6 text-rosa-lais mx-auto mb-1"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-cinza-amarronzado">
                      Pagamento seguro
                    </p>
                  </div>
                  <div className="p-3 bg-cinza-quente/30 rounded-xl">
                    <RotateCcw
                      className="w-6 h-6 text-rosa-lais mx-auto mb-1"
                      aria-hidden="true"
                    />
                    <p className="text-xs text-cinza-amarronzado">
                      Troca fácil
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-rosa-lais/10 rounded-2xl p-6 text-center border border-rosa-lais/20">
                <p className="text-sm text-rosa-lais font-medium">
                  💝 Adicione mais {formatCurrency(29900 - subtotal)} para
                  ganhar frete grátis!
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
