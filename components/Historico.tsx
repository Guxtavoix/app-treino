"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { META_SEMANAL, NOMES_TIPO, type TipoTreino } from "@/lib/exercicios";
import { deISO, formatarData, hojeISO, inicioDaSemana, paraISO, somarDias } from "@/lib/datas";
import type { TreinoRealizado } from "@/lib/tipos";
import { Cartao, Carregando, Titulo, botaoSecundario, campo, useMontado } from "./ui";

const COR_TIPO: Record<TipoTreino, string> = {
  forca: "bg-destaque",
  cardio: "bg-sky-400",
  caminhada: "bg-violet-400",
};

export function Historico() {
  const montado = useMontado();
  if (!montado) return <Carregando />;
  return <HistoricoConteudo />;
}

type Semana = { inicio: string; forca: number; cardio: number; caminhada: number; treinos: TreinoRealizado[] };

function cumpriu(s: Semana | undefined) {
  return !!s && s.forca >= META_SEMANAL.forca && s.cardio >= META_SEMANAL.cardio;
}

function HistoricoConteudo() {
  const router = useRouter();
  const [treinos, setTreinos] = useState<TreinoRealizado[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mes, setMes] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    createClient()
      .from("treinos_realizados")
      .select("*")
      .order("data", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setTreinos(data as TreinoRealizado[]);
      });
  }, []);

  async function sair() {
    await createClient().auth.signOut();
    router.replace("/login");
  }

  if (erro) return <p className="text-red-400">{erro}</p>;
  if (!treinos) return <Carregando />;

  const hoje = hojeISO();
  const semanas = new Map<string, Semana>();
  for (const t of treinos) {
    const inicio = inicioDaSemana(t.data);
    const s = semanas.get(inicio) ?? { inicio, forca: 0, cardio: 0, caminhada: 0, treinos: [] };
    s[t.tipo]++;
    s.treinos.push(t);
    semanas.set(inicio, s);
  }

  // Streak: semanas seguidas cumprindo o plano. A semana atual só conta se já foi cumprida.
  const semanaAtual = inicioDaSemana(hoje);
  let cursor = cumpriu(semanas.get(semanaAtual)) ? semanaAtual : somarDias(semanaAtual, -7);
  let streak = 0;
  while (cumpriu(semanas.get(cursor))) {
    streak++;
    cursor = somarDias(cursor, -7);
  }

  const atual = semanas.get(semanaAtual);

  return (
    <>
      <Titulo>Histórico</Titulo>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Cartao>
          <p className="text-sm text-suave">Sequência</p>
          <p className="text-4xl font-bold">🔥 {streak}</p>
          <p className="text-sm text-suave">{streak === 1 ? "semana cumprida" : "semanas cumpridas"}</p>
        </Cartao>
        <Cartao>
          <p className="text-sm text-suave">Esta semana</p>
          <p className="text-lg font-semibold">
            Força {atual?.forca ?? 0}/{META_SEMANAL.forca}
          </p>
          <p className="text-lg font-semibold">
            Cardio {atual?.cardio ?? 0}/{META_SEMANAL.cardio}
          </p>
        </Cartao>
      </div>

      <Calendario mes={mes} setMes={setMes} treinos={treinos} hoje={hoje} />

      <section className="mt-6">
        <h2 className="mb-2 text-xl font-bold">Treinos concluídos</h2>
        {treinos.length === 0 && <p className="text-suave">Nenhum treino registrado ainda.</p>}
        <div className="space-y-4">
          {[...semanas.values()].map((s) => (
            <div key={s.inicio}>
              <p className="mb-1 text-sm text-suave">
                Semana de {formatarData(s.inicio)} {cumpriu(s) ? "· ✅ plano cumprido" : ""}
              </p>
              <ul className="space-y-2">
                {s.treinos.map((t) => (
                  <ItemTreino key={t.id} t={t} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <TrocarSenha />

      <button onClick={sair} className={`${botaoSecundario} mt-3`}>
        Sair
      </button>
    </>
  );
}

function TrocarSenha() {
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return setMsg({ ok: false, texto: "Use pelo menos 6 caracteres." });
    setSalvando(true);
    const { error } = await createClient().auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) return setMsg({ ok: false, texto: error.message });
    setSenha("");
    setMsg({ ok: true, texto: "Senha alterada." });
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className={`${botaoSecundario} mt-10`}>
        Trocar senha
      </button>
    );
  }

  return (
    <Cartao className="mt-10">
      <form onSubmit={salvar} className="space-y-3">
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={campo}
        />
        <button type="submit" disabled={salvando} className={botaoSecundario}>
          {salvando ? "Salvando…" : "Salvar nova senha"}
        </button>
        {msg && <p className={msg.ok ? "text-destaque" : "text-red-400"}>{msg.texto}</p>}
      </form>
    </Cartao>
  );
}

function ItemTreino({ t }: { t: TreinoRealizado }) {
  const exs = t.series_feitas?.exercicios ?? [];
  const feitas = exs.reduce((s, e) => s + e.feitas, 0);
  const total = exs.reduce((s, e) => s + e.total, 0);
  return (
    <li className="rounded-2xl border border-borda bg-cartao p-3">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${COR_TIPO[t.tipo]}`} aria-hidden />
        <p className="flex-1 text-lg font-semibold">{NOMES_TIPO[t.tipo]}</p>
        <p className="text-base text-suave">{formatarData(t.data, { weekday: "short", day: "2-digit", month: "2-digit" })}</p>
      </div>
      {total > 0 && (
        <p className="text-base text-suave">
          {exs.length === 1 ? exs[0].nome + " · " : ""}
          {feitas}/{total} séries
        </p>
      )}
      {t.notas && <p className="mt-1 text-base">{t.notas}</p>}
    </li>
  );
}

function Calendario({
  mes,
  setMes,
  treinos,
  hoje,
}: {
  mes: Date;
  setMes: (d: Date) => void;
  treinos: TreinoRealizado[];
  hoje: string;
}) {
  const porDia = new Map<string, TipoTreino[]>();
  for (const t of treinos) porDia.set(t.data, [...(porDia.get(t.data) ?? []), t.tipo]);

  // Grade de segunda a domingo cobrindo o mês inteiro.
  const ultimo = paraISO(new Date(mes.getFullYear(), mes.getMonth() + 1, 0));
  const fimGrade = somarDias(inicioDaSemana(ultimo), 6);
  const dias: string[] = [];
  for (let d = inicioDaSemana(paraISO(mes)); d <= fimGrade; d = somarDias(d, 1)) dias.push(d);

  const titulo = mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <Cartao>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
          className="h-12 w-12 rounded-xl border border-borda text-xl"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <p className="text-lg font-semibold capitalize">{titulo}</p>
        <button
          onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
          className="h-12 w-12 rounded-xl border border-borda text-xl"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
          <span key={i} className="pb-1 text-suave">
            {d}
          </span>
        ))}
        {dias.map((d) => {
          const dt = deISO(d);
          const doMes = dt.getMonth() === mes.getMonth();
          const tipos = porDia.get(d) ?? [];
          return (
            <div
              key={d}
              className={`flex h-11 flex-col items-center justify-center rounded-lg ${
                d === hoje ? "border border-destaque" : ""
              } ${doMes ? "" : "opacity-30"}`}
            >
              <span>{dt.getDate()}</span>
              <span className="flex h-2 gap-0.5">
                {tipos.slice(0, 3).map((t, i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${COR_TIPO[t]}`} />
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-suave">
        {(Object.keys(COR_TIPO) as TipoTreino[]).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${COR_TIPO[t]}`} /> {NOMES_TIPO[t]}
          </span>
        ))}
      </div>
    </Cartao>
  );
}
