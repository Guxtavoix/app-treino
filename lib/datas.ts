// Datas sempre no fuso do celular, no formato "YYYY-MM-DD" (igual à coluna `date` do banco).

export function paraISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function deISO(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function diasEntre(deIso: string, ateIso: string): number {
  return Math.round((deISO(ateIso).getTime() - deISO(deIso).getTime()) / 86_400_000);
}

export function somarDias(iso: string, dias: number): string {
  const d = deISO(iso);
  d.setDate(d.getDate() + dias);
  return paraISO(d);
}

/** Segunda-feira da semana da data. */
export function inicioDaSemana(iso: string): string {
  const d = deISO(iso);
  const desloc = (d.getDay() + 6) % 7;
  return somarDias(iso, -desloc);
}

export function formatarData(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return deISO(iso).toLocaleDateString("pt-BR", opts ?? { day: "2-digit", month: "2-digit" });
}

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
