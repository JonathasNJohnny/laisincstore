import { useEffect, useState } from "react";
import { createHeroBanner, deleteHeroBanner, getAdminHeroBanners, getHeroBannerImageUrl, type HeroBanner, updateHeroBanner } from "../../services/api";

type BannerForm = { id?: number | string; imageUrl: string; redirectLink: string; active: boolean; position: string };
const emptyForm: BannerForm = { imageUrl: "", redirectLink: "", active: true, position: "0" };

export function BannersTab() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBanners = async () => {
    setLoading(true); setError("");
    try { setBanners((await getAdminHeroBanners()).slice().sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar os banners."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadBanners(); }, []);
  useEffect(() => {
    if (!image) return setPreview("");
    const url = URL.createObjectURL(image); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  const reset = () => { setForm(emptyForm); setImage(null); setError(""); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const position = Number(form.position);
    if (!Number.isInteger(position) || position < 0) return setError("Informe uma posição inteira igual ou maior que zero.");
    if (!image && !form.imageUrl.trim() && !form.id) return setError("Envie uma imagem ou informe a URL da imagem.");
    setSaving(true); setError("");
    try {
      const payload = new FormData(); if (image) payload.append("image", image); if (form.imageUrl.trim()) payload.append("image_url", form.imageUrl.trim());
      payload.append("redirect_link", form.redirectLink.trim()); payload.append("active", form.active ? "1" : "0"); payload.append("position", String(position));
      if (form.id) await updateHeroBanner(form.id, payload); else await createHeroBanner(payload);
      reset(); await loadBanners();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o banner."); }
    finally { setSaving(false); }
  };
  const edit = (banner: HeroBanner) => { setForm({ id: banner.id, imageUrl: banner.image_url ?? banner.image ?? "", redirectLink: banner.redirect_link ?? "", active: banner.active !== 0 && banner.active !== false && banner.active !== "0", position: String(banner.position ?? 0) }); setImage(null); setError(""); };
  const remove = async (id: number | string) => { if (!window.confirm("Deseja realmente excluir este banner?")) return; try { await deleteHeroBanner(id); if (String(form.id) === String(id)) reset(); await loadBanners(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir o banner."); } };

  return <div role="tabpanel" className="grid gap-8 lg:grid-cols-[1fr_1fr]">
    <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">{form.id ? "Editar banner" : "Adicionar banner"}</h2>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-grafite-arroxeado">Imagem do banner<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="mt-1 block w-full rounded-xl border border-dashed border-cinza-quente bg-cream px-4 py-3 text-sm" /></label>
        <p className="-mt-2 text-xs text-cinza-amarronzado">Tamanho recomendado: 1920 x 404 px.</p>
        {(preview || form.imageUrl) && <img src={preview || form.imageUrl} alt="Prévia do banner" className="h-36 w-full rounded-xl border border-cinza-quente object-cover" />}
        <label className="block text-sm font-medium text-grafite-arroxeado">URL da imagem (opcional)<input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3" /></label>
        <label className="block text-sm font-medium text-grafite-arroxeado">Link de redirecionamento<input value={form.redirectLink} onChange={(e) => setForm({ ...form, redirectLink: e.target.value })} placeholder="/produto/exemplo ou https://..." className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-grafite-arroxeado">Posição<input type="number" min="0" step="1" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1 w-full rounded-xl border border-cinza-quente bg-cream px-4 py-3" /></label><label className="flex items-center gap-2 self-end rounded-xl border border-cinza-quente bg-cream px-4 py-3 text-sm text-grafite-arroxeado"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Banner ativo</label></div>
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="flex gap-3"><button disabled={saving} className="rounded-xl bg-dourado-suave px-5 py-3 font-semibold text-roxo-profundo disabled:opacity-60">{saving ? "Salvando..." : form.id ? "Salvar alterações" : "Adicionar banner"}</button><button type="button" onClick={reset} className="rounded-xl border border-cinza-quente px-5 py-3 font-semibold text-grafite-arroxeado">Limpar</button></div>
      </form>
    </section>
    <section className="rounded-3xl border border-cinza-quente bg-branco p-6 shadow-sm"><h2 className="mb-6 text-2xl font-semibold text-roxo-profundo">Banners cadastrados</h2>{loading ? <p className="text-cinza-amarronzado">Carregando banners...</p> : banners.length === 0 ? <p className="rounded-xl bg-cream p-5 text-sm text-cinza-amarronzado">Nenhum banner cadastrado.</p> : <div className="space-y-4">{banners.map((banner) => { const active = banner.active !== 0 && banner.active !== false && banner.active !== "0"; return <article key={banner.id} className="flex gap-4 rounded-2xl border border-cinza-quente p-3"><img src={getHeroBannerImageUrl(banner)} alt="" className="h-20 w-28 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-roxo-profundo">Posição {banner.position ?? 0}</p><p className="mt-1 truncate text-xs text-cinza-amarronzado">{banner.redirect_link || "Sem redirecionamento"}</p><p className={`mt-2 text-xs font-semibold ${active ? "text-emerald-700" : "text-cinza-amarronzado"}`}>{active ? "Ativo" : "Inativo"}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => edit(banner)} className="rounded-lg border border-cinza-quente px-3 py-1.5 text-xs font-semibold">Editar</button><button type="button" onClick={() => void remove(banner.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">Excluir</button></div></div></article>; })}</div>}</section>
  </div>;
}
