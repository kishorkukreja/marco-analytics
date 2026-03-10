import { motion } from "framer-motion";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DisaggregationForecast } from "@/data/mockData";

interface Props {
  forecasts: DisaggregationForecast[];
}

export function MarginImpactChart({ forecasts }: Props) {
  const months = forecasts[0]?.monthlyForecasts.map(m => m.month) || [];

  const chartData = months.map((month, i) => {
    const totalVol = forecasts.reduce((s, f) => s + f.monthlyForecasts[i].baselineVolume, 0);
    const avgBaseMargin = forecasts.reduce((s, f) => s + f.monthlyForecasts[i].baselineMargin, 0) / forecasts.length;
    const avgAgentMargin = forecasts.reduce((s, f) => s + f.monthlyForecasts[i].agentMargin, 0) / forecasts.length;

    return {
      month,
      volume: totalVol,
      baselineMargin: +avgBaseMargin.toFixed(1),
      agentMargin: +avgAgentMargin.toFixed(1),
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="kpi-card"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Forecast Impact on Margin</h3>
        <p className="text-xs text-muted-foreground">Volume forecast vs projected gross margin % — baseline & agent scenarios</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={v => `${v}%`}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              formatter={(v: number, name: string) => {
                if (name === "volume") return [`${(v / 1000).toFixed(0)}K units`, "Forecast Volume"];
                return [`${v}%`, name === "baselineMargin" ? "Baseline Margin" : "Agent Margin"];
              }}
            />
            <Legend formatter={(v: string) => <span className="text-[10px]">{v === "volume" ? "Volume" : v === "baselineMargin" ? "Baseline Margin %" : "Agent Margin %"}</span>} />
            <Bar yAxisId="left" dataKey="volume" fill="hsl(var(--primary))" opacity={0.2} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="baselineMargin" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="agentMargin" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
