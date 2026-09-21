import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Heart, Pencil, Sparkles } from "lucide-react";
import laisPfp from "../../assets/lais_pfp.png";
import {
  createAboutMe,
  getAboutMe,
  getImageUrl,
  updateAboutMe,
  type AboutMe,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const defaultAbout: AboutMe = {
  mini_title: "Nossa história",
  title: "Prazer, eu sou a CEO da LaísInc",
  about_me:
    "Streamer cristã apaixonada por games e artesanato, decidi juntar tudo em um único cantinho e chamar de “minha empresa”.\n\nLaísInc nasceu um pouco assim: da vontade de transformar as coisas que amo fazer em algo que pudesse compartilhar com outras pessoas. Entre uma partida, linhas de crochê, ideias fluindo e algumas boas doses de caos, percebi que não precisava escolher entre as coisas que gosto, mas podia juntar tudo e criar um espaço que tivesse a minha cara.",
  second_title: "Aqui você encontra um pouco de cada parte desse universo",
  twt_title: "Nas lives",
  twt_text:
    "Tem Valorant, conversa, risadas, momentos inesperados e aquela bagunça que só acontece quando eu aperto o botão “iniciar transmissão”, mas é, acima de tudo, um lugar para se conectar com outras pessoas.",
  ytb_title: "No YouTube",
  ytb_text:
    "Ficam os vlogs, bastidores, projetos, tutoriais e resumos das lives. A melhor parte é que você pode assistir sempre que quiser.",
  last_text:
    "Mas acima de todas essas coisas, minha fé faz parte de quem eu sou e da forma como enxergo esse projeto. Quero que esse seja um espaço leve, criativo e acolhedor, cheio de afeto em cada detalhe, onde eu possa trabalhar com aquilo que amo, mas também fazer o dia de alguém um pouco mais divertido e menos solitário.\n\nEntão… boas-vindas à LaísInc. Sinta-se à vontade para olhar a loja, interagir na live e se tornar um “funcionário” dessa empresa ou simplesmente assistir aos vídeos.\n\nEu sou A CEO e é um prazer receber você.",
};

type TextField = Exclude<keyof AboutMe, "id" | "pfp">;
const textFields: TextField[] = [
  "mini_title",
  "title",
  "about_me",
  "second_title",
  "twt_title",
  "twt_text",
  "ytb_title",
  "ytb_text",
  "last_text",
];

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </>
  );
}

const inputClass = "w-full rounded-lg border border-rosa-lais/40 bg-branco px-3 py-2 font-inherit text-inherit outline-none focus:border-rosa-lais focus:ring-2 focus:ring-rosa-lais/20";

function EditableField({ content, editing, field, label, multiline = false, onChange, rows = 4 }: {
  content: AboutMe; editing: boolean; field: TextField; label: string; multiline?: boolean; rows?: number;
  onChange: (field: TextField, value: string) => void;
}) {
  if (!editing) return <>{content[field]}</>;
  if (multiline) return <textarea aria-label={label} value={content[field]} rows={rows} onChange={(event) => onChange(field, event.target.value)} className={inputClass} />;
  return <input aria-label={label} value={content[field]} onChange={(event) => onChange(field, event.target.value)} className={inputClass} />;
}

export function AboutPage() {
  const { user } = useAuth();
  const isAdmin = user?.admin === true;
  const [about, setAbout] = useState<AboutMe>(defaultAbout);
  const [draft, setDraft] = useState<AboutMe>(defaultAbout);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aboutExists, setAboutExists] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAboutMe()
      .then((data) => {
        const content = { ...defaultAbout, ...(data ?? {}) };
        setAbout(content);
        setDraft(content);
        setAboutExists(data !== null);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!photo) return;
    const preview = URL.createObjectURL(photo);
    setPhotoPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [photo]);

  const changeField = (field: TextField, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const toggleEditing = async () => {
    if (!editing) {
      setDraft(about);
      setPhoto(null);
      setPhotoPreview("");
      setError("");
      setEditing(true);
      return;
    }
    const hasTextChanges = textFields.some((field) => draft[field] !== about[field]);
    if (!photo && aboutExists && !hasTextChanges) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      textFields.forEach((field) => payload.append(field, draft[field]));
      if (photo) payload.append("pfp", photo);
      const request = aboutExists ? updateAboutMe : createAboutMe;
      const saved = { ...defaultAbout, ...(await request(payload)) };
      setAbout(saved);
      setDraft(saved);
      setAboutExists(true);
      setPhoto(null);
      setPhotoPreview("");
      setEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSaving(false);
    }
  };

  const content = editing ? draft : about;
  const imageSrc =
    photoPreview || (content.pfp ? getImageUrl(content.pfp) : laisPfp);
  // Obtém o hostname atual dinamicamente para o parent da Twitch
  const currentHostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-16 lg:py-24">
        <div className="container relative">
          {isAdmin && (
            <button
              type="button"
              onClick={() => void toggleEditing()}
              disabled={saving}
              className="absolute right-4 top-0 inline-flex h-11 w-11 items-center justify-center rounded-full bg-roxo-profundo text-branco shadow-md transition hover:bg-roxo-profundo/90 disabled:opacity-60"
              aria-label={editing ? "Salvar alterações" : "Editar página Sobre"}
              title={editing ? "Salvar alterações" : "Editar página Sobre"}
            >
              {editing ? (
                <Check className="h-5 w-5" />
              ) : (
                <Pencil className="h-5 w-5" />
              )}
            </button>
          )}
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-16">
            <div className="mx-0 w-full max-w-sm justify-self-start">
              <div className="relative overflow-hidden rounded-2xl border border-cinza-quente bg-branco shadow-xl">
                <img
                  src={imageSrc}
                  alt="Laís, fundadora da LaísInc"
                  className="aspect-square w-full object-cover"
                />
                {editing && (
                  <>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={(event) =>
                        setPhoto(event.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute inset-x-4 bottom-4 rounded-xl bg-roxo-profundo/90 px-4 py-2 text-sm font-semibold text-branco"
                    >
                      Trocar foto
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-rosa-lais">
                <EditableField content={content} editing={editing} onChange={changeField} field="mini_title" label="Mini título" />
              </p>
              <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-roxo-profundo lg:text-4xl">
                <EditableField content={content} editing={editing} onChange={changeField} field="title" label="Título principal" />
              </h1>
              <div className="space-y-5 text-lg leading-relaxed text-cinza-amarronzado">
                {editing ? (
                  <EditableField content={content} editing={editing} onChange={changeField}
                    field="about_me"
                    label="Sobre mim"
                    multiline
                    rows={8}
                  />
                ) : (
                  <Paragraphs text={content.about_me} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="container py-16 lg:py-24"
        aria-labelledby="universe-title"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-center gap-3">
            <Sparkles
              className="h-7 w-7 shrink-0 text-rosa-lais"
              aria-hidden="true"
            />
            <h2
              id="universe-title"
              className="w-full font-serif text-3xl font-bold text-roxo-profundo lg:text-4xl"
            >
              <EditableField content={content} editing={editing} onChange={changeField} field="second_title" label="Título da segunda seção" />
            </h2>
          </div>

          {/* Seção dos Cards e Players */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Card Twitch */}
            <article className="flex flex-col justify-between border-l-4 border-rosa-lais bg-branco p-6 shadow-sm lg:p-8">
              <div>
                <p className="mb-3 text-3xl" aria-hidden="true">
                  🎮
                </p>
                <h3 className="mb-3 font-serif text-2xl font-bold text-roxo-profundo">
                  <EditableField content={content} editing={editing} onChange={changeField} field="twt_title" label="Título Twitch" />
                </h3>
                {editing ? (
                  <EditableField content={content} editing={editing} onChange={changeField}
                    field="twt_text"
                    label="Texto Twitch"
                    multiline
                    rows={6}
                  />
                ) : (
                  <p className="leading-relaxed text-cinza-amarronzado">
                    {content.twt_text}
                  </p>
                )}
              </div>

              {/* Embed Player Twitch */}
              <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-cinza-quente shadow-inner">
                <iframe
                  src={`https://player.twitch.tv/?channel=laisinc&parent=${currentHostname}&autoplay=false`}
                  className="h-full w-full"
                  allowFullScreen
                  title="Twitch Stream LaísInc"
                />
              </div>
            </article>

            {/* Card YouTube */}
            <article className="flex flex-col justify-between border-l-4 border-dourado-suave bg-branco p-6 shadow-sm lg:p-8">
              <div>
                <p className="mb-3 text-3xl" aria-hidden="true">
                  🎥
                </p>
                <h3 className="mb-3 font-serif text-2xl font-bold text-roxo-profundo">
                  <EditableField content={content} editing={editing} onChange={changeField} field="ytb_title" label="Título YouTube" />
                </h3>
                {editing ? (
                  <EditableField content={content} editing={editing} onChange={changeField}
                    field="ytb_text"
                    label="Texto YouTube"
                    multiline
                    rows={6}
                  />
                ) : (
                  <p className="leading-relaxed text-cinza-amarronzado">
                    {content.ytb_text}
                  </p>
                )}
              </div>

              {/* Embed Player YouTube - Vídeo Fixo */}
              <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-cinza-quente shadow-inner">
                <iframe
                  src="https://www.youtube.com/embed/bMFYWF9uelI?start=451"
                  className="h-full w-full"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Vídeo do YouTube LaísInc - O chat presenciou minha maior humilhação no VALORANT"
                />
              </div>
            </article>
          </div>

          <div className="mt-12 space-y-5 text-lg leading-relaxed text-cinza-amarronzado">
            {editing ? (
              <EditableField content={content} editing={editing} onChange={changeField}
                field="last_text"
                label="Texto final"
                multiline
                rows={10}
              />
            ) : (
              <Paragraphs text={content.last_text} />
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/loja"
              className="inline-flex items-center gap-2 rounded-xl bg-dourado-suave px-6 py-3 font-semibold text-roxo-profundo transition-colors hover:bg-dourado-suave/90"
            >
              Conhecer a loja{" "}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-2 text-cinza-amarronzado">
              <Heart
                className="h-5 w-5 text-rosa-lais"
                fill="currentColor"
                aria-hidden="true"
              />
              Feito com carinho
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
