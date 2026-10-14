"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AQUECIMENTO,
  REGRAS_EVOLUCAO,
  exerciciosDoTipo,
  planoDoDia,
  type Exercicio,
  type TipoTreino,
} from "@/lib/exercicios";
import { PERFIL } from "@/lib/perfil";
import { DIAS_SEMANA, diasEntre, formatarData, hojeISO } from "@/lib/datas";
import type { SerieFeita, TreinoRealizado } from "@/lib/tipos";
import { CartaoExercicio } from "./CartaoExercicio";
import { TimerDescanso } from "./TimerDescanso";
import { Cartao, Carregando, Titulo, botaoPrimario, botaoSecundario, useMontado } from "./ui";

type Progresso = { feitas: Record<string, number>; cardioId?: string };

export function Hoje() {
  const montado = useMontado();
  if (!montado) return <Carregando />;
  return <HojeConteudo />;
}

function HojeConteudo() {
  const hoje = hojeISO();
  const diaSemana = new Date().getDay();
  const plano = planoDoDia(diaSemana);

  const [dados, setDados] = useState<{
    ultimaPesagem: string | null;
    primeiroTreino: string | null;
    treinosHoje: TreinoRealizado[];
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("pesagens").select("data").order("data", { ascending: false }).limit(1),
      supabase.from("treinos_realizados").select("data").order("data").limit(1),
      supabase.from("treinos_realizados").select("*").eq("data", hoje),
    ]).then(([p, t, h]) => {
      const falha = p.error ?? t.error ?? h.error;
      if (falha) return setErro(falha.message);
      setDados({
        ultimaPesagem: p.data?.[0]?.data ?? null,
        primeiroTreino: t.data?.[0]?.data ?? null,
        treinosHoje: h.data as TreinoRealizado[],
      });
    });
  }, [hoje]);

  if (erro) return <p className="text-red-400">Erro ao carregar: {erro}</p>;
  if (!dados) return <Carregando />;

  const diasSemPesar = dados.ultimaPesagem ? diasEntre(dados.ultimaPesagem, hoje) : null;
  const precisaPesar = diasSemPesar === null || diasSemPesar >= 7;
  const semana1 = !dados.primeiroTreino || diasEntre(dados.primeiroTreino, hoje) < 7;

  return (
    <>
      <Titulo sub={`${DIAS_SEMANA[diaSemana]}, ${formatarData(hoje, { day: "numeric", month: "long" })}`}>
        {plano.titulo}
      </Titulo>

      {precisaPesar && (
        <div className="mb-5 rounded-2xl border-2 border-alerta bg-alerta/10 p-4">
          <p className="text-xl font-bold text-alerta">⚖️ Hora de se pesar</p>
          <p className="mt-1 text-base text-suave">
            {diasSemPesar === null
              ? "Você ainda não registrou nenhuma pesagem."
              : `Última pesagem há ${diasSemPesar} dias.`}{" "}
            Ideal: segunda de manhã, em jejum.
          </p>
          <Link
            href="/peso#registrar"
            className="mt-3 flex h-14 w-full items-center justify-center rounded-2xl bg-alerta text-lg font-semibold text-black active:scale-[0.98]"
          >
            Registrar peso
          </Link>
        </div>
      )}

      {plano.tipo === null ? (
        <Cartao>
          <p className="text-xl font-semibold">Dia de descanso 😴</p>
          <p className="mt-2 text-suave">
            Descanso também é treino: o músculo se recupera hoje. Capriche na dieta e no sono.
          </p>
        </Cartao>
      ) : (
        <Treino
          key={plano.tipo}
          tipo={plano.tipo}
          hoje={hoje}
          semana1={semana1}
          jaFeitos={dados.treinosHoje}
          opcional={plano.opcional}
        />
      )}
    </>
  );
}

function chaveProgresso(hoje: string) {
  return `treino-progresso-${hoje}`;
}

function lerProgresso(hoje: string): Progresso {
  try {
    const salvo = localStorage.getItem(chaveProgresso(hoje));
    if (salvo) return JSON.parse(salvo);
  } catch {}
  return { feitas: {} };
}

type TreinoProps = {
  tipo: TipoTreino;
  hoje: string;
  semana1: boolean;
  jaFeitos: TreinoRealizado[];
  opcional?: boolean;
};

function Treino({ tipo, hoje, semana1, jaFeitos, opcional }: TreinoProps) {
  const opcoes = useMemo(() => exerciciosDoTipo(tipo, PERFIL.equipamentos), [tipo]);
  const [progresso, setProgresso] = useState<Progresso>(() => lerProgresso(hoje));
  const [terminaEm, setTerminaEm] = useState<number | null>(null);
  const [notas, setNotas] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [concluidos, setConcluidos] = useState(jaFeitos);
  const [refazer, setRefazer] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(chaveProgresso(hoje), JSON.stringify(progresso));
    } catch {}
  }, [hoje, progresso]);

  // No cardio escolhe-se uma opção; nos outros dias aparecem todos.
  const cardioId = progresso.cardioId ?? opcoes[0]?.id;
  const exercicios: Exercicio[] =
    tipo === "cardio" ? opcoes.filter((e) => e.id === cardioId) : opcoes;

  const totalDe = (e: Exercicio) => (semana1 && tipo === "forca" ? Math.min(e.series, 2) : e.series);

  const fimTimer = useCallback(() => setTerminaEm(null), []);

  function mudarSeries(e: Exercicio, feitas: number) {
    const antes = progresso.feitas[e.id] ?? 0;
    setProgresso((p) => ({ ...p, feitas: { ...p.feitas, [e.id]: feitas } }));
    if (feitas > antes && e.descansoSeg > 0) setTerminaEm(daquiA(e.descansoSeg));
  }

  async function concluir() {
    setSalvando(true);
    setErro(null);
    const series: SerieFeita[] = exercicios.map((e) => ({
      id: e.id,
      nome: e.nome,
      feitas: progresso.feitas[e.id] ?? 0,
      total: totalDe(e),
    }));
    const supabase = createClient();
    const { data, error } = await supabase
      .from("treinos_realizados")
      .insert({ data: hoje, tipo, series_feitas: { exercicios: series }, notas: notas.trim() || null })
      .select()
      .single();
    setSalvando(false);
    if (error) return setErro(error.message);
    try {
      localStorage.removeItem(chaveProgresso(hoje));
    } catch {}
    setProgresso({ feitas: {} });
    setNotas("");
    setTerminaEm(null);
    setRefazer(false);
    setConcluidos((c) => [...c, data as TreinoRealizado]);
  }

  if (concluidos.length > 0 && !refazer) {
    return (
      <Cartao className="border-destaque/60">
        <p className="text-2xl font-bold text-destaque">Treino concluído ✅</p>
        <p className="mt-2 text-suave">Mandou bem! Registrado no histórico.</p>
        <button onClick={() => setRefazer(true)} className={`${botaoSecundario} mt-4`}>
          Registrar outro treino hoje
        </button>
      </Cartao>
    );
  }

  const totalSeries = exercicios.reduce((s, e) => s + totalDe(e), 0);
  const seriesFeitas = exercicios.reduce(
    (s, e) => s + Math.min(progresso.feitas[e.id] ?? 0, totalDe(e)),
    0,
  );

  return (
    <div className="space-y-4">
      {opcional && <p className="text-suave">Dia leve. Se der vontade, uma caminhada tranquila.</p>}

      {tipo === "forca" && (
        <Cartao>
          <p className="font-semibold">🔥 Aquecimento ({AQUECIMENTO.duracao})</p>
          <p className="text-suave">{AQUECIMENTO.itens.join(" · ")}</p>
        </Cartao>
      )}

      {semana1 && tipo === "forca" && (
        <p className="rounded-2xl bg-destaque/10 p-3 text-base text-destaque">
          Semana 1: só 2 séries por exercício. Na próxima semana passa para 3.
        </p>
      )}

      {tipo === "cardio" && opcoes.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          {opcoes.map((o) => (
            <button
              key={o.id}
              onClick={() => setProgresso((p) => ({ ...p, cardioId: o.id }))}
              className={`min-h-14 rounded-2xl border-2 px-3 py-2 text-base font-semibold ${
                o.id === cardioId ? "border-destaque text-destaque" : "border-borda text-suave"
              }`}
            >
              {o.nome}
            </button>
          ))}
        </div>
      )}

      {exercicios.map((e) => (
        <CartaoExercicio
          key={e.id}
          exercicio={e}
          totalSeries={totalDe(e)}
          feitas={progresso.feitas[e.id] ?? 0}
          onMudar={(f) => mudarSeries(e, f)}
        />
      ))}

      {tipo === "forca" && (
        <p className="text-base text-suave">💡 {REGRAS_EVOLUCAO[1]}</p>
      )}

      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Notas (opcional): como foi o treino?"
        rows={2}
        className="w-full rounded-2xl border border-borda bg-fundo p-4 text-lg outline-none focus:border-destaque"
      />

      <p className="text-center text-suave">
        {seriesFeitas} de {totalSeries} {totalSeries === 1 ? "série" : "séries"}
      </p>
      <button onClick={concluir} disabled={salvando || seriesFeitas === 0} className={botaoPrimario}>
        {salvando ? "Salvando…" : "Concluir treino"}
      </button>
      {erro && <p className="text-red-400">{erro}</p>}

      {terminaEm && (
        <TimerDescanso terminaEm={terminaEm} onFim={fimTimer} onAjustar={setTerminaEm} />
      )}
    </div>
  );
}

/** Horário (ms) daqui a `seg` segundos. Chamado só em eventos de clique. */
function daquiA(seg: number) {
  return Date.now() + seg * 1000;
}
