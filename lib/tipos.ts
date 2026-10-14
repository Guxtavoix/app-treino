import type { TipoTreino } from "./exercicios";

export type Pesagem = {
  id: string;
  data: string;
  peso_kg: number;
  observacao: string | null;
};

export type SerieFeita = { id: string; nome: string; feitas: number; total: number };

export type TreinoRealizado = {
  id: string;
  data: string;
  tipo: TipoTreino;
  series_feitas: { exercicios: SerieFeita[] } | null;
  notas: string | null;
};
