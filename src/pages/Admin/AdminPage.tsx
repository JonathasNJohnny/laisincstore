import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  createProduct,
  createHeroBanner,
  deleteHeroBanner,
  getAdminHeroBanners,
  deleteProduct,
  getProducts,
  getHeroBannerImageUrl,
  type HeroBanner,
  updateHeroBanner,
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
import { invalidateProductsCache } from "../../components/ProductList/ProductList";

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

interface SavedImage {
  id: number | string;
  url: string;
  name: string;
}

interface BannerFormState {
  id?: number | string;
  imageUrl: string;
  redirectLink: string;
  active: boolean;
  position: string;
}

const emptyBannerForm: BannerFormState = {
  imageUrl: "",
  redirectLink: "",
  active: true,
  position: "0",
};

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
  const [activeTab, setActiveTab] = useState<"products" | "banners" | "payment" | "orders">(() =>
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
  const [images, setImages] = useState<File[]>([]);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [expandedImage, setExpandedImage] = useState<SavedImage | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [bannerForm, setBannerForm] = useState<BannerFormState>(emptyBannerForm);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [isSavingBanner, setIsSavingBanner] = useState(false);
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

  const loadBanners = async () => {
    setLoadingBanners(true);
    setBannerError("");
    try {
      const data = await getAdminHeroBanners();
      setBanners(data.slice().sort((first, second) => Number(first.position ?? 0) - Number(second.position ?? 0)));
    } catch (error) {
      setBannerError(error instanceof Error ? error.message : "Não foi possível carregar os banners.");
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || activeTab !== "banners") return;
    void loadBanners();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (!bannerImage) {
      setBannerPreview("");
      return;
    }
    const preview = URL.createObjectURL(bannerImage);
    setBannerPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [bannerImage]);

  useEffect(() => {
    const previews = images.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);

    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [images]);

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

  const resetBannerForm = () => {
    setBannerForm(emptyBannerForm);
    setBannerImage(null);
    setBannerError("");
  };

  const handleBannerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const position = Number(bannerForm.position);
    if (!Number.isInteger(position) || position < 0) {
      setBannerError("Informe uma posição inteira igual ou maior que zero.");
      return;
    }
    if (!bannerImage && !bannerForm.imageUrl.trim() && !bannerForm.id) {
      setBannerError("Envie uma imagem ou informe a URL da imagem.");
      return;
    }

    setIsSavingBanner(true);
    setBannerError("");
    try {
      const payload = new FormData();
      if (bannerImage) payload.append("image", bannerImage);
      if (bannerForm.imageUrl.trim()) payload.append("image_url", bannerForm.imageUrl.trim());
      payload.append("redirect_link", bannerForm.redirectLink.trim());
      payload.append("active", bannerForm.active ? "1" : "0");
      payload.append("position", String(position));

      if (bannerForm.id) {
        await updateHeroBanner(bannerForm.id, payload);
      } else {
        await createHeroBanner(payload);
      }
      resetBannerForm();
      await loadBanners();
    } catch (error) {
      setBannerError(error instanceof Error ? error.message : "Não foi possível salvar o banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleEditBanner = (banner: HeroBanner) => {
    setBannerForm({
      id: banner.id,
      imageUrl: banner.image_url ?? banner.image ?? "",
      redirectLink: banner.redirect_link ?? "",
      active: banner.active !== 0 && banner.active !== false && banner.active !== "0",
      position: String(banner.position ?? 0),
    });
    setBannerImage(null);
    setBannerError("");
  };

  const handleDeleteBanner = async (id: number | string) => {
    if (!window.confirm("Deseja realmente excluir este banner?")) return;
    try {
      await deleteHeroBanner(id);
      if (String(bannerForm.id) === String(id)) resetBannerForm();
      await loadBanners();
    } catch (error) {
      setBannerError(error instanceof Error ? error.message : "Não foi possível excluir o banner.");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImages([]);
    setSavedImages([]);
    setExpandedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setSubmitError("");
  };

  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (selectedFiles.some((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setSubmitError("Use imagens JPG, PNG, WEBP ou GIF de até 5 MB.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setImages((current) => {
      const next = [...current, ...selectedFiles].slice(0, Math.max(0, 10 - savedImages.length));
      if (savedImages.length + current.length + selectedFiles.length > 10) {
        setSubmitError("Cada produto pode ter no máximo 10 imagens.");
      }
      return next;
    });
    if (imageInputRef.current) imageInputRef.current.value = "";
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

      images.forEach((image) => payload.append("images", image));

      if (form.id) {
        await updateProduct(form.id, payload);
      } else {
        await createProduct(payload);
      }

      invalidateProductsCache();
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
    setImages([]);
    const uploadedImages = (product.uploads ?? [])
      .slice()
      .sort((first: { position?: number }, second: { position?: number }) => (first.position ?? 0) - (second.position ?? 0))
      .map((upload: { id: number | string; url: string }, index: number) => ({
        id: upload.id,
        url: upload.url,
        name: `Imagem ${index + 1}`,
      }));
    const productImages = uploadedImages.length > 0
      ? uploadedImages
      : product.image_url
        ? [{ id: "cover", url: product.image_url, name: "Imagem" }]
        : [];
    setSavedImages(productImages);
    setExpandedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
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
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === "products"
            ? "bg-roxo-profundo text-branco"
            : "text-grafite-arroxeado hover:bg-rosa-lais/10"
            }`}
        >
          Produtos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "banners"}
          onClick={() => setActiveTab("banners")}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === "banners"
            ? "bg-roxo-profundo text-branco"
            : "text-grafite-arroxeado hover:bg-rosa-lais/10"
            }`}
        >
          Banner
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
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === "payment"
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
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === "orders"
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
                <span className="mb-1 block text-sm font-medium text-grafite-arroxeado">
                  Imagens
                </span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(event) => addImages(event.target.files)}
                  className="sr-only"
                />
                <div className="flex flex-wrap gap-2 rounded-xl border border-dashed border-cinza-quente bg-cream p-3">
                  {savedImages.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setExpandedImage(image)}
                      className="group relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dourado-suave bg-branco shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais"
                      aria-label={`Ampliar ${image.name}`}
                    >
                      <img
                        src={getImageUrl(image.url)}
                        alt=""
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    </button>
                  ))}
                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${image.lastModified}-${index}`}
                      className="group relative h-24 w-24 overflow-hidden rounded-lg border border-cinza-quente bg-branco shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedImage({ id: `new-${index}`, url: imagePreviews[index] ?? "", name: image.name })}
                        className="h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rosa-lais"
                        aria-label={`Ampliar ${image.name}`}
                      >
                        <img
                          src={imagePreviews[index]}
                          alt={image.name}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-roxo-profundo/85 text-lg leading-none text-branco shadow-sm transition hover:bg-rosa-lais focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais focus-visible:ring-offset-1"
                        aria-label={`Remover ${image.name}`}
                        title={`Remover ${image.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {savedImages.length + images.length < 10 && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-rosa-lais bg-branco px-3 text-xl font-medium text-rosa-lais transition hover:bg-rosa-lais/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais"
                      aria-label="Adicionar outra imagem"
                      title="Adicionar outra imagem"
                    >
                      +
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-cinza-amarronzado">
                  Adicione até 10 imagens (JPG, PNG, WEBP ou GIF; máximo de 5 MB cada).
                </p>
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
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.order
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
      ) : activeTab === "banners" ? (
        <div role="tabpanel" className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">
              {bannerForm.id ? "Editar banner" : "Adicionar banner"}
            </h2>
            <form onSubmit={handleBannerSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-grafite-arroxeado" htmlFor="banner-image">
                  Imagem do banner
                </label>
                <input
                  id="banner-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => setBannerImage(event.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-dashed border-cinza-quente bg-cream px-4 py-3 text-sm"
                />
                <p className="mt-2 text-xs text-cinza-amarronzado">
                  Tamanho recomendado: 1920 x 404 px.
                </p>
                {(bannerPreview || bannerForm.imageUrl) && (
                  <button
                    type="button"
                    onClick={() => setExpandedImage({ id: "banner-preview", url: bannerPreview || bannerForm.imageUrl, name: "Banner" })}
                    className="mt-3 block h-36 w-full overflow-hidden rounded-xl border border-cinza-quente bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais"
                    aria-label="Ampliar prévia do banner"
                  >
                    <img src={getImageUrl(bannerPreview || bannerForm.imageUrl)} alt="" className="h-full w-full object-cover" />
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-grafite-arroxeado" htmlFor="banner-image-url">
                  URL da imagem (opcional)
                </label>
                <input
                  id="banner-image-url"
                  type="url"
                  value={bannerForm.imageUrl}
                  onChange={(event) => setBannerForm({ ...bannerForm, imageUrl: event.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-grafite-arroxeado" htmlFor="banner-redirect-link">
                  Link de redirecionamento
                </label>
                <input
                  id="banner-redirect-link"
                  value={bannerForm.redirectLink}
                  onChange={(event) => setBannerForm({ ...bannerForm, redirectLink: event.target.value })}
                  placeholder="/produto/exemplo ou https://..."
                  className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-grafite-arroxeado" htmlFor="banner-position">
                    Posição
                  </label>
                  <input
                    id="banner-position"
                    type="number"
                    min="0"
                    step="1"
                    value={bannerForm.position}
                    onChange={(event) => setBannerForm({ ...bannerForm, position: event.target.value })}
                    className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                    required
                  />
                </div>
                <label className="flex items-center gap-2 self-end rounded-xl border border-cinza-quente bg-cream px-4 py-3 text-sm text-grafite-arroxeado">
                  <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(event) => setBannerForm({ ...bannerForm, active: event.target.checked })}
                  />
                  Banner ativo
                </label>
              </div>

              {bannerError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{bannerError}</p>}

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" disabled={isSavingBanner} className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo disabled:opacity-60">
                  {isSavingBanner ? "Salvando..." : bannerForm.id ? "Salvar alterações" : "Adicionar banner"}
                </button>
                <button type="button" onClick={resetBannerForm} className="rounded-xl border border-cinza-quente bg-branco px-5 py-3 font-semibold text-grafite-arroxeado">
                  Limpar
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">Banners cadastrados</h2>
            {loadingBanners ? (
              <p className="text-cinza-amarronzado">Carregando banners...</p>
            ) : banners.length === 0 ? (
              <p className="rounded-xl bg-cream p-5 text-sm text-cinza-amarronzado">Nenhum banner cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => {
                  const active = banner.active !== 0 && banner.active !== false && banner.active !== "0";
                  return (
                    <article key={banner.id} className="flex gap-4 rounded-2xl border border-cinza-quente p-3">
                      <button type="button" onClick={() => setExpandedImage({ id: banner.id, url: banner.image_url ?? banner.image ?? "", name: "Banner" })} className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais" aria-label="Ampliar banner">
                        <img src={getHeroBannerImageUrl(banner)} alt="" crossOrigin="anonymous" className="h-full w-full object-cover" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-roxo-profundo">Posição {banner.position ?? 0}</p>
                        <p className="mt-1 truncate text-xs text-cinza-amarronzado">{banner.redirect_link || "Sem redirecionamento"}</p>
                        <p className={`mt-2 text-xs font-semibold ${active ? "text-emerald-700" : "text-cinza-amarronzado"}`}>{active ? "Ativo" : "Inativo"}</p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => handleEditBanner(banner)} className="rounded-lg border border-cinza-quente px-3 py-1.5 text-xs font-semibold text-grafite-arroxeado hover:bg-cream">Editar</button>
                          <button type="button" onClick={() => void handleDeleteBanner(banner.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Excluir</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
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

      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-roxo-profundo/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização ampliada de ${expandedImage.name}`}
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-h-full max-w-full" onClick={(event) => event.stopPropagation()}>
            <img
              src={getImageUrl(expandedImage.url)}
              alt={expandedImage.name}
              crossOrigin="anonymous"
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setExpandedImage(null)}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-branco text-2xl leading-none text-roxo-profundo shadow-lg transition hover:bg-rosa-lais hover:text-branco focus:outline-none focus-visible:ring-2 focus-visible:ring-branco"
              aria-label="Fechar imagem ampliada"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
