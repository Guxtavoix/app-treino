import {
  AQUECIMENTO,
  CAMINHADA_LEVE,
  CARDIO,
  FORCA,
  REGRAS_EVOLUCAO,
  disponiveis,
  type Exercicio,
} from "@/lib/exercicios";
import { PERFIL } from "@/lib/perfil";

export default function ExerciciosPage() {
  const forca = disponiveis(FORCA, PERFIL.equipamentos);
  const cardio = disponiveis(CARDIO, PERFIL.equipamentos);

  return (
    <>
      <header className="mb-5">
        <h1 className="text-3xl font-bold">Exercícios</h1>
      </header>

      <section className="mb-6 rounded-2xl border border-destaque/40 bg-destaque/10 p-4">
        <h2 className="mb-2 text-lg font-semibold text-destaque">Regras de evolução</h2>
        <ul className="list-disc space-y-1 pl-5 text-base">
          {REGRAS_EVOLUCAO.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <Secao titulo={`Aquecimento (${AQUECIMENTO.duracao})`}>
        <div className="rounded-2xl border border-borda bg-cartao p-4">
          <p>{AQUECIMENTO.itens.join(" · ")}</p>
        </div>
      </Secao>

      <Secao titulo="Treino de Força" sub="Seg / Qua / Sex · descanso 60–90s entre séries">
        {forca.map((e) => (
          <Item key={e.id} e={e} />
        ))}
      </Secao>

      <Secao titulo="Cardio" sub="Ter / Qui · escolher um">
        {cardio.map((e) => (
          <Item key={e.id} e={e} />
        ))}
      </Secao>

      <Secao titulo="Caminhada leve" sub="Sábado · opcional">
        {CAMINHADA_LEVE.map((e) => (
          <Item key={e.id} e={e} />
        ))}
      </Secao>
    </>
  );
}

function Secao({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold">{titulo}</h2>
      {sub && <p className="mb-2 text-base text-suave">{sub}</p>}
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function Item({ e }: { e: Exercicio }) {
  return (
    <article className="rounded-2xl border border-borda bg-cartao p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{e.nome}</h3>
        <span className="shrink-0 text-base text-suave">
          {e.series > 1 ? `${e.series} x ` : ""}
          {e.reps}
        </span>
      </div>
      <p className="mt-2 text-base">
        <span className="text-destaque">Dica:</span> {e.dica}
      </p>
      {e.versaoFacil && (
        <p className="text-base">
          <span className="text-alerta">Mais fácil:</span> {e.versaoFacil}
        </p>
      )}
    </article>
  );
}
