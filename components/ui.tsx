"use client";

import { useSyncExternalStore, type ReactNode } from "react";

/** false no servidor e na hidratação; true depois. Evita usar a data/hora do servidor. */
export function useMontado() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-borda bg-cartao p-4 ${className}`}>{children}</div>
  );
}

export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-5">
      <h1 className="text-3xl font-bold">{children}</h1>
      {sub && <p className="mt-1 text-suave">{sub}</p>}
    </header>
  );
}

export function Carregando() {
  return (
    <div className="space-y-3" aria-busy>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-cartao" />
      ))}
    </div>
  );
}

export const botaoPrimario =
  "flex h-14 w-full items-center justify-center rounded-2xl bg-destaque px-5 text-lg font-semibold text-black active:scale-[0.98] disabled:opacity-50";

export const botaoSecundario =
  "flex h-14 w-full items-center justify-center rounded-2xl border border-borda bg-cartao px-5 text-lg font-semibold active:scale-[0.98] disabled:opacity-50";

export const campo =
  "h-14 w-full rounded-2xl border border-borda bg-fundo px-4 text-lg outline-none focus:border-destaque";
