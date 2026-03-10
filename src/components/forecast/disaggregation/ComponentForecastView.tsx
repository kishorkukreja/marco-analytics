import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ComponentDemand } from "@/data/mockData";

interface Props {
  componentDemand: ComponentDemand[];
}

const TYPE_COLORS: Record<string, string> = {
  Surfactant: "hsl(var(--chart-1))",
  Builder: "hsl(var(--chart-2))",
  "Chelating Agent": "hsl(var(--chart-3))",
  "Bleach Activator": "hsl(var(--chart-4))",
  Humectant: "hsl(var(--chart-5))",
  "pH Adjuster": "hsl(213, 40%, 50%)",
};

export function ComponentForecastView({ componentDemand }: Props) {
  const top8 = componentDemand.slice(0, 8);
  const months = top8[0]?.monthlyDemand.map(m => m.month) || [];

  const trendData = months.map((month, i) => {
    const point: Record<string, any> = { month };
    top8.forEach(cd => {
      point[cd.materialId] = cd.monthlyDemand[i]?.demandKg || 0;
    });
    return point;
  });

  // Heatmap data
  const maxDemand = Math.max(...componentDemand.flatMap(cd => cd.monthlyDemand.map(m => m.demandKg)));

  return (
    <div className="space-y-5">
      {/* Component Demand Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="kpi-card"
      >
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Component Demand Forecast</h3>
          <p className="text-xs text-muted-foreground">Upstream material demand derived from SKU forecasts × BOM</p>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                formatter={(v: number, name: string) => {
                  const mat = top8.find(m => m.materialId === name);
                  return [`${(v / 1000).toFixed(1)}K kg`, mat?.materialName.split("(")[0].trim() || name];
                }}
              />
              <Legend formatter={(value: string) => {
                const mat = top8.find(m => m.materialId === value);
                return <span className="text-[10px]">{mat?.materialName.split("(")[0].trim() || value}</span>;
              }} />
              {top8.map(cd => (
                <Line
                  key={cd.materialId}
                  type="monotone"
                  dataKey={cd.materialId}
                  stroke={TYPE_COLORS[cd.materialType] || "hsl(var(--muted-foreground))"}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Material Demand Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="kpi-card"
      >
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Material Demand Heatmap</h3>
          <p className="text-xs text-muted-foreground">Color intensity represents forecast demand volume by month</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid gap-px" style={{ gridTemplateColumns: `200px repeat(${months.length}, 1fr)` }}>
              <div className="text-[10px] font-semibold text-muted-foreground p-2">Material</div>
              {months.map(m => (
                <div key={m} className="text-[10px] font-medium text-muted-foreground p-2 text-center">{m}</div>
              ))}
            </div>
            {/* Rows */}
            {componentDemand.map(cd => (
              <div key={cd.materialId} className="grid gap-px border-t border-border/50" style={{ gridTemplateColumns: `200px repeat(${months.length}, 1fr)` }}>
                <div className="text-[10px] text-foreground p-2 truncate" title={cd.materialName}>
                  {cd.materialName.split("(")[0].trim()}
                </div>
                {cd.monthlyDemand.map((md, i) => {
                  const intensity = Math.min(1, md.demandKg / maxDemand);
                  return (
                    <div
                      key={i}
                      className="p-2 text-center text-[9px] font-mono rounded-sm"
                      style={{
                        backgroundColor: `hsl(213, 62%, ${95 - intensity * 65}%)`,
                        color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                      }}
                      title={`${cd.materialName}: ${md.demandKg.toLocaleString()} kg`}
                    >
                      {(md.demandKg / 1000).toFixed(0)}K
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[9px] text-muted-foreground">Low</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
              <div key={v} className="w-5 h-3 rounded-sm" style={{ backgroundColor: `hsl(213, 62%, ${95 - v * 65}%)` }} />
            ))}
          </div>
          <span className="text-[9px] text-muted-foreground">High</span>
        </div>
      </motion.div>
    </div>
  );
}
