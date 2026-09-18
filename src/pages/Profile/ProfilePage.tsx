import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { updateUser, type UserPayload } from "../../services/users";

const fields = [
  ["nome", "Nome"], ["telefone", "Telefone"], ["cpf", "CPF"], ["cnpj", "CNPJ"], ["cep", "CEP"],
  ["bairro", "Bairro"], ["rua", "Rua"], ["numero", "Número"], ["complemento", "Complemento"], ["recebedor", "Recebedor"],
] as const;

export function ProfilePage() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm(Object.fromEntries(fields.map(([key]) => [key, String(user[key] ?? "")])));
  }, [user]);
  if (!loading && !user) { navigate("/"); return null; }
  if (!user) return null;
  const currentUser = user;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!form.nome?.trim()) return setError("O nome é obrigatório.");
    if (password && password.length < 8) return setError("A nova senha deve ter ao menos 8 caracteres.");
    const payload: Partial<UserPayload> = {};
    fields.forEach(([key]) => { if (form[key] !== String(currentUser[key] ?? "")) payload[key] = form[key].trim(); });
    if (password) payload.senha = password;
    if (!Object.keys(payload).length) return;
    setSaving(true);
    try { setUser(await updateUser(currentUser.id, payload)); setPassword(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar os dados."); }
    finally { setSaving(false); }
  }

  return <main className="container max-w-3xl py-12 lg:py-20">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl font-bold text-roxo-profundo">Meu perfil</h1>
        <p className="mt-2 text-cinza-amarronzado">Complete ou atualize seus dados cadastrais.</p>
      </div>
      <Link to="/perfil/pedidos" className="rounded-xl border border-rosa-lais px-4 py-2.5 text-sm font-semibold text-rosa-lais transition-colors hover:bg-rosa-lais hover:text-branco">Meus pedidos</Link>
    </div>
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-cinza-quente bg-branco p-6 shadow-sm sm:grid-cols-2">
      {fields.map(([key, label]) => <label key={key} className="grid gap-1 text-sm font-medium text-grafite-arroxeado">{label}
        <input className="rounded-xl border border-cinza-quente px-3 py-2.5" value={form[key] ?? ""} required={key === "nome"} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
      </label>)}
      <label className="grid gap-1 text-sm font-medium text-grafite-arroxeado">E-mail
        <input className="rounded-xl border border-cinza-quente bg-cinza-quente/30 px-3 py-2.5" value={user.email} disabled />
      </label>
      <label className="grid gap-1 text-sm font-medium text-grafite-arroxeado">Nova senha (opcional)
        <input className="rounded-xl border border-cinza-quente px-3 py-2.5" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button disabled={saving} className="sm:col-span-2 rounded-xl bg-rosa-lais px-5 py-3 font-medium text-branco disabled:opacity-50">{saving ? "Salvando..." : "Salvar alterações"}</button>
    </form>
  </main>;
}
