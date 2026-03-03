import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { skuMaster, forecastData } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const ForecastIntelligence = () => {
  const [selectedSKU, setSelectedSKU] = useState(skuMaster[0].id);
  const [showAIExplanation, setShowAIExplanation] = useState(false);

  const skuForecast = useMemo(() => forecastData.filter(f => f.skuId === selectedSKU), [selectedSKU]);

  const anomalies = skuForecast.filter(f => f.anomalyFlag);
  const avgConfidence = +(skuForecast.reduce((s, f) => s + f.confidenceScore, 0) / skuForecast.length).toFixed(1);

  const chartData = skuForecast.map(f => ({
    month: f.month,
    baseline: f.baselineForecast,
    adjusted: f.adjustedForecast,
    actual: f.actualDemand,
  }));

  const confidenceBreakdown = {
    seasonality: +(60 + Math.random() * 30).toFixed(1),
    historicalMatch: +(65 + Math.random() * 25).toFixed(1),
    biasStability: +(70 + Math.random() * 20).toFixed(1),
    volatilityControl: +(55 + Math.random() * 35).toFixed(1),
    demandConsistency: +(60 + Math.random() * 30).toFixed(1),
  };

  const compositeScore = (
    confidenceBreakdown.seasonality * 0.25 +
    confidenceBreakdown.historicalMatch * 0.25 +
    confidenceBreakdown.biasStability * 0.20 +
    confidenceBreakdown.volatilityControl * 0.15 +
    confidenceBreakdown.demandConsistency * 0.15
  ).toFixed(1);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Forecast Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered demand forecasting with multi-layer validation</p>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Select SKU</label>
            <Select value={selectedSKU} onValueChange={setSelectedSKU}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {skuMaster.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-6 ml-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{compositeScore}%</p>
              <p className="text-[10px] text-muted-foreground uppercase">Confidence Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{anomalies.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Anomalies</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forecast Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">24-Month Demand Forecast</h3>
          <div className="flex gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Baseline</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block" /> Adjusted</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary inline-block" /> Actual</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" interval={2} />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => v?.toLocaleString() || "—"} />
            <Line type="monotone" dataKey="baseline" stroke="hsl(213, 62%, 14%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="adjusted" stroke="hsl(160, 64%, 40%)" strokeWidth={2} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="actual" stroke="hsl(215, 16%, 47%)" strokeWidth={1.5} dot={{ r: 2 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Confidence Breakdown & AI Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold">Confidence Score Breakdown</h3>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground"><Info className="h-3.5 w-3.5" /></button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-xs space-y-2">
                <p className="font-semibold">Confidence Score Formula</p>
                <p className="font-mono text-[10px] bg-muted p-2 rounded whitespace-pre-wrap">
                  Score = Seasonality(25%) + HistMatch(25%) + BiasStability(20%) + VolControl(15%) + DemandSignal(15%)
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-3">
            {[
              { label: "Seasonality Alignment", value: confidenceBreakdown.seasonality, weight: "25%" },
              { label: "Historical Pattern Match", value: confidenceBreakdown.historicalMatch, weight: "25%" },
              { label: "Bias Stability", value: confidenceBreakdown.biasStability, weight: "20%" },
              { label: "Volatility Control", value: confidenceBreakdown.volatilityControl, weight: "15%" },
              { label: "Demand Signal Consistency", value: confidenceBreakdown.demandConsistency, weight: "15%" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{item.label} <span className="text-muted-foreground">({item.weight})</span></span>
                  <span className="font-bold">{item.value}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${item.value > 80 ? "bg-accent" : item.value > 60 ? "bg-primary" : "bg-warning"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Agent Explanation */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Agent Recommendation</h3>
            <Badge variant="outline" className="text-[10px] ml-auto">Explainable AI</Badge>
          </div>
          <AIExplanationBox skuId={selectedSKU} compositeScore={Number(compositeScore)} anomalyCount={anomalies.length} />
        </motion.div>
      </div>

      {/* Anomaly Table */}
      {anomalies.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="kpi-card">
          <h3 className="text-sm font-semibold mb-3">Detected Anomalies</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Month</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Baseline</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Adjusted</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Deviation</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Confidence</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Flag</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.slice(0, 8).map((a, i) => {
                  const dev = ((a.adjustedForecast - a.baselineForecast) / a.baselineForecast * 100).toFixed(1);
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2">{a.month}</td>
                      <td className="text-right">{a.baselineForecast.toLocaleString()}</td>
                      <td className="text-right">{a.adjustedForecast.toLocaleString()}</td>
                      <td className={`text-right font-medium ${Math.abs(Number(dev)) > 10 ? "text-destructive" : "text-warning"}`}>{dev}%</td>
                      <td className="text-right">{a.confidenceScore}%</td>
                      <td className="text-right"><AlertTriangle className="h-3 w-3 text-warning inline" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

function AIExplanationBox({ skuId, compositeScore, anomalyCount }: { skuId: string; compositeScore: number; anomalyCount: number }) {
  const sku = skuMaster.find(s => s.id === skuId)!;
  const lines = [
    `Analysis for ${sku.name} (${sku.region}, ${sku.channel}):`,
    "",
    `• Composite confidence score: ${compositeScore}% — ${compositeScore > 80 ? "strong forecast reliability" : compositeScore > 65 ? "moderate reliability, manual review recommended" : "low confidence, significant adjustments applied"}.`,
    "",
    `• ${anomalyCount} anomalies detected across 24-month horizon. ${anomalyCount > 5 ? "Elevated anomaly count suggests structural demand shift." : "Within acceptable threshold for this category."}`,
    "",
    `• Recommended adjustment: Baseline × ${(0.95 + Math.random() * 0.1).toFixed(3)} (seasonality) × ${(0.98 + Math.random() * 0.04).toFixed(3)} (trend) × ${(0.96 + Math.random() * 0.06).toFixed(3)} (volatility penalty).`,
    "",
    `• Action: ${compositeScore > 75 ? "Proceed with adjusted forecast. No manual override needed." : "Flag for demand planning review. Historical bias detected in Q3 periods."}`,
  ];

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50 font-mono text-xs leading-relaxed space-y-0.5">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.12 }}
          className={line === "" ? "h-2" : ""}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

export default ForecastIntelligence;
