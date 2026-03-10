import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign } from "lucide-react";
import type { DisaggregationForecast } from "@/data/mockData";

interface Props {
  forecasts: DisaggregationForecast[];
  scenario: "baseline" | "agent" | "planner";
  onSKUClick?: (skuId: string) => void;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(213, 50%, 35%)",
  "hsl(160, 50%, 55%)",
  "hsl(38, 70%, 60%)",
  "hsl(280, 50%, 50%)",
  "hsl(0, 50%, 60%)",
];

export function MultiSKUTrendChart({ forecasts, scenario, onSKUClick }: Props) {
  const [metric, setMetric] = useState<"volume" | "revenue">("volume");

  const top10 = [...forecasts].sort((a, b) => b.currentRevenue - a.currentRevenue).slice(0, 10);

  const volKey = scenario === "baseline" ? "baselineVolume" : scenario === "agent" ? "agentVolume" : "plannerVolume";
  const revKey = scenario === "baseline" ? "baselineRevenue" : scenario === "agent" ? "agentRevenue" : "plannerRevenue";
  const dataKey = metric === "volume" ? volKey : revKey;

  const months = top10[0]?.monthlyForecasts.map(m => m.month) || [];
  const chartData = months.map((month, i) => {
    const point: Record<string, any> = { month };
    top10.forEach(fc => {
      point[fc.skuId] = fc.monthlyForecasts[i]?.[dataKey] || 0;
      point[`${fc.skuId}_name`] = fc.skuName;
      point[`${fc.skuId}_confidence`] = fc.monthlyForecasts[i]?.confidence || 0;
      point[`${fc.skuId}_revenue`] = fc.monthlyForecasts[i]?.[revKey] || 0;
      point[`${fc.skuId}_volume`] = fc.monthlyForecasts[i]?.[volKey] || 0;
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs max-h-64 overflow-y-auto">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, i: number) => {
          const skuId = entry.dataKey;
          const row = entry.payload;
          return (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{row[`${skuId}_name`]}</p>
                <div className="flex gap-3 text-muted-foreground">
                  <span>Vol: {(row[`${skuId}_volume`] / 1000).toFixed(0)}K</span>
                  <span>Rev: ${(row[`${skuId}_revenue`] / 1000000).toFixed(2)}M</span>
                  <span>Conf: {row[`${skuId}_confidence`]}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="kpi-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Multi-SKU Forecast Trend</h3>
          <p className="text-xs text-muted-foreground">Top 10 SKUs by revenue — {scenario} scenario</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={metric === "volume" ? "default" : "outline"}
            size="sm"
            className="h-7 text-[10px] gap-1"
            onClick={() => setMetric("volume")}
          >
            <BarChart3 className="h-3 w-3" />
            Volume
          </Button>
          <Button
            variant={metric === "revenue" ? "default" : "outline"}
            size="sm"
            className="h-7 text-[10px] gap-1"
            onClick={() => setMetric("revenue")}
          >
            <DollarSign className="h-3 w-3" />
            Revenue
          </Button>
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={v => metric === "revenue" ? `$${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => {
                const fc = top10.find(f => f.skuId === value);
                return <span className="text-[10px] cursor-pointer" onClick={() => onSKUClick?.(value)}>{fc?.skuName.split(" ").slice(0, 2).join(" ") || value}</span>;
              }}
            />
            {top10.map((fc, i) => (
              <Line
                key={fc.skuId}
                type="monotone"
                dataKey={fc.skuId}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, cursor: "pointer", onClick: () => onSKUClick?.(fc.skuId) }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
