import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { SKU, SKUForecastMetrics, forecastData } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AgentInsightsPanel } from "./AgentInsightsPanel";

interface Props {
  skus: SKU[];
  metricsMap: Map<string, SKUForecastMetrics>;
}

export function SKUForecastAccordion({ skus, metricsMap }: Props) {
  const [agentSKU, setAgentSKU] = useState<string | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);

  const openAgent = (skuId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgentSKU(skuId);
    setAgentOpen(true);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="kpi-card !p-3">
        <h3 className="text-sm font-semibold mb-3">SKU Forecast Explorer ({skus.length})</h3>
        <Accordion type="single" collapsible className="space-y-1">
          {skus.map((sku, i) => {
            const m = metricsMap.get(sku.id);
            if (!m) return null;
            return (
              <AccordionItem key={sku.id} value={sku.id} className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 w-full mr-3">
                    <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">{sku.id}</span>
                    <span className="text-xs font-medium truncate flex-1 text-left">{sku.name}</span>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${m.accuracy >= 85 ? "border-accent/50 text-accent" : m.accuracy >= 75 ? "border-warning/50 text-warning" : "border-destructive/50 text-destructive"}`}>
                      {m.accuracy}% acc
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${m.cocChange >= 0 ? "text-accent" : "text-destructive"}`}>
                      {m.cocChange > 0 ? "+" : ""}{m.cocChange}% CoC
                    </Badge>
                    {m.flags.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {m.flags.length} flag{m.flags.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <button
                      onClick={(e) => openAgent(sku.id, e)}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
                      title="Forecast Review Agent"
                    >
                      <Brain className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SKUExpandedContent sku={sku} metrics={m} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </motion.div>

      <AgentInsightsPanel skuId={agentSKU} open={agentOpen} onOpenChange={setAgentOpen} />
    </>
  );
}

function SKUExpandedContent({ sku, metrics }: { sku: SKU; metrics: SKUForecastMetrics }) {
  const chartData = useMemo(() => {
    const records = forecastData.filter(f => f.skuId === sku.id).slice(-12);
    return records.map(r => ({
      month: r.month.replace("'", " "),
      baseline: r.baselineForecast,
      adjusted: r.adjustedForecast,
      actual: r.actualDemand,
    }));
  }, [sku.id]);

  return (
    <div className="pb-3 space-y-4">
      {/* KPI Chips */}
      <div className="flex flex-wrap gap-2">
        <Chip label="Accuracy" value={`${metrics.accuracy}%`} color={metrics.accuracy >= 85 ? "accent" : metrics.accuracy >= 75 ? "warning" : "destructive"} />
        <Chip label="Bias" value={`${metrics.bias > 0 ? "+" : ""}${metrics.bias}%`} color={Math.abs(metrics.bias) > 5 ? "warning" : "accent"} />
        <Chip label="Volatility" value={`${metrics.volatility}%`} color={metrics.volatility > 15 ? "warning" : "accent"} />
        <Chip label="Run Rate" value={`${(metrics.runRate / 1000).toFixed(0)}K/mo`} />
        <Chip label="Run Rate Δ" value={`${metrics.runRateChange > 0 ? "+" : ""}${metrics.runRateChange}%`} color={Math.abs(metrics.runRateChange) > 10 ? "warning" : "accent"} />
        <Chip label="vs LY" value={`${metrics.lyChange > 0 ? "+" : ""}${metrics.lyChange}%`} color={metrics.lyChange >= 0 ? "accent" : "destructive"} />
      </div>

      {/* Mini Chart */}
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" interval={2} />
            <YAxis tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={35} />
            <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={(v: number) => v?.toLocaleString() || "—"} />
            <Line type="monotone" dataKey="baseline" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Baseline" />
            <Line type="monotone" dataKey="adjusted" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Adjusted" />
            <Line type="monotone" dataKey="actual" stroke="hsl(var(--secondary))" strokeWidth={1} dot={{ r: 1.5 }} connectNulls={false} name="Actual" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Narrative */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-[11px] leading-relaxed text-muted-foreground">
        Run-rate stable at {(metrics.runRate / 1000).toFixed(0)}K cases/month ({metrics.runRateChange > 0 ? "+" : ""}{metrics.runRateChange}% vs prior period).
        Forecast accuracy at {metrics.accuracy}% with {Math.abs(metrics.bias) > 5 ? `a ${metrics.bias > 0 ? "positive" : "negative"} bias of ${Math.abs(metrics.bias)}%` : "minimal bias"}.
        {metrics.flags.length > 0 ? ` Flags: ${metrics.flags.map(f => f.replace(/_/g, " ")).join(", ")}.` : " No active flags."}
      </div>
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClass = color === "accent" ? "text-accent" : color === "warning" ? "text-warning" : color === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-muted/50 rounded-md px-2.5 py-1 text-[10px]">
      <span className="text-muted-foreground">{label}: </span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}
