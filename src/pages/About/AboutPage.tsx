import { Link } from "react-router-dom";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import laisPfp from "../../assets/lais_pfp.png";

export function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-cream via-branco to-cream py-16 lg:py-24">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-16">
            <div className="mx-0 w-full max-w-sm justify-self-start">
              <div className="overflow-hidden rounded-2xl border border-cinza-quente bg-branco shadow-xl">
                <img
                  src={laisPfp}
                  alt="Laís, fundadora da LaísInc"
                  className="aspect-square w-full object-cover"
                />
              </div>
            </div>

            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-rosa-lais">
                Nossa história
              </p>
              <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-roxo-profundo lg:text-4xl">
                Prazer, eu sou a CEO da LaísInc
              </h1>
              <div className="space-y-5 text-lg leading-relaxed text-cinza-amarronzado">
                <p>
                  Streamer cristã apaixonada por games e artesanato, decidi
                  juntar tudo em um único cantinho e chamar de “minha empresa”.
                </p>
                <p>
                  LaísInc nasceu um pouco assim: da vontade de transformar as
                  coisas que amo fazer em algo que pudesse compartilhar com
                  outras pessoas. Entre uma partida, linhas de crochê, ideias
                  fluindo e algumas boas doses de caos, percebi que não
                  precisava escolher entre as coisas que gosto, mas podia juntar
                  tudo e criar um espaço que tivesse a minha cara.
                </p>
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
            <Sparkles className="h-7 w-7 text-rosa-lais" aria-hidden="true" />
            <h2
              id="universe-title"
              className="font-serif text-3xl font-bold text-roxo-profundo lg:text-4xl"
            >
              Aqui você encontra um pouco de cada parte desse universo
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="border-l-4 border-rosa-lais bg-branco p-6 shadow-sm lg:p-8">
              <p className="mb-3 text-3xl" aria-hidden="true">
                🎮
              </p>
              <h3 className="mb-3 font-serif text-2xl font-bold text-roxo-profundo">
                Nas lives
              </h3>
              <p className="leading-relaxed text-cinza-amarronzado">
                Tem Valorant, conversa, risadas, momentos inesperados e aquela
                bagunça que só acontece quando eu aperto o botão “iniciar
                transmissão”, mas é, acima de tudo, um lugar para se conectar
                com outras pessoas.
              </p>
            </article>

            <article className="border-l-4 border-dourado-suave bg-branco p-6 shadow-sm lg:p-8">
              <p className="mb-3 text-3xl" aria-hidden="true">
                🎥
              </p>
              <h3 className="mb-3 font-serif text-2xl font-bold text-roxo-profundo">
                No YouTube
              </h3>
              <p className="leading-relaxed text-cinza-amarronzado">
                Ficam os vlogs, bastidores, projetos, tutoriais e resumos das
                lives. A melhor parte é que você pode assistir sempre que
                quiser.
              </p>
            </article>
          </div>

          <div className="mt-12 space-y-5 text-lg leading-relaxed text-cinza-amarronzado">
            <p>
              Mas acima de todas essas coisas, minha fé faz parte de quem eu sou
              e da forma como enxergo esse projeto. Quero que esse seja um
              espaço leve, criativo e acolhedor, cheio de afeto em cada detalhe,
              onde eu possa trabalhar com aquilo que amo, mas também fazer o dia
              de alguém um pouco mais divertido e menos solitário.
            </p>
            <p>
              Então… boas-vindas à LaísInc. Sinta-se à vontade para olhar a
              loja, interagir na live e se tornar um “funcionário” dessa empresa
              ou simplesmente assistir aos vídeos.
            </p>
            <p>Eu sou A CEO e é um prazer receber você.</p>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/loja"
              className="inline-flex items-center gap-2 rounded-xl bg-dourado-suave px-6 py-3 font-semibold text-roxo-profundo transition-colors hover:bg-dourado-suave/90"
            >
              Conhecer a loja
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
