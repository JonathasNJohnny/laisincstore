import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, type RegistrationPayload } from "../../services/users";

const optionalFields = [
  ["telefone", "Telefone"], ["cpf", "CPF"], ["cnpj", "CNPJ"], ["cep", "CEP"],
  ["bairro", "Bairro"], ["rua", "Rua"], ["numero", "Número"], ["complemento", "Complemento"], ["recebedor", "Recebedor"],
] as const;

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const setValue = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!form.nome.trim() || !form.email.trim()) return setError("Nome e e-mail são obrigatórios.");
    if (form.senha.length < 8) return setError("A senha deve ter ao menos 8 caracteres.");
    if (form.senha !== form.confirmarSenha) return setError("As senhas não coincidem.");
    setSaving(true);
    try {
      const registrationFields = { ...form };
      delete registrationFields.confirmarSenha;
      const payload = Object.fromEntries(Object.entries(registrationFields).filter(([, value]) => value.trim())) as RegistrationPayload;
      const result = await registerUser(payload);
      navigate(`/confirmar-email?email=${encodeURIComponent(result.email)}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível criar a conta."); }
    finally { setSaving(false); }
  }

  return <main className="container max-w-3xl py-12 lg:py-20">
    <h1 className="font-serif text-3xl font-bold text-roxo-profundo">Crie sua conta</h1>
    <p className="mt-2 text-cinza-amarronzado">Preencha o básico agora ou complete seus dados depois.</p>
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-cinza-quente bg-branco p-6 shadow-sm sm:grid-cols-2">
      <Field label="Nome" value={form.nome} onChange={(v) => setValue("nome", v)} required />
      <Field label="E-mail" type="email" value={form.email} onChange={(v) => setValue("email", v)} required />
      <Field label="Senha" type="password" minLength={8} value={form.senha} onChange={(v) => setValue("senha", v)} required />
      <Field label="Repita a senha" type="password" minLength={8} value={form.confirmarSenha} onChange={(v) => setValue("confirmarSenha", v)} required />
      {optionalFields.map(([key, label]) => <Field key={key} label={label} value={form[key] ?? ""} onChange={(v) => setValue(key, v)} />)}
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button disabled={saving} className="sm:col-span-2 rounded-xl bg-rosa-lais px-5 py-3 font-medium text-branco disabled:opacity-50">{saving ? "Criando conta..." : "Criar conta"}</button>
    </form>
  </main>;
}

function Field({ label, value, onChange, type = "text", required = false, minLength }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; minLength?: number }) {
  return <label className="grid gap-1 text-sm font-medium text-grafite-arroxeado">{label}
    <input className="rounded-xl border border-cinza-quente px-3 py-2.5" type={type} value={value} required={required} minLength={minLength} onChange={(event) => onChange(event.target.value)} />
  </label>;
}
