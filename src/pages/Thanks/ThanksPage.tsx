import { useEffect, useState } from "react";

const rankingUrl = "http://laisinc.com.br:9090/Ranking/getMonthlyRanking";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

interface RankingEntry {
  username: string;
  pontos_pontualidade: string;
  horas_extras_total: string;
  pontos_totais: string;
}

interface RankingResponse {
  ranking: RankingEntry[];
  tops: Array<RankingEntry | null>;
  fechados: Record<string, string>;
  vips: Record<string, string[]>;
}

const medals = ["🥇", "🥈", "🥉"];

export function ThanksPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [tops, setTops] = useState<Array<RankingEntry | null>>([]);
  const [closedMonths, setClosedMonths] = useState<Record<string, string>>({});
  const [yearVips, setYearVips] = useState<Record<string, string[]>>({});
  const [year, setYear] = useState(currentYear);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRanking() {
      try {
        const response = await fetch(
          `${rankingUrl}?ano=${year}&mes=${currentMonth}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar o ranking.");
        }

        const data: RankingResponse = await response.json();
        setRanking(data.ranking);
        setTops(data.tops);
        setClosedMonths(data.fechados);
        setYearVips(data.vips);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          "Não foi possível carregar o ranking agora. Tente novamente mais tarde.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRanking();

    return () => controller.abort();
  }, [year]);

  const repeatedWinnerNames = new Set(
    tops
      .filter((item): item is RankingEntry => item !== null)
      .map((item) => item.username)
      .filter((username, index, names) => names.indexOf(username) !== index),
  );
  const firstVipMonthByName = new Map<string, number>();

  tops.forEach((item, index) => {
    if (
      item &&
      repeatedWinnerNames.has(item.username) &&
      !firstVipMonthByName.has(item.username)
    ) {
      firstVipMonthByName.set(item.username, index);
    }
  });

  const formatPoints = (points: string) =>
    Number(points).toLocaleString("pt-BR", {
      minimumFractionDigits: points.includes(".") ? 2 : 0,
      maximumFractionDigits: 2,
    });

  return (
    <section
      className="container py-16 lg:py-24"
      aria-labelledby="thanks-title"
    >
      <div className="mx-auto max-w-6xl text-center">
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

        <div className="mt-8 grid items-start gap-6 text-left lg:grid-cols-[26rem_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-xl border border-cinza-quente bg-[#f3f3f2] p-3 shadow-sm">
              <h2 className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-roxo-profundo">
                <span aria-hidden="true">🗓️</span> MESES DO ANO
              </h2>
              <label className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-cinza-quente bg-[#fafafa] px-3 py-2 text-sm font-medium text-grafite-arroxeado">
                <span>Ano</span>
                <input
                  className="w-20 rounded border border-cinza-quente bg-branco px-2 py-1 text-center font-semibold text-roxo-profundo"
                  min="2000"
                  max="2100"
                  onChange={(event) => {
                    setIsLoading(true);
                    setError(null);
                    setYear(Number(event.target.value));
                  }}
                  type="number"
                  value={year}
                />
              </label>

              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => {
                  const winner = tops[index];
                  const isClosed = Boolean(closedMonths[String(index + 1)]);
                  const showVip =
                    winner &&
                    firstVipMonthByName.get(winner.username) === index;

                  return (
                    <div
                      className={`overflow-hidden rounded-lg border p-2 ${
                        index + 1 === currentMonth && !isClosed
                          ? "border-rosa-lais bg-[#ffe0f1]"
                          : "border-[#d8d8e9] bg-[#fffefd]"
                      }`}
                      key={month}
                    >
                      <p className="mb-1 text-xs font-bold text-roxo-profundo">
                        {month}
                      </p>
                      <p
                        className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          isClosed
                            ? "bg-[#dff1e4] text-[#28613b]"
                            : "bg-[#f7b5df] text-[#7c245c]"
                        }`}
                      >
                        {isClosed ? "✅ Fechado" : "🔐 Aberto"}
                      </p>
                      {winner ? (
                        <>
                          <p className="truncate text-[11px] font-medium text-grafite-arroxeado">
                            <span aria-hidden="true">👑</span> {winner.username}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <p className="rounded bg-[#e7e4eb] px-1.5 py-0.5 text-[10px] text-cinza-amarronzado">
                              {formatPoints(winner.pontos_totais)} pts
                            </p>
                            {showVip && (
                              <p className="rounded-full bg-gradient-to-r from-[#fff3b5] to-[#e8b93f] px-2 py-0.5 text-[10px] font-semibold text-[#674b00]">
                                <span aria-hidden="true">⭐</span> VIP
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-cinza-amarronzado">-</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#ead9a4] bg-[#fff8dc] p-3 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-roxo-profundo">
                <span aria-hidden="true">⭐</span> Vips do ano
              </h2>
              <div className="space-y-2">
                {months.map((month, index) => {
                  const usernames = yearVips[String(index + 1)] ?? [];

                  if (usernames.length === 0) return null;

                  return usernames.map((username) => (
                    <div
                      className="flex items-center gap-3 rounded-full border border-[#f0dca7] bg-[#fffefd] px-2 py-1 text-xs font-semibold text-roxo-profundo"
                      key={`${month}-${username}`}
                    >
                      <span className="w-16 shrink-0">{month}</span>
                      <span className="rounded-full bg-gradient-to-r from-[#fff3b5] to-[#e8b93f] px-3 py-1 text-[#674b00]">
                        <span aria-hidden="true">⭐</span> {username}
                      </span>
                    </div>
                  ));
                })}
              </div>
            </section>
          </aside>

          <div className="overflow-hidden rounded-lg bg-branco text-left shadow-sm">
            {isLoading && (
              <p
                className="p-8 text-center text-cinza-amarronzado"
                role="status"
              >
                Carregando ranking...
              </p>
            )}

            {error && (
              <p
                className="p-8 text-center text-cinza-amarronzado"
                role="alert"
              >
                {error}
              </p>
            )}

            {!isLoading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <caption className="visually-hidden">
                    Ranking mensal de funcionários
                  </caption>
                  <thead>
                    <tr className="bg-roxo-profundo text-sm uppercase tracking-wide text-branco">
                      <th
                        className="px-4 py-4 text-center font-medium"
                        scope="col"
                      >
                        #
                      </th>
                      <th
                        className="px-4 py-4 text-left font-medium"
                        scope="col"
                      >
                        Funcionário
                      </th>
                      <th
                        className="px-4 py-4 text-right font-medium"
                        scope="col"
                      >
                        Pontualidade
                      </th>
                      <th
                        className="px-4 py-4 text-right font-medium"
                        scope="col"
                      >
                        H. Extra ×0,7
                      </th>
                      <th
                        className="px-4 py-4 text-right font-medium"
                        scope="col"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item, index) => (
                      <tr
                        className="border-b border-cinza-quente last:border-b-0"
                        key={`${item.username}-${index}`}
                      >
                        <td className="px-3 py-3 text-center font-semibold text-roxo-profundo">
                          {medals[index] ?? index + 1}
                        </td>
                        <th
                          className="px-3 py-3 text-left font-medium text-grafite-arroxeado"
                          scope="row"
                        >
                          {item.username}
                        </th>
                        <td className="px-3 py-3 text-right text-cinza-amarronzado">
                          {item.pontos_pontualidade}
                        </td>
                        <td className="px-3 py-3 text-right text-cinza-amarronzado">
                          {item.horas_extras_total}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-roxo-profundo">
                          {item.pontos_totais}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
