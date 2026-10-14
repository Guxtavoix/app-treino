"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/", rotulo: "Hoje", icone: "🏠" },
  { href: "/exercicios", rotulo: "Exercícios", icone: "💪" },
  { href: "/peso", rotulo: "Peso", icone: "⚖️" },
  { href: "/historico", rotulo: "Histórico", icone: "📅" },
];

export function NavInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-fundo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {ABAS.map((aba) => {
          const ativa = aba.href === "/" ? pathname === "/" : pathname.startsWith(aba.href);
          return (
            <li key={aba.href}>
              <Link
                href={aba.href}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-sm ${
                  ativa ? "text-destaque" : "text-suave"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {aba.icone}
                </span>
                {aba.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
