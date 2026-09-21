import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../services/api";
import {
  connectMercadoPago,
  disconnectMercadoPago,
  getAdminOrders,
  getImageUrl,
  getMercadoPagoIntegration,
  getSuperFreteIntegration,
  saveSuperFreteIntegration,
  disconnectSuperFrete,
  type AdminOrder,
  type MercadoPagoIntegration,
  type SuperFreteIntegration,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrencyReal } from "../../utils/currency";

interface ProductFormState {
  id?: number;
  name: string;
  category: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  weightGrams: string;
  active: boolean;
  order: boolean;
}

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  weightGrams: "",
  active: true,
  order: false,
};

export function AdminPage() {
  const { user, loading: loadingAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"products" | "payment" | "orders">(() =>
    searchParams.has("mercadoPago") ? "payment" : "products",
  );
  const [integration, setIntegration] = useState<MercadoPagoIntegration | null>(null);
  const [loadingIntegration, setLoadingIntegration] = useState(false);
  const [integrationError, setIntegrationError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [superFreteIntegration, setSuperFreteIntegration] = useState<SuperFreteIntegration | null>(null);
  const [loadingSuperFrete, setLoadingSuperFrete] = useState(false);
  const [superFreteError, setSuperFreteError] = useState("");
  const [isSavingSuperFrete, setIsSavingSuperFrete] = useState(false);
  const [superFreteForm, setSuperFreteForm] = useState({ token: "", originPostalCode: "" });
  const [isSuperFreteHelpOpen, setIsSuperFreteHelpOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const isAdmin = user?.admin === true;
  const categoryOptions = Array.from(
    new Set(
      products
        .map((product) => String(product.category ?? "").trim())
        .filter(Boolean),
    ),
  ).sort((first, second) => first.localeCompare(second, "pt-BR"));
  const filteredCategories = categoryOptions.filter((category) =>
    category.toLocaleLowerCase("pt-BR").includes(
      form.category.trim().toLocaleLowerCase("pt-BR"),
    ),
  );

  useEffect(() => {
    if (!isAdmin || activeTab !== "products") {
      setLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        const data = await getProducts({ includeInactive: true });
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [activeTab, isAdmin]);

  const loadIntegration = async () => {
    setLoadingIntegration(true);
    setIntegrationError("");
    try {
      setIntegration(await getMercadoPagoIntegration());
    } catch (error) {
      setIntegration(null);
      setIntegrationError(error instanceof Error ? error.message : "Não foi possível consultar a conexão.");
    } finally {
      setLoadingIntegration(false);
    }
  };

  const loadSuperFreteIntegration = async () => {
    setLoadingSuperFrete(true);
    setSuperFreteError("");
    try {
      const currentIntegration = await getSuperFreteIntegration();
      setSuperFreteIntegration(currentIntegration);
      setSuperFreteForm((current) => ({
        ...current,
        originPostalCode: currentIntegration.originPostalCode ?? "",
      }));
    } catch (error) {
      setSuperFreteIntegration(null);
      setSuperFreteError(error instanceof Error ? error.message : "Não foi possível consultar a conexão.");
    } finally {
      setLoadingSuperFrete(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || activeTab !== "payment") return;
    const timer = window.setTimeout(() => {
      void loadIntegration();
      void loadSuperFreteIntegration();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (!isAdmin || activeTab !== "orders") return;
    setLoadingOrders(true);
    setOrdersError("");
    getAdminOrders()
      .then((response) => setOrders(response.orders))
      .catch((error) => setOrdersError(error instanceof Error ? error.message : "Não foi possível carregar os pedidos."))
      .finally(() => setLoadingOrders(false));
  }, [activeTab, isAdmin]);

  const handleConnectMercadoPago = async () => {
    setIsConnecting(true);
    setIntegrationError("");
    try {
      const { authorizationUrl } = await connectMercadoPago();
      window.location.assign(authorizationUrl);
    } catch (error) {
      setIntegrationError(error instanceof Error ? error.message : "Não foi possível iniciar a conexão.");
      setIsConnecting(false);
    }
  };

  const handleDisconnectMercadoPago = async () => {
    if (!window.confirm("Deseja desconectar a conta Mercado Pago?")) return;
    setIsConnecting(true);
    setIntegrationError("");
    try {
      await disconnectMercadoPago();
      await loadIntegration();
    } catch (error) {
      setIntegrationError(error instanceof Error ? error.message : "Não foi possível desconectar a conta.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveSuperFrete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = superFreteForm.token.trim();
    const originPostalCode = superFreteForm.originPostalCode.replace(/\D/g, "");

    if (!token || originPostalCode.length !== 8) {
      setSuperFreteError("Informe o token e um CEP de origem válido com oito dígitos.");
      return;
    }

    setIsSavingSuperFrete(true);
    setSuperFreteError("");
    try {
      await saveSuperFreteIntegration({ token, originPostalCode });
      setSuperFreteForm({ token: "", originPostalCode });
      await loadSuperFreteIntegration();
    } catch (error) {
      setSuperFreteError(error instanceof Error ? error.message : "Não foi possível salvar a conexão.");
    } finally {
      setIsSavingSuperFrete(false);
    }
  };

  const handleDisconnectSuperFrete = async () => {
    if (!window.confirm("Deseja desconectar a conta SuperFrete?")) return;
    setIsSavingSuperFrete(true);
    setSuperFreteError("");
    try {
      await disconnectSuperFrete();
      setSuperFreteForm({ token: "", originPostalCode: "" });
      await loadSuperFreteIntegration();
    } catch (error) {
      setSuperFreteError(error instanceof Error ? error.message : "Não foi possível desconectar a conta.");
    } finally {
      setIsSavingSuperFrete(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const weightGrams = Number(form.weightGrams);
      if (!Number.isInteger(weightGrams) || weightGrams <= 0) {
        throw new Error("Informe o peso em gramas como um número inteiro maior que zero.");
      }

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("category", form.category);
      payload.append("slug", form.slug || form.name);
      payload.append("description", form.description);
      payload.append("price", String(form.price));
      payload.append("stock", String(form.stock));
      payload.append("weightGrams", String(weightGrams));
      payload.append("active", form.active ? "1" : "0");
      payload.append("order", form.order ? "1" : "0");

      if (image) {
        payload.append("image", image);
      }

      if (form.id) {
        await updateProduct(form.id, payload);
      } else {
        await createProduct(payload);
      }

      const refreshed = await getProducts({ includeInactive: true });
      setProducts(refreshed);
      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      id: Number(product.id),
      name: product.name ?? "",
      category: product.category ?? "",
      slug: product.slug ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      weightGrams: product.weight_grams == null ? "" : String(product.weight_grams),
      active: Boolean(Number(product.active ?? 1)),
      order: Boolean(Number(product.order ?? 0)),
    });
    setImage(null);
    setSubmitError("");
  };

  const handleDelete = async (id: number | string) => {
    const confirmed = window.confirm("Deseja realmente remover este produto?");
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      setProducts((current) =>
        current.filter((product) => String(product.id) !== String(id)),
      );
    } catch (error) {
      console.error(error);
      window.alert("Não foi possível remover o produto.");
    }
  };

  const handleToggleOrder = async (product: any) => {
    try {
      const payload = new FormData();
      payload.append("order", product.order ? "0" : "1");
      await updateProduct(product.id, payload);

      setProducts((current) =>
        current.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, order: Number(product.order) ? 0 : 1 }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
      window.alert("Não foi possível atualizar o status de encomenda.");
    }
  };

  if (loadingAuth) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <main className="container py-32">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-bold text-roxo-profundo">
          Administrar
        </h1>
      </div>

      <div
        role="tablist"
        aria-label="Seções de administração"
        className="mb-8 flex w-fit rounded-xl border border-cinza-quente bg-branco p-1 shadow-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "products"}
          onClick={() => setActiveTab("products")}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "products"
              ? "bg-roxo-profundo text-branco"
              : "text-grafite-arroxeado hover:bg-rosa-lais/10"
          }`}
        >
          Produtos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "payment"}
          onClick={() => {
            setActiveTab("payment");
            void loadIntegration();
            void loadSuperFreteIntegration();
          }}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "payment"
              ? "bg-roxo-profundo text-branco"
              : "text-grafite-arroxeado hover:bg-rosa-lais/10"
          }`}
        >
          Integrações
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "orders"}
          onClick={() => setActiveTab("orders")}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "orders"
              ? "bg-roxo-profundo text-branco"
              : "text-grafite-arroxeado hover:bg-rosa-lais/10"
          }`}
        >
          Pedidos
        </button>
      </div>

      {activeTab === "products" ? (
      <div role="tabpanel" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">
            {form.id ? "Editar produto" : "Adicionar produto"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                Nome
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                required
              />
            </div>

            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                Categoria
              </label>
              <input
                value={form.category}
                onFocus={() => setIsCategoryMenuOpen(true)}
                onBlur={() => setIsCategoryMenuOpen(false)}
                onChange={(event) => {
                  setForm({ ...form, category: event.target.value });
                  setIsCategoryMenuOpen(true);
                }}
                autoComplete="off"
                className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                required
              />
              {isCategoryMenuOpen && filteredCategories.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-cinza-quente bg-branco p-1 shadow-lg">
                  {filteredCategories.map((category) => (
                    <li key={category}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setForm({ ...form, category });
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-grafite-arroxeado hover:bg-rosa-lais/10"
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value })
                }
                className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="min-h-28 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                  Preço
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                  className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                  Estoque
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({ ...form, stock: event.target.value })
                  }
                  className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                  Peso (g)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.weightGrams}
                  onChange={(event) =>
                    setForm({ ...form, weightGrams: event.target.value })
                  }
                  className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-grafite-arroxeado">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm({ ...form, active: event.target.checked })
                  }
                />
                Ativo
              </label>

              <label className="flex items-center gap-2 text-sm text-grafite-arroxeado">
                <input
                  type="checkbox"
                  checked={form.order}
                  onChange={(event) =>
                    setForm({ ...form, order: event.target.checked })
                  }
                />
                Encomenda
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                Imagem
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
                className="w-full rounded-xl border border-dashed border-cinza-quente bg-cream px-4 py-3"
              />
            </div>

            {submitError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {submitError}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo disabled:opacity-60"
              >
                {isSubmitting
                  ? "Salvando..."
                  : form.id
                    ? "Salvar alterações"
                    : "Adicionar produto"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-cinza-quente bg-branco px-5 py-3 font-semibold text-grafite-arroxeado"
              >
                Limpar
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">
            Lista de produtos
          </h2>

          {loading ? (
            <p className="text-cinza-amarronzado">Carregando produtos...</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-cinza-quente p-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      crossOrigin="anonymous"
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-roxo-profundo">
                            {product.name}
                          </h3>
                          <p className="text-sm font-medium text-rosa-lais">
                            {product.category || "Sem categoria"}
                          </p>
                          <p className="text-sm text-cinza-amarronzado">
                            {product.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleOrder(product)}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.order
                              ? "bg-rosa-lais text-branco"
                              : "bg-cinza-quente text-roxo-profundo"
                          }`}
                        >
                          {product.order ? "Encomenda" : "Pronta entrega"}
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-grafite-arroxeado">
                        <span>
                          R${" "}
                          {Number(product.price).toFixed(2).replace(".", ",")}
                        </span>
                        <span>Estoque: {product.stock}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-lg bg-roxo-profundo px-3 py-2 text-sm font-medium text-branco"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      ) : activeTab === "payment" ? (
        <section
          role="tabpanel"
          aria-label="Integrações Mercado Pago"
          className="max-w-2xl rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
            Integrações
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-roxo-profundo">Mercado Pago</h2>
              <p className="mt-2 text-sm text-cinza-amarronzado">A autenticação é feita com segurança no site do Mercado Pago. Nenhuma credencial é informada ou armazenada neste navegador.</p>
            </div>
            {loadingIntegration ? (
              <span className="rounded-full bg-cinza-quente px-3 py-1.5 text-sm font-semibold text-grafite-arroxeado">Consultando...</span>
            ) : (
              <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${integration?.connected ? "bg-emerald-100 text-emerald-700" : "bg-cinza-quente text-grafite-arroxeado"}`}>
                Status: {integration?.connected ? "Conectado ✓" : "Não conectado"}
              </span>
            )}
          </div>

          {searchParams.has("mercadoPago") && !loadingIntegration && integration?.connected && (
            <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Conta Mercado Pago conectada com sucesso.</p>
          )}
          {searchParams.has("mercadoPago") && !loadingIntegration && !integration?.connected && !integrationError && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">A conexão não foi concluída ou foi cancelada. Você pode tentar novamente quando quiser.</p>
          )}
          {integrationError && (
            <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{integrationError}</p>
          )}

          <div className="mt-8">
            {integration?.connected ? (
              <button type="button" onClick={handleDisconnectMercadoPago} disabled={isConnecting} className="rounded-xl border border-rose-300 px-5 py-3 font-semibold text-rose-700 disabled:opacity-60">{isConnecting ? "Desconectando..." : "Desconectar"}</button>
            ) : (
              <button type="button" onClick={handleConnectMercadoPago} disabled={loadingIntegration || isConnecting} className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo disabled:opacity-60">{isConnecting ? "Conectando..." : "Conectar Mercado Pago"}</button>
            )}
          </div>
          <div className="relative mt-10 border-t border-cinza-quente pt-8">
          <button
            type="button"
            aria-label="Como obter o token da SuperFrete"
            aria-expanded={isSuperFreteHelpOpen}
            onClick={() => setIsSuperFreteHelpOpen((isOpen) => !isOpen)}
            className="absolute right-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-cinza-quente bg-branco text-sm font-bold text-roxo-profundo shadow-sm transition-colors hover:bg-rosa-lais/10"
          >
            ?
          </button>
          {isSuperFreteHelpOpen && (
            <div role="tooltip" className="absolute right-0 top-16 z-10 w-72 rounded-xl border border-cinza-quente bg-branco p-4 text-sm leading-relaxed text-grafite-arroxeado shadow-lg">
              Acesse sua conta SuperFrete e procure as opções de integrações ou configurações para gerar e copiar o token de API. Cole-o aqui uma única vez; por segurança, ele não será exibido novamente.
            </div>
          )}
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
            Integrações &gt; SuperFrete
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-roxo-profundo">SuperFrete</h2>
              <p className="mt-2 text-sm text-cinza-amarronzado">
                Cole o token gerado na sua conta SuperFrete. Ele é enviado somente para o servidor e nunca é exibido ou salvo neste navegador.
              </p>
            </div>
            {loadingSuperFrete ? (
              <span className="rounded-full bg-cinza-quente px-3 py-1.5 text-sm font-semibold text-grafite-arroxeado">Consultando...</span>
            ) : (
              <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${superFreteIntegration?.connected ? "bg-emerald-100 text-emerald-700" : "bg-cinza-quente text-grafite-arroxeado"}`}>
                Status: {superFreteIntegration?.connected ? "Conectado" : "Não conectado"}
              </span>
            )}
          </div>

          {superFreteIntegration?.connected && (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Integração ativa. CEP de origem: {superFreteIntegration.originPostalCode ?? "não informado"}.
            </p>
          )}
          {superFreteError && (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{superFreteError}</p>
          )}

          <form onSubmit={handleSaveSuperFrete} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado" htmlFor="superfrete-token">Token secreto</label>
              <input
                id="superfrete-token"
                type="password"
                autoComplete="off"
                value={superFreteForm.token}
                onChange={(event) => setSuperFreteForm({ ...superFreteForm, token: event.target.value })}
                placeholder={superFreteIntegration?.connected ? "Informe outro token para substituir" : "Cole o token da SuperFrete"}
                className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-grafite-arroxeado" htmlFor="superfrete-origin-postal-code">CEP de origem</label>
              <input
                id="superfrete-origin-postal-code"
                inputMode="numeric"
                autoComplete="postal-code"
                value={superFreteForm.originPostalCode}
                onChange={(event) => setSuperFreteForm({ ...superFreteForm, originPostalCode: event.target.value })}
                placeholder="01001-000"
                className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                required
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={loadingSuperFrete || isSavingSuperFrete} className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo disabled:opacity-60">
                {isSavingSuperFrete ? "Salvando..." : "Salvar conexão"}
              </button>
              {superFreteIntegration?.connected && (
                <button type="button" onClick={handleDisconnectSuperFrete} disabled={isSavingSuperFrete} className="rounded-xl border border-rose-300 px-5 py-3 font-semibold text-rose-700 disabled:opacity-60">
                  Desconectar
                </button>
              )}
            </div>
          </form>
          </div>
        </section>
      ) : (
        <section role="tabpanel" aria-label="Pedidos" className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">Pedidos</p>
              <h2 className="mt-2 text-2xl font-semibold text-roxo-profundo">Todos os pedidos</h2>
              <p className="mt-2 text-sm text-cinza-amarronzado">Histórico de compras de todos os clientes.</p>
            </div>
            <span className="text-sm text-cinza-amarronzado">{orders.length} pedido{orders.length === 1 ? "" : "s"}</span>
          </div>

          {loadingOrders ? (
            <p className="mt-8 text-cinza-amarronzado">Carregando pedidos...</p>
          ) : ordersError ? (
            <p className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="mt-8 rounded-xl border border-cinza-quente bg-cream p-6 text-center text-cinza-amarronzado">Nenhum pedido encontrado.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {orders.map((order) => {
                const status = order.status === "paid"
                  ? { label: "Pago", className: "bg-emerald-100 text-emerald-700" }
                  : order.status === "cancelled"
                    ? { label: "Cancelado", className: "bg-rose-100 text-rose-700" }
                    : { label: "Aguardando pagamento", className: "bg-amber-100 text-amber-800" };
                const createdAt = order.created_at ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.created_at)) : "—";
                const paidAt = order.paid_at ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.paid_at)) : null;
                return (
                  <article key={order.id} className="rounded-2xl border border-cinza-quente p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cinza-quente pb-4">
                      <div>
                        <h3 className="font-semibold text-roxo-profundo">Pedido #{order.id}</h3>
                        <p className="mt-1 text-sm text-grafite-arroxeado">{order.customer.name} · {order.customer.email}</p>
                        <p className="mt-1 text-xs text-cinza-amarronzado">Cliente #{order.customer.id} · Criado em {createdAt}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-grafite-arroxeado">
                      {order.items.map((item) => <li key={item.productId} className="flex flex-wrap justify-between gap-3"><span>{item.quantity}× {item.productName || `Produto #${item.productId}`}</span><span>{formatCurrencyReal(Number(item.subtotal))}</span></li>)}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cinza-quente pt-4 text-sm">
                      <span className="text-cinza-amarronzado">{paidAt ? `Pago em ${paidAt}` : "Ainda não pago"}</span>
                      <span className="text-lg font-bold text-roxo-profundo">{formatCurrencyReal(Number(order.total_amount))} {order.currency}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
