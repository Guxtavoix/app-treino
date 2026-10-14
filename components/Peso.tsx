"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PERFIL } from "@/lib/perfil";
import { diasEntre, formatarData, hojeISO } from "@/lib/datas";
import type { Pesagem } from "@/lib/tipos";
import { GraficoPeso } from "./GraficoPeso";
import { Cartao, Carregando, Titulo, botaoPrimario, campo, useMontado } from "./ui";

export function Peso() {
  const montado = useMontado();
  if (!montado) return <Carregando />;
  return <PesoConteudo />;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function PesoConteudo() {
  const [pesagens, setPesagens] = useState<Pesagem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Pesagem | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const pesoRef = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    const { data, error } = await createClient()
      .from("pesagens")
      .select("id, data, peso_kg, observacao")
      .order("data")
      .order("created_at");
    if (error) return setErro(error.message);
    setPesagens(data.map((p) => ({ ...p, peso_kg: Number(p.peso_kg) })));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial dos dados
    carregar();
  }, [carregar]);

  // Vindo do banner "Hora de se pesar" (/peso#registrar): rola até o formulário e foca.
  useEffect(() => {
    if (pesagens && window.location.hash === "#registrar") {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
      pesoRef.current?.focus();
    }
  }, [pesagens]);

  function editar(p: Pesagem) {
    setEditando(p);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function excluir(p: Pesagem) {
    if (!confirm(`Excluir a pesagem de ${formatarData(p.data)} (${fmt(p.peso_kg)} kg)?`)) return;
    const { error } = await createClient().from("pesagens").delete().eq("id", p.id);
    if (error) return setErro(error.message);
    carregar();
  }

  if (!pesagens) return erro ? <p className="text-red-400">{erro}</p> : <Carregando />;

  return (
    <>
      <Titulo>Peso</Titulo>

      <Resumo pesagens={pesagens} />

      {pesagens.length > 0 && (
        <Cartao className="mb-5 px-2">
          <GraficoPeso pesagens={pesagens} meta={PERFIL.metaKg} />
        </Cartao>
      )}

      <div ref={formRef} id="registrar" className="scroll-mt-4">
        <Formulario
          key={editando?.id ?? "novo"}
          editando={editando}
          pesoRef={pesoRef}
          onSalvo={() => {
            setEditando(null);
            carregar();
          }}
          onCancelar={() => setEditando(null)}
        />
      </div>

      {erro && <p className="mt-3 text-red-400">{erro}</p>}

      {pesagens.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xl font-bold">Pesagens</h2>
          <ul className="space-y-2">
            {[...pesagens].reverse().map((p) => (
              <li key={p.id} className="flex items-center gap-2 rounded-2xl border border-borda bg-cartao p-3">
                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    {fmt(p.peso_kg)} kg{" "}
                    <span className="text-base font-normal text-suave">· {formatarData(p.data, { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
                  </p>
                  {p.observacao && <p className="text-base text-suave">{p.observacao}</p>}
                </div>
                <button onClick={() => editar(p)} className="h-12 rounded-xl border border-borda px-3 text-base">
                  Editar
                </button>
                <button onClick={() => excluir(p)} className="h-12 rounded-xl border border-red-900 px-3 text-base text-red-400">
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Resumo({ pesagens }: { pesagens: Pesagem[] }) {
  if (pesagens.length === 0) {
    return (
      <Cartao className="mb-5">
        <p className="text-suave">
          Sem pesagens ainda. Peso inicial considerado: {PERFIL.pesoInicialKg} kg · meta {PERFIL.metaKg} kg.
        </p>
      </Cartao>
    );
  }

  const atual = pesagens[pesagens.length - 1];
  const primeira = pesagens[0];
  const perdido = PERFIL.pesoInicialKg - atual.peso_kg;
  const semanas = diasEntre(primeira.data, atual.data) / 7;
  const porSemana = semanas >= 1 ? (primeira.peso_kg - atual.peso_kg) / semanas : null;
  const falta = atual.peso_kg - PERFIL.metaKg;
  const imc = atual.peso_kg / PERFIL.alturaM ** 2;

  const cards = [
    { rotulo: "Peso atual", valor: `${fmt(atual.peso_kg)} kg`, sub: formatarData(atual.data) },
    { rotulo: "Total perdido", valor: `${fmt(perdido)} kg`, sub: `desde ${PERFIL.pesoInicialKg} kg` },
    {
      rotulo: "Média por semana",
      valor: porSemana === null ? "—" : `${fmt(porSemana)} kg`,
      sub: porSemana === null ? "precisa de 1 semana" : "esperado: 0,6–0,8",
    },
    {
      rotulo: "Falta para a meta",
      valor: falta > 0 ? `${fmt(falta)} kg` : "Meta batida! 🎉",
      sub: `meta ${PERFIL.metaKg} kg`,
    },
    { rotulo: "IMC atual", valor: fmt(imc), sub: classificarImc(imc) },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3">
      {cards.map((c, i) => (
        <Cartao key={c.rotulo} className={i === 0 ? "col-span-2" : ""}>
          <p className="text-sm text-suave">{c.rotulo}</p>
          <p className={`font-bold tabular-nums ${i === 0 ? "text-4xl" : "text-2xl"}`}>{c.valor}</p>
          <p className="text-sm text-suave">{c.sub}</p>
        </Cartao>
      ))}
    </div>
  );
}

function classificarImc(imc: number) {
  if (imc < 18.5) return "abaixo do peso";
  if (imc < 25) return "peso normal";
  if (imc < 30) return "sobrepeso";
  return "obesidade";
}

type FormProps = {
  editando: Pesagem | null;
  pesoRef: React.RefObject<HTMLInputElement | null>;
  onSalvo: () => void;
  onCancelar: () => void;
};

function Formulario({ editando, pesoRef, onSalvo, onCancelar }: FormProps) {
  const [peso, setPeso] = useState(editando ? String(editando.peso_kg) : "");
  const [data, setData] = useState(editando?.data ?? hojeISO());
  const [obs, setObs] = useState(editando?.observacao ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const valor = Math.round(Number(peso.replace(",", ".")) * 10) / 10;
    if (!valor || valor <= 0 || valor > 400) return setErro("Peso inválido.");
    setSalvando(true);
    setErro(null);
    const registro = { peso_kg: valor, data, observacao: obs.trim() || null };
    const tabela = createClient().from("pesagens");
    const { error } = editando
      ? await tabela.update(registro).eq("id", editando.id)
      : await tabela.insert(registro);
    setSalvando(false);
    if (error) return setErro(error.message);
    setPeso("");
    setObs("");
    setData(hojeISO());
    onSalvo();
  }

  return (
    <Cartao>
      <h2 className="mb-3 text-xl font-bold">{editando ? "Editar pesagem" : "Registrar peso"}</h2>
      <form onSubmit={salvar} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-suave">Peso (kg)</span>
            <input
              ref={pesoRef}
              inputMode="decimal"
              placeholder="90,5"
              required
              value={peso}
              onChange={(e) => setPeso(e.target.value.replace(/[^0-9.,]/g, ""))}
              className={campo}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-suave">Data</span>
            <input
              type="date"
              required
              value={data}
              max={hojeISO()}
              onChange={(e) => setData(e.target.value)}
              className={campo}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-suave">Observação (opcional)</span>
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex.: em jejum, depois do banheiro"
            className={campo}
          />
        </label>
        <button type="submit" disabled={salvando} className={botaoPrimario}>
          {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Salvar pesagem"}
        </button>
        {editando && (
          <button type="button" onClick={onCancelar} className="w-full py-2 text-suave underline">
            Cancelar edição
          </button>
        )}
        {erro && <p className="text-red-400">{erro}</p>}
      </form>
    </Cartao>
  );
}
