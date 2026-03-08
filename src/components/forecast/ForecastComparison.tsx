import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SKU, SKUForecastMetrics, forecastData } from "@/data/mockData";
import { AgentInsightsContent } from "./AgentInsightsPanel";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface Props {
  skus: SKU[];
  metricsMap: Map<string, SKUForecastMetrics>;
  onClose: () => void;
}

function MiniChart({ skuId }: { skuId: string }) {
  const chartData = useMemo(() => {
    const records = forecastData.filter(f => f.skuId === skuId).slice(-12);
    return records.map(r => ({
      month: r.month.replace("'", " "),
      baseline: r.baselineForecast,
      adjusted: r.adjustedForecast,
      actual: r.actualDemand,
    }));
  }, [skuId]);

  return (
    <div className="h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
          <XAxis dataKey="month" tick={{ fontSize: 7 }} stroke="hsl(215, 16%, 47%)" interval={2} />
          <YAxis tick={{ fontSize: 7 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={30} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={(v: number) => v?.toLocaleString() || "—"} />
          <Line type="monotone" dataKey="baseline" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Baseline" />
          <Line type="monotone" dataKey="adjusted" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Adjusted" />
          <Line type="monotone" dataKey="actual" stroke="hsl(var(--secondary))" strokeWidth={1} dot={{ r: 1 }} connectNulls={false} name="Actual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClass = color === "accent" ? "text-accent" : color === "warning" ? "text-warning" : color === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <span className="text-[10px]">
      <span className="text-muted-foreground">{label}: </span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </span>
  );
}

export function ForecastComparison({ skus, metricsMap, onClose }: Props) {
  const [skuA, setSkuA] = useState(skus[0]?.id || "");
  const [skuB, setSkuB] = useState(skus[1]?.id || skus[0]?.id || "");

  const metricsA = metricsMap.get(skuA);
  const metricsB = metricsMap.get(skuB);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">SKU Comparison Mode</h3>
          <Badge variant="outline" className="text-[10px]">Side-by-Side</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* SKU Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">SKU A</label>
          <Select value={skuA} onValueChange={setSkuA}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {skus.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">SKU B</label>
          <Select value={skuB} onValueChange={setSkuB}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {skus.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Comparison Row */}
      {metricsA && metricsB && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50 flex flex-wrap gap-3">
            <Chip label="Acc" value={`${metricsA.accuracy}%`} color={metricsA.accuracy >= 85 ? "accent" : metricsA.accuracy >= 75 ? "warning" : "destructive"} />
            <Chip label="Bias" value={`${metricsA.bias > 0 ? "+" : ""}${metricsA.bias}%`} color={Math.abs(metricsA.bias) > 5 ? "warning" : "accent"} />
            <Chip label="CoC" value={`${metricsA.cocChange > 0 ? "+" : ""}${metricsA.cocChange}%`} color={metricsA.cocChange >= 0 ? "accent" : "destructive"} />
            <Chip label="Vol" value={`${metricsA.volatility}%`} color={metricsA.volatility > 15 ? "warning" : "accent"} />
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50 flex flex-wrap gap-3">
            <Chip label="Acc" value={`${metricsB.accuracy}%`} color={metricsB.accuracy >= 85 ? "accent" : metricsB.accuracy >= 75 ? "warning" : "destructive"} />
            <Chip label="Bias" value={`${metricsB.bias > 0 ? "+" : ""}${metricsB.bias}%`} color={Math.abs(metricsB.bias) > 5 ? "warning" : "accent"} />
            <Chip label="CoC" value={`${metricsB.cocChange > 0 ? "+" : ""}${metricsB.cocChange}%`} color={metricsB.cocChange >= 0 ? "accent" : "destructive"} />
            <Chip label="Vol" value={`${metricsB.volatility}%`} color={metricsB.volatility > 15 ? "warning" : "accent"} />
          </div>
        </div>
      )}

      {/* Charts Side by Side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-border/50 rounded-lg p-2">
          <MiniChart skuId={skuA} />
        </div>
        <div className="border border-border/50 rounded-lg p-2">
          <MiniChart skuId={skuB} />
        </div>
      </div>

      {/* Agent Insights Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        <ScrollArea className="h-[500px] border border-border/50 rounded-lg p-4">
          {skuA && <AgentInsightsContent skuId={skuA} />}
        </ScrollArea>
        <ScrollArea className="h-[500px] border border-border/50 rounded-lg p-4">
          {skuB && <AgentInsightsContent skuId={skuB} />}
        </ScrollArea>
      </div>
    </motion.div>
  );
}
