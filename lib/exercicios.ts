export type TipoTreino = "forca" | "cardio" | "caminhada";
export type Equipamento = "barra" | "bike";

export type Exercicio = {
  id: string;
  nome: string;
  series: number;
  reps: string;
  dica: string;
  versaoFacil?: string;
  descansoSeg: number;
  // Só aparece se o equipamento estiver em PERFIL.equipamentos.
  requer?: Equipamento;
  // Quando este exercício está disponível, ele toma o lugar do exercício com este id.
  substitui?: string;
};

export const AQUECIMENTO = {
  duracao: "5 min",
  itens: ["Polichinelo", "Girar os braços", "10 agachamentos leves"],
};

export const FORCA: Exercicio[] = [
  {
    id: "agachamento",
    nome: "Agachamento",
    series: 3,
    reps: "12–15",
    versaoFacil: "Agachar até uma cadeira e levantar",
    dica: "Joelho segue a direção do pé",
    descansoSeg: 90,
  },
  {
    id: "flexao",
    nome: "Flexão",
    series: 3,
    reps: "máximo bem feito",
    versaoFacil: "Joelho apoiado ou mãos no sofá/mesa",
    dica: "Corpo reto, quadril não cai",
    descansoSeg: 90,
  },
  {
    id: "afundo",
    nome: "Afundo (passada)",
    series: 3,
    reps: "10 cada perna",
    versaoFacil: "Segurar numa parede",
    dica: "Joelho de trás quase encosta no chão",
    descansoSeg: 90,
  },
  {
    id: "remada-mochila",
    nome: "Remada com mochila",
    series: 3,
    reps: "12",
    versaoFacil: "Menos peso na mochila",
    dica: "Corpo inclinado, puxa até a barriga",
    descansoSeg: 90,
  },
  {
    id: "barra",
    nome: "Barra fixa",
    series: 3,
    reps: "máximo bem feito",
    versaoFacil: "Barra australiana (corpo inclinado) ou só a descida lenta",
    dica: "Ombros para baixo, sobe até o queixo passar da barra",
    descansoSeg: 90,
    requer: "barra",
    substitui: "remada-mochila",
  },
  {
    id: "ponte",
    nome: "Ponte de glúteo",
    series: 3,
    reps: "15",
    dica: "Segura 1s em cima",
    descansoSeg: 90,
  },
  {
    id: "prancha",
    nome: "Prancha",
    series: 3,
    reps: "20–40s",
    versaoFacil: "Prancha com joelho apoiado",
    dica: "Abdômen contraído, sem levantar o quadril",
    descansoSeg: 90,
  },
  {
    id: "abdominal",
    nome: "Abdominal",
    series: 3,
    reps: "15",
    dica: "Abdominal curto, sem puxar o pescoço",
    descansoSeg: 90,
  },
];

// Cardio: escolher UMA opção no dia.
export const CARDIO: Exercicio[] = [
  {
    id: "caminhada-firme",
    nome: "Caminhada em ritmo firme",
    series: 1,
    reps: "30–40 min",
    dica: "Ritmo em que dá para falar, mas não cantar",
    descansoSeg: 0,
  },
  {
    id: "bike",
    nome: "Bike ergométrica",
    series: 1,
    reps: "30–40 min",
    dica: "Carga moderada, cadência constante",
    descansoSeg: 0,
    requer: "bike",
    substitui: "caminhada-firme",
  },
  {
    id: "circuito",
    nome: "Circuito",
    series: 8,
    reps: "rodadas de 2 min (15–20 min no total)",
    dica: "30s polichinelo, 30s agachamento, 30s marcha no lugar (joelho alto), 30s descanso — repetir",
    descansoSeg: 0,
  },
];

export const CAMINHADA_LEVE: Exercicio[] = [
  {
    id: "caminhada-leve",
    nome: "Caminhada leve",
    series: 1,
    reps: "20–40 min",
    dica: "Opcional. Ritmo tranquilo, só para se mexer",
    descansoSeg: 0,
  },
];

export const REGRAS_EVOLUCAO = [
  "Semana 1: fazer 2 séries em vez de 3",
  "Quando todas as séries ficarem fáceis, aumentar 2–3 repetições (ou +10s na prancha)",
];

export const NOMES_TIPO: Record<TipoTreino, string> = {
  forca: "Treino de Força",
  cardio: "Cardio",
  caminhada: "Caminhada leve",
};

/** Filtra pelos equipamentos disponíveis e aplica as substituições. */
export function disponiveis(lista: Exercicio[], equipamentos: Equipamento[]): Exercicio[] {
  const ativos = lista.filter((e) => !e.requer || equipamentos.includes(e.requer));
  const substituidos = new Set(ativos.map((e) => e.substitui).filter(Boolean));
  return ativos.filter((e) => !substituidos.has(e.id));
}

export function exerciciosDoTipo(tipo: TipoTreino, equipamentos: Equipamento[]): Exercicio[] {
  const lista = tipo === "forca" ? FORCA : tipo === "cardio" ? CARDIO : CAMINHADA_LEVE;
  return disponiveis(lista, equipamentos);
}

export type PlanoDia = { tipo: TipoTreino | null; titulo: string; opcional?: boolean };

/** 0 = domingo ... 6 = sábado (igual a Date.getDay()). */
export function planoDoDia(diaSemana: number): PlanoDia {
  switch (diaSemana) {
    case 1:
    case 3:
    case 5:
      return { tipo: "forca", titulo: NOMES_TIPO.forca };
    case 2:
    case 4:
      return { tipo: "cardio", titulo: NOMES_TIPO.cardio };
    case 6:
      return { tipo: "caminhada", titulo: "Caminhada leve (opcional)", opcional: true };
    default:
      return { tipo: null, titulo: "Descanso" };
  }
}

// Meta semanal usada no streak do histórico.
export const META_SEMANAL = { forca: 3, cardio: 2 };
