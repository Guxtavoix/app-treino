"use client";

import { useState } from "react";
import type { Exercicio } from "@/lib/exercicios";
import { Cartao } from "./ui";

type Props = {
  exercicio: Exercicio;
  totalSeries: number;
  feitas: number;
  onMudar: (feitas: number) => void;
};

export function CartaoExercicio({ exercicio, totalSeries, feitas, onMudar }: Props) {
  const [aberto, setAberto] = useState(false);
  const completo = feitas >= totalSeries;

  return (
    <Cartao className={completo ? "border-destaque/60" : ""}>
      <button onClick={() => setAberto((v) => !v)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold">{exercicio.nome}</h3>
          <span className="text-suave" aria-hidden>
            {aberto ? "▲" : "▼"}
          </span>
        </div>
        <p className="text-suave">
          {totalSeries > 1 ? `${totalSeries} x ` : ""}
          {exercicio.reps}
        </p>
      </button>

      {aberto && (
        <div className="mt-3 space-y-1 text-base">
          <p>
            <span className="text-destaque">Dica:</span> {exercicio.dica}
          </p>
          {exercicio.versaoFacil && (
            <p>
              <span className="text-alerta">Mais fácil:</span> {exercicio.versaoFacil}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {Array.from({ length: totalSeries }, (_, i) => {
          const marcada = i < feitas;
          return (
            <button
              key={i}
              onClick={() => onMudar(marcada ? i : i + 1)}
              aria-label={`Série ${i + 1}${marcada ? " feita" : ""}`}
              aria-pressed={marcada}
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-bold transition ${
                marcada
                  ? "border-destaque bg-destaque text-black"
                  : "border-borda text-suave active:border-destaque"
              }`}
            >
              {marcada ? "✓" : i + 1}
            </button>
          );
        })}
      </div>
    </Cartao>
  );
}
