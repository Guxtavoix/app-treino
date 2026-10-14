import type { Equipamento } from "./exercicios";

// Dados pessoais usados nos cálculos (IMC, meta, perda total).
export const PERFIL = {
  alturaM: 1.79,
  pesoInicialKg: 91,
  metaKg: 80,
  // Quando comprar, adicione aqui: ["barra"], ["bike"] ou ["barra", "bike"].
  // A barra substitui a remada com mochila e a bike substitui a caminhada automaticamente.
  equipamentos: [] as Equipamento[],
};
