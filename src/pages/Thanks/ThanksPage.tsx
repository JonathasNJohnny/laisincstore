export function ThanksPage() {
  return (
    <section
      className="container py-16 lg:py-24"
      aria-labelledby="thanks-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-rosa-lais">
          LaísInc
        </p>
        <h1
          id="thanks-title"
          className="mb-10 font-serif text-4xl font-bold text-roxo-profundo lg:text-5xl"
        >
          Agradecimentos
        </h1>

        <blockquote className="border-l-4 border-rosa-lais bg-branco p-6 text-left text-lg leading-relaxed text-cinza-amarronzado shadow-sm lg:p-8">
          Aos meus “funcionários” quero dedicar um espaço especial. Obrigada
          pelo apoio, essa “empresa” não seria nada sem vocês e eu seria CEO de
          nada.
        </blockquote>

        <p className="mt-12 font-serif text-2xl font-bold text-roxo-profundo lg:text-3xl">
          <span aria-hidden="true">👑</span> Funcionários e Vips{" "}
          <span aria-hidden="true">💎</span>
        </p>
      </div>
    </section>
  );
}
