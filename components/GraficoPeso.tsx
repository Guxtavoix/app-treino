"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { deISO, formatarData } from "@/lib/datas";
import type { Pesagem } from "@/lib/tipos";

type Ponto = { data: string; t: number; peso: number; media: number };

/** Média móvel de 7 dias: média das pesagens dos últimos 7 dias (por data) até cada ponto. */
function comMediaMovel(pesagens: Pesagem[]): Ponto[] {
  return pesagens.map((p) => {
    const t = deISO(p.data).getTime();
    const janela = pesagens.filter((q) => {
      const tq = deISO(q.data).getTime();
      return tq <= t && tq > t - 7 * 86_400_000;
    });
    const media = janela.reduce((s, q) => s + q.peso_kg, 0) / janela.length;
    return { data: p.data, t, peso: p.peso_kg, media: Math.round(media * 10) / 10 };
  });
}

const COR_PESO = "#94a3b8";
const COR_MEDIA = "#22c55e";
const COR_META = "#f59e0b";

export function GraficoPeso({ pesagens, meta }: { pesagens: Pesagem[]; meta: number }) {
  const pontos = comMediaMovel(pesagens);
  const valores = pontos.flatMap((p) => [p.peso, p.media]).concat(meta);
  const min = Math.floor(Math.min(...valores) - 1);
  const max = Math.ceil(Math.max(...valores) + 1);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pontos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#263040" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(t: number) =>
              new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
            }
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#263040" }}
          />
          <YAxis
            domain={[min, max]}
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: "#151b23", border: "1px solid #263040", borderRadius: 12 }}
            labelStyle={{ color: "#e8edf3" }}
            itemStyle={{ color: "#e8edf3" }}
            cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
            labelFormatter={(_, payload) => {
              const data = payload?.[0]?.payload?.data as string | undefined;
              return data ? formatarData(data, { day: "2-digit", month: "short", year: "numeric" }) : "";
            }}
            formatter={(v) => `${Number(v).toFixed(1)} kg`}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: "#94a3b8" }} />
          <ReferenceLine
            y={meta}
            stroke={COR_META}
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{ value: `Meta ${meta} kg`, fill: "#e8edf3", fontSize: 12, position: "insideBottomRight" }}
          />
          <Line
            name="Peso"
            dataKey="peso"
            stroke={COR_PESO}
            strokeWidth={2}
            dot={{ r: 4, fill: COR_PESO, stroke: "#151b23", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
          <Line
            name="Média 7 dias"
            dataKey="media"
            stroke={COR_MEDIA}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
