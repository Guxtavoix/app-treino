"use client";

import { useEffect, useState } from "react";

type Props = { terminaEm: number; onFim: () => void; onAjustar: (novoFim: number) => void };

/** Barra flutuante com a contagem regressiva. Usa o horário de término para não atrasar em segundo plano. */
export function TimerDescanso({ terminaEm, onFim, onAjustar }: Props) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setAgora(t);
      if (t >= terminaEm) {
        navigator.vibrate?.([400, 150, 400]);
        onFim();
      }
    }, 250);
    return () => clearInterval(id);
  }, [terminaEm, onFim]);

  const restante = Math.max(0, Math.ceil((terminaEm - agora) / 1000));
  const min = Math.floor(restante / 60);
  const seg = String(restante % 60).padStart(2, "0");

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-4 pb-3">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-destaque bg-cartao p-3 shadow-lg shadow-black/50">
        <div className="flex-1">
          <p className="text-sm text-suave">Descanso</p>
          <p className="text-4xl font-bold tabular-nums">
            {min}:{seg}
          </p>
        </div>
        <button
          onClick={() => onAjustar(terminaEm + 15_000)}
          className="h-14 rounded-xl border border-borda px-4 text-lg font-semibold"
        >
          +15s
        </button>
        <button
          onClick={onFim}
          className="h-14 rounded-xl bg-destaque px-4 text-lg font-semibold text-black"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
