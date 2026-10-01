import { useEffect, useState } from "react";
import {
  createBox,
  deleteBox,
  getBoxes,
  updateBox,
  type ApiBox,
} from "../../services/api";

type BoxForm = {
  id?: number | string;
  name: string;
  height: string;
  width: string;
  length: string;
  weightGrams: string;
  active: boolean;
};

const emptyForm: BoxForm = {
  name: "",
  height: "",
  width: "",
  length: "",
  weightGrams: "",
  active: true,
};

function isActive(box: ApiBox) {
  return box.active !== 0 && box.active !== false && box.active !== "0";
}

export function BoxesTab() {
  const [boxes, setBoxes] = useState<ApiBox[]>([]);
  const [form, setForm] = useState<BoxForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBoxes = async () => {
    setLoading(true);
    try {
      setBoxes(await getBoxes());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível carregar as caixas.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBoxes();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setError("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dimensions = [form.height, form.width, form.length].map(Number);
    if (dimensions.some((value) => !Number.isFinite(value) || value <= 0)) {
      setError("Informe dimensões maiores que zero.");
      return;
    }
    const weightGrams = Number(form.weightGrams);
    if (
      !form.weightGrams.trim() ||
      !Number.isInteger(weightGrams) ||
      weightGrams < 0
    ) {
      setError("Informe um peso inteiro maior ou igual a zero em gramas.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        height: dimensions[0],
        width: dimensions[1],
        length: dimensions[2],
        weight_grams: weightGrams,
        active: form.active,
      };
      if (form.id) await updateBox(form.id, payload);
      else await createBox(payload);
      reset();
      await loadBoxes();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar a caixa.",
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (box: ApiBox) => {
    setForm({
      id: box.id,
      name: box.name,
      height: String(box.height),
      width: String(box.width),
      length: String(box.length),
      weightGrams: String(box.weight_grams),
      active: isActive(box),
    });
    setError("");
  };

  const remove = async (id: number | string) => {
    if (!window.confirm("Deseja realmente excluir esta caixa?")) return;
    try {
      await deleteBox(id);
      if (String(form.id) === String(id)) reset();
      await loadBoxes();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível excluir a caixa.",
      );
    }
  };

  return (
    <div role="tabpanel" className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">
          {form.id ? "Editar caixa" : "Adicionar caixa"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-grafite-arroxeado">
            Nome
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ["height", "Altura (cm)"],
              ["width", "Largura (cm)"],
              ["length", "Comprimento (cm)"],
            ] as const).map(([field, label]) => (
              <label
                key={field}
                className="block text-sm font-medium text-grafite-arroxeado"
              >
                {label}
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={form[field]}
                  onChange={(event) =>
                    setForm({ ...form, [field]: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
                />
              </label>
            ))}
          </div>
          <label className="block text-sm font-medium text-grafite-arroxeado">
            Peso (gramas)
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.weightGrams}
              onChange={(event) =>
                setForm({ ...form, weightGrams: event.target.value })
              }
              className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-grafite-arroxeado">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm({ ...form, active: event.target.checked })
              }
            />
            Caixa ativa
          </label>
          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo disabled:opacity-60"
            >
              {saving ? "Salvando..." : form.id ? "Salvar alterações" : "Adicionar caixa"}
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
          Caixas cadastradas
        </h2>
        {loading ? (
          <p className="text-cinza-amarronzado">Carregando caixas...</p>
        ) : boxes.length === 0 ? (
          <p className="rounded-xl bg-cream p-5 text-sm text-cinza-amarronzado">
            Nenhuma caixa cadastrada.
          </p>
        ) : (
          <div className="space-y-4">
            {boxes.map((box) => (
              <article
                key={box.id}
                className="rounded-2xl border border-cinza-quente p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-roxo-profundo">
                      {box.name}
                    </h3>
                    <p className="text-sm text-cinza-amarronzado">
                      {box.height} × {box.width} × {box.length} cm
                    </p>
                    <p className="text-sm text-cinza-amarronzado">
                      Peso: {box.weight_grams} g
                    </p>
                    <p
                      className={`mt-2 text-xs font-semibold ${isActive(box) ? "text-emerald-700" : "text-cinza-amarronzado"}`}
                    >
                      {isActive(box) ? "Ativa" : "Inativa"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => edit(box)}
                      className="rounded-lg border border-cinza-quente px-3 py-1.5 text-xs font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(box.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Excluir
                    </button>
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
