import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resendVerification, verifyEmail } from "../../services/users";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    if (!email.trim() || !/^\d{6}$/.test(code)) return setError("Informe seu e-mail e o código de 6 dígitos.");
    setSaving(true);
    try {
      const result = await verifyEmail(email.trim(), code);
      setMessage(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível confirmar o e-mail.");
    } finally { setSaving(false); }
  }

  async function resend() {
    setError(""); setMessage("");
    if (!email.trim()) return setError("Informe seu e-mail para reenviar o código.");
    setResending(true);
    try {
      const result = await resendVerification(email.trim());
      setMessage(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível reenviar o código.");
    } finally { setResending(false); }
  }

  return <main className="container max-w-lg py-12 lg:py-20">
    <section className="rounded-2xl border border-cinza-quente bg-branco p-6 shadow-sm">
      <h1 className="font-serif text-3xl font-bold text-roxo-profundo">Confirme seu e-mail</h1>
      <p className="mt-2 text-cinza-amarronzado">Enviamos um código de 6 dígitos. Ele é válido por 10 minutos.</p>
      <form onSubmit={confirm} className="mt-6 grid gap-4">
        <label className="grid gap-1 text-sm font-medium text-grafite-arroxeado">E-mail
          <input className="rounded-xl border border-cinza-quente px-3 py-2.5" type="email" value={email} required onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        <label className="grid gap-1 text-sm font-medium text-grafite-arroxeado">Código de confirmação
          <input className="rounded-xl border border-cinza-quente px-3 py-2.5 tracking-[0.35em]" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} required onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} autoComplete="one-time-code" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button disabled={saving || Boolean(message)} className="rounded-xl bg-rosa-lais px-5 py-3 font-medium text-branco disabled:opacity-50">{saving ? "Confirmando..." : "Confirmar e-mail"}</button>
      </form>
      {message ? <Link to="/" className="mt-4 block text-center text-sm font-medium text-rosa-lais">Ir para a loja</Link> : <button type="button" disabled={resending} onClick={resend} className="mt-4 w-full text-sm font-medium text-rosa-lais disabled:opacity-50">{resending ? "Reenviando..." : "Reenviar código"}</button>}
    </section>
  </main>;
}
