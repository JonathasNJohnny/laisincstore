import { useEffect } from "react";
import { X, Trash2, Plus, Minus, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../Button/Button";
import { formatCurrency } from "../../utils/currency";
import { useCart } from "../../contexts/CartContext";
import { getImageUrl } from "../../services/api";

export function CartDrawer() {
  const {
    items,
    isOpen,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    getItemCount,
    toggleCart,
  } = useCart();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        toggleCart();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, toggleCart]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const total = getTotal();
  const itemCount = getItemCount();
  const shipping = subtotal >= 29900 ? 0 : 1590; // Frete grátis acima de R$ 299,00

  return (
    <>
      <div
        className="fixed inset-0 bg-roxo-profundo/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={toggleCart}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-sm lg:max-w-md bg-branco z-50 flex flex-col shadow-2xl animate-slide-up"
        role="dialog"
        aria-label="Carrinho de compras"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-cinza-quente">
          <h2 className="font-serif text-xl font-bold text-roxo-profundo">
            Carrinho ({itemCount})
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 rounded-xl text-cinza-amarronzado hover:bg-cinza-quente/50 transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-cinza-quente/50 flex items-center justify-center mb-4">
                <Truck
                  className="w-8 h-8 text-cinza-amarronzado"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-medium text-grafite-arroxeado mb-1">
                Seu carrinho está vazio
              </h3>
              <p className="text-cinza-amarronzado text-sm mb-6">
                Adicione produtos lindos para começar sua compra
              </p>
              <Button asChild variant="primary">
                <Link to="/loja" onClick={toggleCart}>
                  Continuar comprando
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-cinza-quente/30 rounded-xl"
                >
                  <Link
                    to={`/produto/${item.product.slug}`}
                    className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden"
                    aria-label={`Ver ${item.product.name}`}
                  >
                    <img
                      src={getImageUrl(item.product.image)}
                      alt=""
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/produto/${item.product.slug}`}
                        className="font-medium text-grafite-arroxeado hover:text-rosa-lais transition-colors line-clamp-1 pr-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-cinza-amarronzado mt-0.5">
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-cinza-quente rounded-xl overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2 text-grafite-arroxeado hover:bg-cinza-quente/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="px-3 text-sm font-medium text-grafite-arroxeado">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 text-grafite-arroxeado hover:bg-cinza-quente/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-cinza-amarronzado hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label={`Remover ${item.product.name} do carrinho`}
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-cinza-quente space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cinza-amarronzado">Subtotal</span>
                  <span className="font-medium text-grafite-arroxeado">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cinza-amarronzado">Frete estimado</span>
                  <span className="font-medium text-grafite-arroxeado">
                    {shipping === 0 ? (
                      <span className="text-rosa-lais">Grátis!</span>
                    ) : (
                      formatCurrency(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && subtotal > 0 && (
                  <p className="text-xs text-rosa-lais text-center">
                    Faltam {formatCurrency(29900 - subtotal)} para frete grátis!
                  </p>
                )}
                <div className="flex justify-between text-lg font-bold text-roxo-profundo pt-2 border-t border-cinza-quente">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-cinza-quente space-y-3">
            <Button variant="secondary" fullWidth asChild>
              <Link to="/" onClick={toggleCart}>
                Continuar comprando
              </Link>
            </Button>
            <Button variant="primary" fullWidth asChild>
              <Link to="/carrinho" onClick={toggleCart}>
                Ver carrinho e finalizar
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
