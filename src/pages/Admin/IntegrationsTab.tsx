import { useEffect, useState } from "react";
import {
  connectMercadoPago,
  disconnectMercadoPago,
  disconnectSuperFrete,
  getMercadoPagoIntegration,
  getSuperFreteIntegration,
  saveSuperFreteIntegration,
  type MercadoPagoIntegration,
  type SuperFreteIntegration,
} from "../../services/api";

export function IntegrationsTab({
  showMercadoPagoResult,
}: {
  showMercadoPagoResult: boolean;
}) {
  const [mercadoPago, setMercadoPago] = useState<MercadoPagoIntegration | null>(
    null,
  );
  const [superFrete, setSuperFrete] = useState<SuperFreteIntegration | null>(
    null,
  );
  const [form, setForm] = useState({ token: "", originPostalCode: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [mp, sf] = await Promise.all([
        getMercadoPagoIntegration(),
        getSuperFreteIntegration(),
      ]);
      setMercadoPago(mp);
      setSuperFrete(sf);
      setForm((current) => ({
        ...current,
        originPostalCode: sf.originPostalCode ?? "",
      }));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível consultar as conexões.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const connect = async () => {
    setSaving(true);
    setError("");
    try {
      window.location.assign((await connectMercadoPago()).authorizationUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível iniciar a conexão.",
      );
      setSaving(false);
    }
  };
  const disconnectMp = async () => {
    if (!window.confirm("Deseja desconectar a conta Mercado Pago?")) return;
    setSaving(true);
    try {
      await disconnectMercadoPago();
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível desconectar a conta.",
      );
    } finally {
      setSaving(false);
    }
  };
  const saveSuperFrete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = form.token.trim(),
      originPostalCode = form.originPostalCode.replace(/\D/g, "");
    if (!token || originPostalCode.length !== 8)
      return setError(
        "Informe o token e um CEP de origem válido com oito dígitos.",
      );
    setSaving(true);
    setError("");
    try {
      await saveSuperFreteIntegration({ token, originPostalCode });
      setForm({ token: "", originPostalCode });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar a conexão.",
      );
    } finally {
      setSaving(false);
    }
  };
  const disconnectSf = async () => {
    if (!window.confirm("Deseja desconectar a conta SuperFrete?")) return;
    setSaving(true);
    try {
      await disconnectSuperFrete();
      setForm({ token: "", originPostalCode: "" });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível desconectar a conta.",
      );
    } finally {
      setSaving(false);
    }
  };
  const status = (connected?: boolean) => (
    <span
      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${connected ? "bg-emerald-100 text-emerald-700" : "bg-cinza-quente text-grafite-arroxeado"}`}
    >
      Status: {connected ? "Conectado" : "Não conectado"}
    </span>
  );
  return (
    <section
      role="tabpanel"
      aria-label="Integrações"
      className="max-w-2xl rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
        Integrações
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-roxo-profundo">
            Mercado Pago
          </h2>
          <p className="mt-2 text-sm text-cinza-amarronzado">
            A autenticação é feita com segurança no site do Mercado Pago.
          </p>
        </div>
        {loading ? <span>Consultando...</span> : status(mercadoPago?.connected)}
      </div>
      {showMercadoPagoResult && !loading && (
        <p
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${mercadoPago?.connected ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
        >
          {mercadoPago?.connected
            ? "Conta Mercado Pago conectada com sucesso."
            : "A conexão não foi concluída ou foi cancelada."}
        </p>
      )}
      {error && (
        <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      <div className="mt-8">
        {mercadoPago?.connected ? (
          <button
            type="button"
            onClick={() => void disconnectMp()}
            disabled={saving}
            className="rounded-xl border border-rose-300 px-5 py-3 font-semibold text-rose-700"
          >
            Desconectar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void connect()}
            disabled={loading || saving}
            className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo"
          >
            {saving ? "Conectando..." : "Conectar Mercado Pago"}
          </button>
        )}
      </div>
      <div className="mt-10 border-t border-cinza-quente pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rosa-lais">
              Integrações &gt; SuperFrete
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-roxo-profundo">
              SuperFrete
            </h2>
            <p className="mt-2 text-sm text-cinza-amarronzado">
              Cole o token gerado na sua conta SuperFrete. Ele é enviado somente
              para o servidor.
            </p>
          </div>
          {loading ? (
            <span>Consultando...</span>
          ) : (
            status(superFrete?.connected)
          )}
        </div>
        {superFrete?.connected && (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Integração ativa. CEP de origem:{" "}
            {superFrete.originPostalCode ?? "não informado"}.
          </p>
        )}
        <form onSubmit={saveSuperFrete} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-grafite-arroxeado">
            Token secreto
            <input
              type="password"
              required
              autoComplete="off"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              placeholder={
                superFrete?.connected
                  ? "Informe outro token para substituir"
                  : "Cole o token da SuperFrete"
              }
              className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
            />
          </label>
          <label className="block text-sm font-medium text-grafite-arroxeado">
            CEP de origem
            <input
              inputMode="numeric"
              required
              value={form.originPostalCode}
              onChange={(e) =>
                setForm({ ...form, originPostalCode: e.target.value })
              }
              placeholder="01001-000"
              className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3"
            />
          </label>
          <div className="flex gap-3">
            <button
              disabled={loading || saving}
              className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo"
            >
              {saving ? "Salvando..." : "Salvar conexão"}
            </button>
            {superFrete?.connected && (
              <button
                type="button"
                onClick={() => void disconnectSf()}
                disabled={saving}
                className="rounded-xl border border-rose-300 px-5 py-3 font-semibold text-rose-700"
              >
                Desconectar
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
