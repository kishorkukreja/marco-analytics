import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Activity, Target, BarChart3, Gauge } from "lucide-react";
import { SKU, SKUForecastMetrics, forecastData } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
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
          {skus.map((sku) => {
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
                  <SKUFieldsetView sku={sku} metrics={m} />
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

function SKUFieldsetView({ sku, metrics }: { sku: SKU; metrics: SKUForecastMetrics }) {
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
    <div className="pb-4 space-y-4">
      {/* Fieldset: Forecast Performance */}
      <fieldset className="border border-border/60 rounded-lg p-4">
        <legend className="flex items-center gap-1.5 px-2 text-xs font-semibold text-primary">
          <Gauge className="h-3.5 w-3.5" />
          Forecast Performance
        </legend>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <MetricCell label="Accuracy" value={`${metrics.accuracy}%`} color={metrics.accuracy >= 85 ? "accent" : metrics.accuracy >= 75 ? "warning" : "destructive"} />
          <MetricCell label="Bias" value={`${metrics.bias > 0 ? "+" : ""}${metrics.bias}%`} color={Math.abs(metrics.bias) > 5 ? "warning" : "accent"} />
          <MetricCell label="Volatility" value={`${metrics.volatility}%`} color={metrics.volatility > 15 ? "warning" : "accent"} />
          <MetricCell label="Confidence" value={`${Math.round(metrics.accuracy * 0.9)}%`} color={metrics.accuracy > 80 ? "accent" : "warning"} />
          <MetricCell label="CoC Change" value={`${metrics.cocChange > 0 ? "+" : ""}${metrics.cocChange}%`} color={metrics.cocChange >= 0 ? "accent" : "destructive"} />
          <MetricCell label="vs LY" value={`${metrics.lyChange > 0 ? "+" : ""}${metrics.lyChange}%`} color={metrics.lyChange >= 0 ? "accent" : "destructive"} />
        </div>
      </fieldset>

      {/* Fieldset: Demand Trend */}
      <fieldset className="border border-border/60 rounded-lg p-4">
        <legend className="flex items-center gap-1.5 px-2 text-xs font-semibold text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          12-Month Demand Trend
        </legend>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" interval={2} />
              <YAxis tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={35} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} formatter={(v: number) => v?.toLocaleString() || "—"} />
              <Line type="monotone" dataKey="baseline" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Baseline" />
              <Line type="monotone" dataKey="adjusted" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Adjusted" />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--secondary))" strokeWidth={1} dot={{ r: 1.5 }} connectNulls={false} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Baseline</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block" /> Adjusted</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary inline-block" /> Actual</span>
        </div>
      </fieldset>

      {/* Fieldset: Run Rate & Signals */}
      <fieldset className="border border-border/60 rounded-lg p-4">
        <legend className="flex items-center gap-1.5 px-2 text-xs font-semibold text-primary">
          <Activity className="h-3.5 w-3.5" />
          Run Rate & Signals
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <MetricCell label="Run Rate" value={`${(metrics.runRate / 1000).toFixed(0)}K/mo`} />
          <MetricCell label="Run Rate Δ" value={`${metrics.runRateChange > 0 ? "+" : ""}${metrics.runRateChange}%`} color={Math.abs(metrics.runRateChange) > 10 ? "warning" : "accent"} />
          <MetricCell label="Annual Volume" value={`${(sku.annualVolume / 1e6).toFixed(1)}M`} />
          <MetricCell label="Margin" value={`${sku.currentMargin}%`} color={sku.currentMargin > 35 ? "accent" : sku.currentMargin > 25 ? "warning" : "destructive"} />
        </div>
        {metrics.flags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground font-medium">Flags:</span>
            {metrics.flags.map(f => (
              <Badge key={f} variant="secondary" className="text-[10px]">{f.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        )}
      </fieldset>

      {/* Fieldset: Quick Assessment */}
      <fieldset className="border border-border/60 rounded-lg p-4">
        <legend className="flex items-center gap-1.5 px-2 text-xs font-semibold text-primary">
          <BarChart3 className="h-3.5 w-3.5" />
          Quick Assessment
        </legend>
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          Run-rate stable at {(metrics.runRate / 1000).toFixed(0)}K cases/month ({metrics.runRateChange > 0 ? "+" : ""}{metrics.runRateChange}% vs prior period).
          Forecast accuracy at {metrics.accuracy}% with {Math.abs(metrics.bias) > 5 ? `a ${metrics.bias > 0 ? "positive" : "negative"} bias of ${Math.abs(metrics.bias)}%` : "minimal bias"}.
          {metrics.flags.length > 0 ? ` Active flags: ${metrics.flags.map(f => f.replace(/_/g, " ")).join(", ")}.` : " No active flags."}
          {" "}{metrics.accuracy > 85 ? "Overall forecast health is strong — no immediate intervention needed." : metrics.accuracy > 75 ? "Forecast shows moderate performance — monitor for further degradation." : "Forecast performance below threshold — recommend detailed review via Agent Insights."}
        </div>
      </fieldset>
    </div>
  );
}

function MetricCell({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClass = color === "accent" ? "text-accent" : color === "warning" ? "text-warning" : color === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}