import { motion } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import type { DisaggregationForecast } from "@/data/mockData";

interface Props {
  forecasts: DisaggregationForecast[];
  onSKUClick?: (skuId: string) => void;
}

const RISK_COLORS = {
  low: "hsl(var(--accent))",
  medium: "hsl(var(--warning))",
  high: "hsl(var(--destructive))",
};

export function ForecastBubbleChart({ forecasts, onSKUClick }: Props) {
  const data = forecasts.map(fc => ({
    x: fc.volumeGrowth,
    y: fc.marginContribution,
    z: fc.currentRevenue / 1000000,
    name: fc.skuName,
    skuId: fc.skuId,
    risk: fc.riskLevel,
    confidence: fc.forecastConfidence,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{d.name}</p>
        <p className="text-muted-foreground">Growth: {d.x > 0 ? "+" : ""}{d.x}%</p>
        <p className="text-muted-foreground">Margin: ${d.y}M</p>
        <p className="text-muted-foreground">Revenue: ${d.z.toFixed(1)}M</p>
        <p className="text-muted-foreground">Confidence: {d.confidence}%</p>
        <p className={`font-medium mt-1 ${d.risk === "low" ? "text-accent" : d.risk === "medium" ? "text-warning" : "text-destructive"}`}>
          Risk: {d.risk}
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="kpi-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Forecast Risk & Opportunity</h3>
          <p className="text-xs text-muted-foreground">Growth × Margin × Revenue — click to drill down</p>
        </div>
        <div className="flex items-center gap-3">
          {(["low", "medium", "high"] as const).map(level => (
            <div key={level} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[level] }} />
              <span className="text-[10px] text-muted-foreground capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="x"
              type="number"
              name="Volume Growth"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Volume Growth %", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Margin Impact"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Margin $M", angle: -90, position: "left", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <ZAxis dataKey="z" range={[200, 2000]} name="Revenue" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} cursor="pointer" onClick={(d: any) => onSKUClick?.(d.skuId)}>
              {data.map((entry, i) => (
                <Cell key={i} fill={RISK_COLORS[entry.risk]} fillOpacity={0.7} stroke={RISK_COLORS[entry.risk]} strokeWidth={1} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
