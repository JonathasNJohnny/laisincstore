import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  getImageUrl,
  getProducts,
  updateProduct,
  type ApiProduct,
} from "../../services/api";
import { invalidateProductsCache } from "../../components/ProductList/ProductList";

type ProductForm = {
  id?: number;
  name: string;
  category: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  weightGrams: string;
  height: string;
  width: string;
  length: string;
  variant: string;
  active: boolean;
  order: boolean;
};
type SavedImage = {
  id: number | string;
  uploadId?: number | string;
  url?: string | null;
  name: string;
};
const emptyForm: ProductForm = {
  name: "",
  category: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  weightGrams: "",
  height: "",
  width: "",
  length: "",
  variant: "",
  active: true,
  order: false,
};

export function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [removedIds, setRemovedIds] = useState<Array<number | string>>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const load = async () => {
    setLoading(true);
    try {
      setProducts(await getProducts({ includeInactive: true }));
    } catch (cause) {
      console.error(cause);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const urls = images.map(URL.createObjectURL);
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [images]);
  const categories = Array.from(
    new Set(
      products
        .map((product) => String(product.category ?? "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const reset = () => {
    setForm(emptyForm);
    setImages([]);
    setSavedImages([]);
    setRemovedIds([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };
  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files),
      allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (
      selected.some(
        (file) => !allowed.includes(file.type) || file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Use imagens JPG, PNG, WEBP ou GIF de até 5 MB.");
      return;
    }
    setImages((current) =>
      [...current, ...selected].slice(0, Math.max(0, 10 - savedImages.length)),
    );
    if (savedImages.length + images.length + selected.length > 10)
      setError("Cada produto pode ter no máximo 10 imagens.");
    if (inputRef.current) inputRef.current.value = "";
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const weight = Number(form.weightGrams);
    if (!Number.isInteger(weight) || weight <= 0)
      return setError(
        "Informe o peso em gramas como um número inteiro maior que zero.",
      );
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("category", form.category);
      payload.append("slug", form.slug || form.name);
      payload.append("description", form.variant ? "" : form.description);
      payload.append("price", form.price);
      payload.append("stock", form.stock);
      payload.append("weightGrams", String(weight));
      payload.append("height", form.height);
      payload.append("width", form.width);
      payload.append("length", form.length);
      payload.append("variant", form.variant);
      payload.append("active", form.active ? "1" : "0");
      payload.append("order", form.order ? "1" : "0");
      if (form.id && removedIds.length)
        payload.append("removeUploadIds", JSON.stringify(removedIds));
      images.forEach((image) => payload.append("images", image));
      if (form.id) await updateProduct(form.id, payload);
      else await createProduct(payload);
      invalidateProductsCache();
      await load();
      reset();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSaving(false);
    }
  };
  const edit = (product: any) => {
    setForm({
      id: Number(product.id),
      name: product.name ?? "",
      category: product.category ?? "",
      slug: product.slug ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      weightGrams:
        product.weight_grams == null ? "" : String(product.weight_grams),
      height: product.height == null ? "" : String(product.height),
      width: product.width == null ? "" : String(product.width),
      length: product.length == null ? "" : String(product.length),
      variant: String(product.variant ?? product.variant_id ?? ""),
      active: Boolean(Number(product.active ?? 1)),
      order: Boolean(Number(product.order ?? 0)),
    });
    setImages([]);
    setRemovedIds([]);
    const uploads = (product.uploads ?? [])
      .slice()
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
      .map((upload: any, index: number) => ({
        id: upload.id,
        uploadId: upload.id,
        url: upload.url,
        name: `Imagem ${index + 1}`,
      }));
    setSavedImages(
      uploads.length
        ? uploads
        : product.image_url
          ? [{ id: "cover", url: product.image_url, name: "Imagem" }]
          : [],
    );
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (id: number | string) => {
    if (!window.confirm("Deseja realmente remover este produto?")) return;
    try {
      await deleteProduct(id);
      setProducts((current) =>
        current.filter((product) => String(product.id) !== String(id)),
      );
    } catch {
      window.alert("Não foi possível remover o produto.");
    }
  };
  // const toggleOrder = async (product: any) => {
  //   try {
  //     const payload = new FormData();
  //     payload.append("order", product.order ? "0" : "1");
  //     await updateProduct(product.id, payload);
  //     setProducts((current) =>
  //       current.map((item) =>
  //         String(item.id) === String(product.id)
  //           ? { ...item, order: Number(product.order) ? 0 : 1 }
  //           : item,
  //       ),
  //     );
  //   } catch {
  //     window.alert("Não foi possível atualizar o status de encomenda.");
  //   }
  // };

  return (
    <div role="tabpanel" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">
          {form.id ? "Editar produto" : "Adicionar produto"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Nome"
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
            required
          />
          {!form.variant && (
            <label className="block text-sm font-medium text-grafite-arroxeado">
              Descrição
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                className="mt-1 min-h-28 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
              />
            </label>
          )}
          {!form.variant && (
            <CategoryAutocomplete
              categories={categories}
              value={form.category}
              onChange={(category) => setForm({ ...form, category })}
              required
            />
          )}
          <Field
            label="Slug"
            value={form.slug}
            onChange={(slug) => setForm({ ...form, slug })}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Preço"
              type="number"
              value={form.price}
              onChange={(price) => setForm({ ...form, price })}
              required
            />
            <Field
              label="Estoque"
              type="number"
              value={form.stock}
              onChange={(stock) => setForm({ ...form, stock })}
              required
            />
            <Field
              label="Peso (g)"
              type="number"
              value={form.weightGrams}
              onChange={(weightGrams) => setForm({ ...form, weightGrams })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Altura (cm)"
              type="number"
              value={form.height}
              onChange={(height) => setForm({ ...form, height })}
              required
            />
            <Field
              label="Largura (cm)"
              type="number"
              value={form.width}
              onChange={(width) => setForm({ ...form, width })}
              required
            />
            <Field
              label="Comprimento (cm)"
              type="number"
              value={form.length}
              onChange={(length) => setForm({ ...form, length })}
              required
            />
          </div>
          <ProductVariantAutocomplete
            products={products}
            productId={form.id}
            value={form.variant}
            onChange={(variant) => setForm({ ...form, variant })}
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Ativo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.checked })}
              />
              Encomenda
            </label>
          </div>
          <div>
            <span className="block text-sm font-medium text-grafite-arroxeado">
              Imagens
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => addImages(e.target.files)}
              className="sr-only"
            />
            <div className="mt-1 flex flex-wrap gap-2 rounded-xl border border-dashed border-cinza-quente bg-cream p-3">
              {savedImages.map((image) => (
                <ImageThumb
                  key={image.id}
                  image={image}
                  onRemove={() => {
                    setSavedImages((current) =>
                      current.filter((item) => item.id !== image.id),
                    );
                    if (image.uploadId != null)
                      setRemovedIds((current) =>
                        current.includes(image.uploadId!)
                          ? current
                          : [...current, image.uploadId!],
                      );
                  }}
                />
              ))}
              {images.map((image, index) => (
                <ImageThumb
                  key={`${image.name}-${index}`}
                  image={{ id: index, url: previews[index], name: image.name }}
                  onRemove={() =>
                    setImages((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                />
              ))}
              {savedImages.length + images.length < 10 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="h-10 min-w-10 rounded-lg border border-rosa-lais bg-branco text-xl text-rosa-lais"
                >
                  +
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-cinza-amarronzado">
              Até 10 imagens (JPG, PNG, WEBP ou GIF; máximo de 5 MB cada).
            </p>
          </div>
          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo"
            >
              {saving
                ? "Salvando..."
                : form.id
                  ? "Salvar alterações"
                  : "Adicionar produto"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-cinza-quente px-5 py-3 font-semibold text-grafite-arroxeado"
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
          <p>Carregando produtos...</p>
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
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-roxo-profundo">
                          {product.name}
                        </h3>
                        <p className="text-sm text-rosa-lais">
                          {product.category || "Sem categoria"}
                        </p>
                        <p className="text-sm text-cinza-amarronzado line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-fit w-fit shrink-0 self-start whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
                          product.order
                            ? "border-rosa-lais bg-rosa-lais/10 text-rosa-lais"
                            : "border-cinza-quente bg-cream text-grafite-arroxeado"
                        }`}
                      >
                        {product.order ? "Encomenda" : "Pronta entrega"}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between text-sm">
                      <span>
                        R$ {Number(product.price).toFixed(2).replace(".", ",")}
                      </span>
                      <span>Estoque: {product.stock}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => edit(product)}
                        className="rounded-lg bg-roxo-profundo px-3 py-2 text-sm text-branco"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(product.id)}
                        className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700"
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
  );
}

function CategoryAutocomplete({
  categories,
  value,
  onChange,
  required = false,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const options = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return categories
      .filter((category) => category.toLocaleLowerCase("pt-BR").includes(term))
      .slice(0, 8);
  }, [categories, query]);

  return (
    <label className="block text-sm font-medium text-grafite-arroxeado">
      Categoria
      <div className="relative mt-1">
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            onChange(nextValue);
            setOpen(true);
          }}
          required={required}
          placeholder="Busque ou digite uma categoria"
          autoComplete="off"
          className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
        />
        {open && options.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-cinza-quente bg-branco p-1 shadow-lg">
            {options.map((category) => (
              <button
                key={category}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(category);
                  setQuery(category);
                  setOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-cream"
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      <span className="mt-1 block text-xs font-normal text-cinza-amarronzado">
        Selecione uma sugestão ou digite uma nova categoria.
      </span>
    </label>
  );
}

function ProductVariantAutocomplete({
  products,
  productId,
  value,
  onChange,
}: {
  products: ApiProduct[];
  productId?: number;
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = products.find((product) => String(product.id) === value);
  const options = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return products
      .filter((product) => product.id !== productId)
      .filter(
        (product) =>
          !term ||
          product.name.toLocaleLowerCase("pt-BR").includes(term) ||
          product.slug?.toLocaleLowerCase("pt-BR").includes(term),
      )
      .slice(0, 8);
  }, [productId, products, query]);

  return (
    <label className="block text-sm font-medium text-grafite-arroxeado">
      Variante
      <div className="relative mt-1">
        {selected ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-cinza-quente bg-cream px-4 py-3">
            <span className="min-w-0 truncate">
              #{selected.id} — {selected.name}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setQuery("");
              }}
              className="shrink-0 text-rosa-lais"
              aria-label="Remover variante selecionada"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <input
            value={query}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder="Busque pelo nome ou slug"
            autoComplete="off"
            className="w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
          />
        )}
        {!selected && open && (
          <div className="absolute z-10 left-0 right-0 top-full mt-1 max-h-56 overflow-auto rounded-xl border border-cinza-quente bg-branco p-1 shadow-lg">
            {options.map((product) => (
              <button
                key={product.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(String(product.id));
                  setQuery("");
                  setOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-cream"
              >
                <span className="block font-medium">{product.name}</span>
                <span className="block text-xs text-cinza-amarronzado">
                  #{product.id}
                  {product.slug ? ` — ${product.slug}` : ""}
                </span>
              </button>
            ))}
            {!options.length && (
              <p className="p-2 text-cinza-amarronzado">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        )}
      </div>
      <span className="mt-1 block text-xs font-normal text-cinza-amarronzado">
        Selecione o produto principal desta variante.
      </span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-grafite-arroxeado">
      {label}
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
      />
    </label>
  );
}
function ImageThumb({
  image,
  onRemove,
}: {
  image: SavedImage;
  onRemove: () => void;
}) {
  const imageUrl = image.url ?? "";

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-cinza-quente bg-branco">
      <img
        src={
          imageUrl.startsWith("blob:")
            ? imageUrl
            : getImageUrl(imageUrl)
        }
        alt={image.name}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-roxo-profundo/85 text-branco"
        aria-label={`Remover ${image.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
