import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Pencil, Play, Star, Trash2, X } from "lucide-react";
import { ApiRequestError, createProductReview, deleteProductReview, getImageUrl, getProductReviews, updateProductReview, type ProductReview, type ReviewMedia } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { openLoginMenu, toast } from "../../utils/toast";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MB = 1024 * 1024;

interface ProductReviewsProps { productId: string; onSummaryChange?: (summary: { reviewCount: number; averageRating: number }) => void; }

function Stars({ rating, size = "h-5 w-5" }: { rating: number; size?: string }) {
  return <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`${size} ${index < Math.round(rating) ? "fill-dourado-suave text-dourado-suave" : "text-cinza-quente"}`} aria-hidden="true" />)}</div>;
}

function validateFiles(files: File[], existing = 0, removing = 0) {
  if (existing - removing + files.length > 5) return "Use no máximo 5 fotos e vídeos por avaliação.";
  for (const file of files) {
    if (!imageTypes.has(file.type) && !videoTypes.has(file.type)) return "Formato de arquivo não permitido.";
    if (imageTypes.has(file.type) && file.size > 5 * MB) return "Cada foto deve ter no máximo 5 MB.";
    if (videoTypes.has(file.type) && file.size > 100 * MB) return "Cada vídeo enviado deve ter no máximo 100 MB.";
  }
  return null;
}

function ReviewMediaView({ media }: { media: ReviewMedia }) {
  const url = getImageUrl(media.url);
  return media.mediaType === "video" ? <video className="h-28 w-28 rounded-lg object-cover" controls preload="metadata"><source src={url} /></video> : <img className="h-28 w-28 rounded-lg object-cover" src={url} alt="Mídia da avaliação" />;
}

function ReviewMediaGallery({ media, onOpen }: { media: ReviewMedia[]; onOpen: (index: number) => void }) {
  return <div className="mt-4 flex flex-wrap gap-3">{media.map((item, index) => {
    const isVideo = item.mediaType === "video";
    const url = getImageUrl(item.url);
    return <button key={item.id} type="button" onClick={() => onOpen(index)} className="group relative h-28 w-28 overflow-hidden rounded-lg bg-cinza-quente/30 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais focus-visible:ring-offset-2" aria-label={`Abrir ${isVideo ? "vídeo" : "foto"} ${index + 1} da avaliação`}>
      {isVideo ? <video className="h-full w-full object-cover" muted playsInline preload="metadata"><source src={url} /></video> : <img className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" src={url} alt={`Foto ${index + 1} da avaliação`} />}
      <span className="absolute inset-0 flex items-center justify-center bg-roxo-profundo/0 text-branco transition-colors group-hover:bg-roxo-profundo/30">{isVideo && <span className="flex h-10 w-10 items-center justify-center rounded-full bg-branco/90 text-roxo-profundo"><Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" /></span>}</span>
    </button>;
  })}</div>;
}

function ReviewMediaModal({ viewer, onClose, onNavigate }: { viewer: { media: ReviewMedia[]; index: number }; onClose: () => void; onNavigate: (direction: number) => void }) {
  const media = viewer.media[viewer.index];
  const hasNavigation = viewer.media.length > 1;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Visualização de mídia da avaliação" onClick={onClose}>
    <div className="relative flex max-h-[92vh] w-fit max-w-[min(96vw,1100px)] items-center justify-center rounded-2xl border border-cinza-quente bg-branco p-3 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:p-5" onClick={(event) => event.stopPropagation()}>
    <button type="button" onClick={onClose} className="absolute right-2 top-2 z-10 rounded-full bg-cinza-quente/60 p-2 text-grafite-arroxeado transition hover:bg-cinza-quente focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 sm:right-3 sm:top-3" aria-label="Fechar visualização"><X className="h-5 w-5" /></button>
    {hasNavigation && <button type="button" onClick={(event) => { event.stopPropagation(); onNavigate(-1); }} className="absolute left-4 rounded-full bg-roxo-profundo/90 p-3 text-branco shadow-lg transition hover:bg-roxo-profundo focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais dark:bg-zinc-800 dark:hover:bg-zinc-700 sm:left-7" aria-label="Mídia anterior"><ChevronLeft className="h-7 w-7" /></button>}
    <div className="flex max-h-[82vh] max-w-[calc(100vw-4.5rem)] items-center justify-center overflow-hidden rounded-xl bg-cinza-quente/20 dark:bg-zinc-950">{media.mediaType === "video" ? <video key={media.id} className="max-h-[82vh] max-w-full object-contain" controls autoPlay playsInline><source src={getImageUrl(media.url)} />Seu navegador não suporta vídeos.</video> : <img className="max-h-[82vh] max-w-full object-contain" src={getImageUrl(media.url)} alt="Foto ampliada da avaliação" />}</div>
    {hasNavigation && <button type="button" onClick={(event) => { event.stopPropagation(); onNavigate(1); }} className="absolute right-4 rounded-full bg-roxo-profundo/90 p-3 text-branco shadow-lg transition hover:bg-roxo-profundo focus:outline-none focus-visible:ring-2 focus-visible:ring-rosa-lais dark:bg-zinc-800 dark:hover:bg-zinc-700 sm:right-7" aria-label="Próxima mídia"><ChevronRight className="h-7 w-7" /></button>}
    </div>
  </div>;
}

export function ProductReviews({ productId, onSummaryChange }: ProductReviewsProps) {
  const { user, logout } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState({ reviewCount: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductReview | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ media: ReviewMedia[]; index: number } | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await getProductReviews(productId);
      setReviews(response.reviews ?? []);
      setSummary(response.summary);
      onSummaryChange?.(response.summary);
    } catch { toast.warn("Não foi possível carregar as avaliações."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadReviews(); }, [productId]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mediaViewer) return;
      if (event.key === "Escape") setMediaViewer(null);
      if (event.key === "ArrowLeft") setMediaViewer((current) => current && { ...current, index: (current.index - 1 + current.media.length) % current.media.length });
      if (event.key === "ArrowRight") setMediaViewer((current) => current && { ...current, index: (current.index + 1) % current.media.length });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mediaViewer]);
  const ownReview = useMemo(() => reviews.find((review) => String(review.userId) === String(user?.id)), [reviews, user?.id]);

  const handleDelete = async (review: ProductReview) => {
    if (!window.confirm("Deseja excluir sua avaliação?")) return;
    try { await deleteProductReview(productId, review.id); await loadReviews(); }
    catch (error) { handleRequestError(error, logout); }
  };

  return <>
    <section className="container py-10 lg:py-14" aria-labelledby="reviews-title">
      <div className="rounded-2xl border border-cinza-quente bg-branco p-5 lg:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 id="reviews-title" className="font-serif text-2xl font-bold text-roxo-profundo">Avaliações</h2><div className="mt-2 flex items-center gap-2"><Stars rating={summary.averageRating} /><span className="font-semibold text-grafite-arroxeado">{summary.averageRating.toFixed(1).replace(".", ",")}</span><span className="text-sm text-cinza-amarronzado">({summary.reviewCount} {summary.reviewCount === 1 ? "avaliação" : "avaliações"})</span></div></div>
          {user ? (ownReview ? <button type="button" onClick={() => { setEditing(ownReview); setFormOpen(true); }} className="rounded-xl border border-rosa-lais px-4 py-2.5 font-semibold text-rosa-lais hover:bg-rosa-lais/10">Editar avaliação</button> : <button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className="rounded-xl bg-rosa-lais px-4 py-2.5 font-semibold text-branco hover:opacity-90">Avaliar produto</button>) : <button type="button" onClick={() => { toast.warn("Faça login para avaliar este produto."); openLoginMenu(); }} className="rounded-xl bg-rosa-lais px-4 py-2.5 font-semibold text-branco hover:opacity-90">Avaliar produto</button>}
        </div>
        {formOpen && <ReviewForm productId={productId} review={editing} onClose={() => setFormOpen(false)} onSaved={async () => { setFormOpen(false); await loadReviews(); }} />}
        <div className="mt-7 space-y-5 border-t border-cinza-quente pt-6">
          {loading ? <p className="text-cinza-amarronzado">Carregando avaliações...</p> : reviews.length === 0 ? <p className="text-cinza-amarronzado">Ainda não há avaliações. Seja a primeira pessoa a avaliar!</p> : reviews.map((review) => <article key={review.id} className="border-b border-cinza-quente pb-5 last:border-0"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-roxo-profundo">{review.userName}</p><div className="mt-1 flex items-center gap-3"><Stars rating={review.rating} size="h-4 w-4" /><time className="text-xs text-cinza-amarronzado">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(review.createdAt))}</time></div></div>{String(review.userId) === String(user?.id) && <div className="flex gap-2"><button type="button" onClick={() => { setEditing(review); setFormOpen(true); }} className="text-cinza-amarronzado hover:text-rosa-lais" aria-label="Editar avaliação"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void handleDelete(review)} className="text-cinza-amarronzado hover:text-rosa-lais" aria-label="Excluir avaliação"><Trash2 className="h-4 w-4" /></button></div>}</div>{review.comment && <p className="mt-3 whitespace-pre-wrap text-grafite-arroxeado">{review.comment}</p>}{review.media.length > 0 && <ReviewMediaGallery media={review.media} onOpen={(index) => setMediaViewer({ media: review.media, index })} />}</article>)}
        </div>
      </div>
    </section>
    {mediaViewer && <ReviewMediaModal viewer={mediaViewer} onClose={() => setMediaViewer(null)} onNavigate={(direction) => setMediaViewer((current) => current && { ...current, index: (current.index + direction + current.media.length) % current.media.length })} />}
  </>;
}

function handleRequestError(error: unknown, logout: () => void) {
  if (error instanceof ApiRequestError && error.status === 401) { logout(); toast.warn("Sua sessão expirou. Faça login novamente."); openLoginMenu(); return; }
  const messages: Record<string, string> = { REVIEW_FORBIDDEN: "Você não tem permissão para alterar esta avaliação.", REVIEW_ALREADY_EXISTS: "Você já possui uma avaliação deste produto.", INVALID_REVIEW: "Revise a nota e os dados da avaliação.", TOO_MANY_MEDIA: "Use no máximo 5 fotos e vídeos.", IMAGE_TOO_LARGE: "Cada foto deve ter no máximo 5 MB.", VIDEO_TOO_LARGE_AFTER_COMPRESSION: "Envie um vídeo menor ou mais curto.", VIDEO_PROCESSING_FAILED: "Não foi possível processar o vídeo. Tente outro arquivo." };
  toast.warn(error instanceof ApiRequestError && error.code ? messages[error.code] ?? error.message : "Não foi possível salvar sua avaliação.");
}

function ReviewForm({ productId, review, onClose, onSaved }: { productId: string; review: ProductReview | null; onClose: () => void; onSaved: () => Promise<void>; }) {
  const { logout } = useAuth();
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<(number | string)[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);
  const keptMedia = review?.media.filter((media) => !removedMediaIds.includes(media.id)) ?? [];

  const selectFiles = (selected: FileList | null) => {
    const next = [...files, ...Array.from(selected ?? [])];
    const validation = validateFiles(next, review?.media.length ?? 0, removedMediaIds.length);
    if (validation) { setError(validation); return; }
    setError(""); setFiles(next);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) { setError("Escolha uma nota de 1 a 5 estrelas."); return; }
    setSubmitting(true); setError("");
    const data = new FormData(); data.append("rating", String(rating)); data.append("comment", comment.trim()); files.forEach((file) => data.append("media", file)); if (removedMediaIds.length) data.append("removeMediaIds", JSON.stringify(removedMediaIds));
    try { if (review) await updateProductReview(productId, review.id, data); else await createProductReview(productId, data); await onSaved(); }
    catch (requestError) { handleRequestError(requestError, logout); }
    finally { setSubmitting(false); }
  };
  return <form onSubmit={(event) => void submit(event)} className="mt-6 rounded-xl bg-cream p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-roxo-profundo">{review ? "Editar sua avaliação" : "Sua avaliação"}</h3><button type="button" onClick={onClose} className="text-cinza-amarronzado hover:text-rosa-lais" aria-label="Fechar formulário"><X className="h-5 w-5" /></button></div><fieldset className="mt-4"><legend className="text-sm font-medium text-grafite-arroxeado">Sua nota</legend><div className="mt-1 flex">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className="p-1" aria-label={`${value} estrelas`}><Star className={`h-7 w-7 ${value <= rating ? "fill-dourado-suave text-dourado-suave" : "text-cinza-quente"}`} /></button>)}</div></fieldset><label className="mt-4 block text-sm font-medium text-grafite-arroxeado">Comentário<textarea value={comment} maxLength={2000} onChange={(event) => setComment(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-cinza-quente bg-branco p-3 focus:outline-none focus:ring-2 focus:ring-rosa-lais" /></label><p className="mt-1 text-right text-xs text-cinza-amarronzado">{comment.length}/2000</p><div className="mt-4"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cinza-quente bg-branco px-3 py-2 text-sm font-semibold text-grafite-arroxeado hover:border-rosa-lais"><ImagePlus className="h-4 w-4" />Adicionar fotos ou vídeos<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" multiple className="sr-only" onChange={(event) => selectFiles(event.target.files)} /></label><p className="mt-1 text-xs text-cinza-amarronzado">Até 5 mídias. Fotos até 5 MB e vídeos até 100 MB.</p></div>{(keptMedia.length > 0 || previews.length > 0) && <div className="mt-4 flex flex-wrap gap-3">{keptMedia.map((media) => <div key={media.id} className="relative"><ReviewMediaView media={media} /><button type="button" onClick={() => setRemovedMediaIds((ids) => [...ids, media.id])} className="absolute -right-2 -top-2 rounded-full bg-rosa-lais p-1 text-branco" aria-label="Remover mídia"><X className="h-3 w-3" /></button></div>)}{previews.map(({ file, url }, index) => <div key={url} className="relative">{file.type.startsWith("video/") ? <video className="h-28 w-28 rounded-lg object-cover" src={url} controls preload="metadata" /> : <img className="h-28 w-28 rounded-lg object-cover" src={url} alt="Prévia do envio" />}<button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="absolute -right-2 -top-2 rounded-full bg-rosa-lais p-1 text-branco" aria-label="Remover mídia"><X className="h-3 w-3" /></button></div>)}</div>}{error && <p className="mt-3 text-sm text-rosa-lais">{error}</p>}<button disabled={submitting} className="mt-5 rounded-xl bg-rosa-lais px-4 py-2.5 font-semibold text-branco disabled:opacity-60">{submitting ? "Enviando avaliação..." : "Salvar avaliação"}</button></form>;
}
