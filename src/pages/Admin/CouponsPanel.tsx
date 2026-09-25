import { useEffect, useState } from "react";
import {
  ApiRequestError,
  createCoupon,
  deleteCoupon,
  getAdminCoupons,
  getProducts,
  updateCoupon,
  updateCouponStatus,
  type ApiProduct,
  type Coupon,
  type CouponPayload,
} from "../../services/api";

type Form = {
  id?: number | string;
  name: string;
  code: string;
  discountType: "FIXED" | "PERCENTAGE";
  discountValue: string;
  limitValue: string;
  limitedBy: "NONE" | "CATEGORY" | "PRODUCT";
  limitedProducts: string;
  limitedCategories: string;
  exceptProducts: string;
  maxUses: string;
  usesPerUser: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
};
const empty: Form = {
  name: "",
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  limitValue: "",
  limitedBy: "NONE",
  limitedProducts: "",
  limitedCategories: "",
  exceptProducts: "",
  maxUses: "",
  usesPerUser: "",
  isActive: true,
  validFrom: "",
  validUntil: "",
};
const list = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const ids = (value: string) => list(value).map(Number).filter(Number.isFinite);
const localDate = (value?: string | null) =>
  value ? value.slice(0, 10) : "";
const date = (value: string) => value || undefined;
const errorText = (error: unknown) =>
  error instanceof ApiRequestError && error.code === "COUPON_CODE_EXISTS"
    ? "Este código de cupom já existe."
    : error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.";

export function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState({
    category: "",
    limitedProducts: "",
    exceptProducts: "",
  });
  const [open, setOpen] = useState({
    category: false,
    limitedProducts: false,
    exceptProducts: false,
  });
  const input =
    "mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-3 py-2";
  const load = async () => {
    setLoading(true);
    try {
      const [couponData, productData] = await Promise.all([
        getAdminCoupons(),
        getProducts({ includeInactive: true }),
      ]);
      setCoupons(couponData.coupons);
      setProducts(productData);
      setCategories(
        [
          ...new Set(
            productData
              .map((p) => p.category?.trim())
              .filter((x): x is string => Boolean(x)),
          ),
        ].sort((a, b) => a.localeCompare(b, "pt-BR")),
      );
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const setValues = (
    field: "limitedCategories" | "limitedProducts" | "exceptProducts",
    values: string[],
  ) => setForm((current) => ({ ...current, [field]: values.join(", ") }));
  const categoryPicker = () => {
    const selected = list(form.limitedCategories);
    const term = search.category.toLocaleLowerCase("pt-BR");
    const options = categories.filter(
      (c) =>
        !selected.includes(c) && c.toLocaleLowerCase("pt-BR").includes(term),
    );
    const add = (value = search.category) => {
      if (
        value.trim() &&
        !selected.some(
          (x) =>
            x.localeCompare(value.trim(), "pt-BR", {
              sensitivity: "accent",
            }) === 0,
        )
      )
        setValues("limitedCategories", [...selected, value.trim()]);
      setSearch((x) => ({ ...x, category: "" }));
    };
    return (
      <TagBox
        label="Categorias"
        values={selected}
        query={search.category}
        open={open.category}
        placeholder="Buscar ou criar categoria..."
        options={options.map((x) => ({ value: x, label: x }))}
        onQuery={(value) => {
          setSearch((x) => ({ ...x, category: value }));
          setOpen((x) => ({ ...x, category: true }));
        }}
        onOpen={(value) => setOpen((x) => ({ ...x, category: value }))}
        onAdd={add}
        onRemove={(value) =>
          setValues(
            "limitedCategories",
            selected.filter((x) => x !== value),
          )
        }
        allowCreate
      />
    );
  };
  const productPicker = (
    field: "limitedProducts" | "exceptProducts",
    label: string,
    required = false,
  ) => {
    const selected = ids(form[field]);
    const term = search[field].toLocaleLowerCase("pt-BR");
    const options = products.filter(
      (p) =>
        !selected.includes(p.id) &&
        `${p.name} ${p.slug ?? ""}`.toLocaleLowerCase("pt-BR").includes(term),
    );
    const add = (value: string) => {
      const id = Number(value);
      if (!selected.includes(id))
        setValues(field, [...selected.map(String), value]);
      setSearch((x) => ({ ...x, [field]: "" }));
    };
    return (
      <TagBox
        label={label}
        values={selected.map(String)}
        query={search[field]}
        open={open[field]}
        placeholder="Buscar por nome ou slug..."
        required={required && !selected.length}
        options={options.map((p) => ({
          value: String(p.id),
          label: `${p.name}${p.slug ? ` · /${p.slug}` : ""}`,
        }))}
        onQuery={(value) => {
          setSearch((x) => ({ ...x, [field]: value }));
          setOpen((x) => ({ ...x, [field]: true }));
        }}
        onOpen={(value) => setOpen((x) => ({ ...x, [field]: value }))}
        onAdd={add}
        onRemove={(value) =>
          setValues(
            field,
            selected.filter((id) => id !== Number(value)).map(String),
          )
        }
        productMap={products}
      />
    );
  };
  const edit = (coupon: Coupon) => {
    setForm({
      id: coupon.id,
      name: coupon.name,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      limitValue: coupon.limitValue == null ? "" : String(coupon.limitValue),
      limitedBy: coupon.limitedBy,
      limitedProducts: coupon.limitedProducts.join(", "),
      limitedCategories: coupon.limitedCategories.join(", "),
      exceptProducts: coupon.exceptProducts.join(", "),
      maxUses: coupon.maxUses == null ? "" : String(coupon.maxUses),
      usesPerUser: coupon.usesPerUser == null ? "" : String(coupon.usesPerUser),
      isActive: coupon.isActive,
      validFrom: localDate(coupon.validFrom),
      validUntil: localDate(coupon.validUntil),
    });
    setSearch({ category: "", limitedProducts: "", exceptProducts: "" });
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const discountValue = Number(form.discountValue);
    if (
      !form.name.trim() ||
      discountValue <= 0 ||
      (form.discountType === "PERCENTAGE" && discountValue > 100)
    )
      return setError("Informe nome e desconto válidos.");
    if (form.limitedBy === "PRODUCT" && !ids(form.limitedProducts).length)
      return setError("Selecione ao menos um produto.");
    if (form.limitedBy === "CATEGORY" && !list(form.limitedCategories).length)
      return setError("Informe ao menos uma categoria.");
    if (form.validFrom && form.validUntil && new Date(form.validFrom) > new Date(form.validUntil))
      return setError("O início da validade não pode ser posterior ao fim.");
    const payload: CouponPayload = {
      name: form.name.trim(),
      ...(form.code.trim() && { code: form.code.trim() }),
      discountType: form.discountType,
      discountValue,
      ...(form.limitValue &&
        form.discountType === "PERCENTAGE" && {
          limitValue: Number(form.limitValue),
        }),
      limitedBy: form.limitedBy,
      ...(form.limitedBy === "PRODUCT" && {
        limitedProducts: ids(form.limitedProducts),
      }),
      ...(form.limitedBy === "CATEGORY" && {
        limitedCategories: list(form.limitedCategories),
        exceptProducts: ids(form.exceptProducts),
      }),
      ...(form.limitedBy === "NONE" && {
        exceptProducts: ids(form.exceptProducts),
      }),
      ...(form.maxUses && { maxUses: Number(form.maxUses) }),
      ...(form.usesPerUser && { usesPerUser: Number(form.usesPerUser) }),
      isActive: form.isActive,
      ...(date(form.validFrom) && { validFrom: date(form.validFrom) }),
      ...(date(form.validUntil) && { validUntil: date(form.validUntil) }),
    };
    setSaving(true);
    setError("");
    try {
      form.id
        ? await updateCoupon(form.id, payload)
        : await createCoupon(payload);
      setForm(empty);
      await load();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div role="tabpanel" className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
      <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-roxo-profundo">
          {form.id ? "Editar cupom" : "Novo cupom"}
        </h2>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block text-sm">
            Nome
            <input
              required
              className={input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Código
            <input
              className={input}
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="flex flex-col gap-1 w-full text-sm font-medium">
              Tipo
              <select
                className={`${input} h-10 w-full font-normal`}
                value={form.discountType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountType: e.target.value as Form["discountType"],
                  })
                }
              >
                <option value="PERCENTAGE">Percentual</option>
                <option value="FIXED">Fixo (R$)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 w-full text-sm font-medium">
              Desconto
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                className={`${input} h-10 w-full font-normal`}
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: e.target.value })
                }
              />
            </label>
          </div>
          {form.discountType === "PERCENTAGE" && (
            <label className="block text-sm">
              Limite de desconto (R$, opcional)
              <input type="number" min="0" step="0.01" className={input} value={form.limitValue} onChange={(e) => setForm({ ...form, limitValue: e.target.value })} />
            </label>
          )}
          <label className="block text-sm">
            Escopo
            <select
              className={input}
              value={form.limitedBy}
              onChange={(e) =>
                setForm({
                  ...form,
                  limitedBy: e.target.value as Form["limitedBy"],
                })
              }
            >
              <option value="NONE">Toda a loja</option>
              <option value="CATEGORY">Categorias</option>
              <option value="PRODUCT">Produtos</option>
            </select>
          </label>
          {form.limitedBy === "CATEGORY" && categoryPicker()}
          {form.limitedBy === "PRODUCT" &&
            productPicker("limitedProducts", "Produtos", true)}
          {form.limitedBy !== "PRODUCT" &&
            productPicker("exceptProducts", "Produtos excluídos")}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">Máx. usos<input type="number" min="1" className={input} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></label>
            <label className="block text-sm">Usos por cliente<input type="number" min="1" className={input} value={form.usesPerUser} onChange={(e) => setForm({ ...form, usesPerUser: e.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">Válido de<input type="date" className={input} value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} /></label>
            <label className="block text-sm">Válido até<input type="date" className={input} value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></label>
          </div>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />{" "}
            Ativo
          </label>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <button
            disabled={saving}
            className="rounded-xl bg-rosa-lais px-4 py-2 font-semibold text-branco"
          >
            {saving ? "Salvando..." : "Salvar cupom"}
          </button>
        </form>
      </section>
      <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-roxo-profundo">Cupons</h2>
        {loading ? (
          <p className="mt-4">Carregando...</p>
        ) : (
          <div className="mt-6 space-y-4">
            {coupons.map((coupon) => (
              <article key={coupon.id} className="rounded-2xl border border-cinza-quente bg-branco p-4 shadow-sm">
                <b>{coupon.code}</b> — {coupon.name}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-cream p-2"><span className="block text-xs text-cinza-amarronzado">Desconto</span><strong className="text-roxo-profundo">{coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `R$ ${Number(coupon.discountValue).toFixed(2).replace(".", ",")}`}</strong></div>
                  <div className="rounded-xl bg-cream p-2"><span className="block text-xs text-cinza-amarronzado">Escopo</span><strong className="text-roxo-profundo">{coupon.limitedBy === "NONE" ? "Toda a loja" : coupon.limitedBy === "CATEGORY" ? "Categorias" : "Produtos"}</strong></div>
                </div>
                <p className="mt-3 text-xs text-cinza-amarronzado">{coupon.validFrom || coupon.validUntil ? `Validade: ${coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString("pt-BR") : "sem início"} – ${coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString("pt-BR") : "sem fim"}` : "Sem prazo de validade"}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <button
                    className="rounded-lg border border-cinza-quente px-3 py-1.5 text-xs font-semibold text-grafite-arroxeado hover:bg-cream"
                    onClick={() => edit(coupon)}
                  >
                    Editar
                  </button>
                  <button
                    className="rounded-lg border border-cinza-quente px-3 py-1.5 text-xs font-semibold text-grafite-arroxeado hover:bg-cream"
                    onClick={() =>
                      void updateCouponStatus(coupon.id, !coupon.isActive).then(
                        load,
                      )
                    }
                  >
                    {" "}
                    {coupon.isActive ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      if (window.confirm(`Excluir o cupom ${coupon.code}?`))
                        void deleteCoupon(coupon.id).then(load);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TagBox({
  label,
  values,
  query,
  open,
  placeholder,
  options,
  required,
  allowCreate,
  onQuery,
  onOpen,
  onAdd,
  onRemove,
  productMap,
}: {
  label: string;
  values: string[];
  query: string;
  open: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
  required?: boolean;
  allowCreate?: boolean;
  onQuery: (value: string) => void;
  onOpen: (value: boolean) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  productMap?: ApiProduct[];
}) {
  const display = (value: string) =>
    productMap?.find((p) => p.id === Number(value))?.slug || value;
  return (
    <div className="text-sm">
      <span>{label}</span>
      <div className="relative mt-1 rounded-xl border border-cinza-quente bg-cream p-2">
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-lg bg-rosa-lais/15 px-2 py-1 text-xs"
            >
              {display(value)}{" "}
              <button type="button" onClick={() => onRemove(value)}>
                ×
              </button>
            </span>
          ))}
          <input
            required={required}
            className="min-w-32 flex-1 bg-transparent outline-none"
            placeholder={placeholder}
            value={query}
            onFocus={() => onOpen(true)}
            onBlur={() => {
              if (allowCreate && query.trim()) onAdd(query);
              onOpen(false);
            }}
            onChange={(e) => {
              onQuery(e.target.value);
              onOpen(true);
            }}
            onKeyDown={(e) => {
              if (
                (e.key === "Enter" || e.key === ",") &&
                (options[0] || allowCreate)
              ) {
                e.preventDefault();
                onAdd(options[0]?.value ?? query);
              }
              if (e.key === "Backspace" && !query && values.length)
                onRemove(values.at(-1)!);
            }}
          />
        </div>
        {open && (
          <div className="absolute z-10 left-0 right-0 top-full mt-1 max-h-48 overflow-auto rounded-xl border bg-branco p-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-cream"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onAdd(option.value)}
              >
                {option.label}
              </button>
            ))}
            {allowCreate && query.trim() && (
              <button
                type="button"
                className="block w-full px-3 py-2 text-left"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onAdd(query)}
              >
                Adicionar “{query.trim()}”
              </button>
            )}
            {!options.length && !allowCreate && (
              <p className="p-2 text-cinza-amarronzado">
                Nenhum produto encontrado.
              </p>
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-cinza-amarronzado">
        Pesquise por nome ou slug e selecione os itens.
      </p>
    </div>
  );
}
