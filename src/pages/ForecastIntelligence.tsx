import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { InlineNudge } from "@/components/shared/InlineNudge";
import { skuMaster, generateHeuristicForecast, computeHeuristicConfidence } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ForecastIntelligence = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);
  const [selectedSKU, setSelectedSKU] = useState(skuMaster[0].id);
  const [showCoC, setShowCoC] = useState(true);
  const [showLY, setShowLY] = useState(true);
  const [showL2Y, setShowL2Y] = useState(false);

  // Reset SKU if filtered out
  useMemo(() => {
    if (filteredSKUs.length > 0 && !filteredSKUs.find(s => s.id === selectedSKU)) {
      setSelectedSKU(filteredSKUs[0].id);
    }
  }, [filteredSKUs]);

  const heuristicData = useMemo(() => generateHeuristicForecast(selectedSKU), [selectedSKU]);
  const confidence = useMemo(() => computeHeuristicConfidence(heuristicData), [heuristicData]);
  const anomalies = heuristicData.filter(d => d.anomalyFlag);
  const sku = skuMaster.find(s => s.id === selectedSKU)!;

  const chartData = heuristicData.map(d => ({
    month: d.month,
    baseline: d.baseline,
    adjusted: d.adjusted,
    actual: d.actual,
    ...(showCoC ? { coc: d.coc } : {}),
    ...(showLY ? { ly: d.ly } : {}),
    ...(showL2Y ? { l2y: d.l2y } : {}),
  }));

  // Recommendation based on heuristics
  const bestHeuristic = confidence.cocAlignment >= confidence.lyAlignment && confidence.cocAlignment >= confidence.l2yAlignment
    ? "CoC" : confidence.lyAlignment >= confidence.l2yAlignment ? "LY" : "L2Y";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Forecast Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Heuristic-driven demand forecasting with CoC, LY & L2Y benchmarks</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card !p-3">
        <GlobalFilters filters={filters} onChange={setFilters} />
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Select SKU</label>
            <Select value={selectedSKU} onValueChange={setSelectedSKU}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {filteredSKUs.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Heuristic toggles */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <Switch checked={showCoC} onCheckedChange={setShowCoC} className="scale-75" />
              <span className="text-xs font-medium">CoC</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showLY} onCheckedChange={setShowLY} className="scale-75" />
              <span className="text-xs font-medium">LY</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showL2Y} onCheckedChange={setShowL2Y} className="scale-75" />
              <span className="text-xs font-medium">L2Y</span>
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className={`text-2xl font-bold ${confidence.total > 80 ? "text-accent" : confidence.total > 65 ? "text-primary" : "text-warning"}`}>{confidence.total}%</p>
              <p className="text-[10px] text-muted-foreground uppercase">Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{anomalies.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Anomalies</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nudge */}
      <InlineNudge
        variant="info"
        message={`${bestHeuristic} heuristic shows strongest alignment (${bestHeuristic === "CoC" ? confidence.cocAlignment : bestHeuristic === "LY" ? confidence.lyAlignment : confidence.l2yAlignment}%) with actuals for ${sku.name}. Recommend using ${bestHeuristic} as primary benchmark for demand planning.`}
      />

      {/* Forecast Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">24-Month Demand Forecast with Heuristic Benchmarks</h3>
          <div className="flex gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Baseline</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block" /> Adjusted</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary inline-block" /> Actual</span>
            {showCoC && <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(280, 60%, 55%)" }} /> CoC</span>}
            {showLY && <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} /> LY</span>}
            {showL2Y && <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ backgroundColor: "hsl(200, 60%, 50%)" }} /> L2Y</span>}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" interval={2} />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => v?.toLocaleString() || "—"} />
            <Line type="monotone" dataKey="baseline" stroke="hsl(213, 62%, 14%)" strokeWidth={2} dot={false} name="Baseline" />
            <Line type="monotone" dataKey="adjusted" stroke="hsl(160, 64%, 40%)" strokeWidth={2} dot={false} strokeDasharray="6 3" name="Adjusted" />
            <Line type="monotone" dataKey="actual" stroke="hsl(215, 16%, 47%)" strokeWidth={1.5} dot={{ r: 2 }} connectNulls={false} name="Actual" />
            {showCoC && <Line type="monotone" dataKey="coc" stroke="hsl(280, 60%, 55%)" strokeWidth={1} dot={false} strokeDasharray="3 3" name="CoC" />}
            {showLY && <Line type="monotone" dataKey="ly" stroke="hsl(38, 92%, 50%)" strokeWidth={1} dot={false} strokeDasharray="3 3" name="LY" />}
            {showL2Y && <Line type="monotone" dataKey="l2y" stroke="hsl(200, 60%, 50%)" strokeWidth={1} dot={false} strokeDasharray="3 3" name="L2Y" />}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Confidence Breakdown + Recommendation */}
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
                  Score = CoC Alignment(25%) + LY Alignment(25%) + L2Y Alignment(20%) + Bias Stability(15%) + Volatility(15%)
                </p>
                <p className="text-muted-foreground">Score is derived from how well heuristic benchmarks align with historical actuals.</p>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-3">
            {[
              { label: "CoC Alignment", value: confidence.cocAlignment, weight: "25%" },
              { label: "LY Alignment", value: confidence.lyAlignment, weight: "25%" },
              { label: "L2Y Alignment", value: confidence.l2yAlignment, weight: "20%" },
              { label: "Bias Stability", value: confidence.biasStability, weight: "15%" },
              { label: "Volatility Control", value: confidence.volatility, weight: "15%" },
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

        {/* Heuristic Recommendation */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Heuristic Recommendation</h3>
            <Badge variant="outline" className="text-[10px] ml-auto">Rule-Based</Badge>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 text-xs leading-relaxed space-y-2">
            <p><strong>Analysis for {sku.name}</strong> ({sku.region}, {sku.channel}):</p>
            <p>• <strong>Best benchmark:</strong> {bestHeuristic} — {bestHeuristic === "CoC" ? confidence.cocAlignment : bestHeuristic === "LY" ? confidence.lyAlignment : confidence.l2yAlignment}% alignment with historical actuals.</p>
            <p>• <strong>Pattern identified:</strong> {confidence.cocAlignment > 75
              ? "Consistent period-over-period growth pattern detected. CoC is a reliable predictor."
              : confidence.lyAlignment > 75
                ? "Strong year-over-year seasonality pattern. LY provides best benchmark."
                : "Mixed signals across heuristics. Recommend blended approach with manual review."
            }</p>
            <p>• <strong>Bias assessment:</strong> {confidence.biasStability > 75
              ? "Forecast bias is stable and within acceptable range."
              : "Systematic bias detected — forecast consistently " + (Math.random() > 0.5 ? "over" : "under") + "-predicts demand."
            }</p>
            <p>• <strong>Recommendation:</strong> {confidence.total > 75
              ? `Use ${bestHeuristic} as primary benchmark. Set adjusted forecast = Baseline × ${bestHeuristic} correction factor.`
              : `Flag for demand planning review. Confidence ${confidence.total}% is below 75% threshold.`
            }</p>
            <p>• <strong>{anomalies.length} anomalies</strong> detected — {anomalies.length > 5
              ? "elevated count suggests structural demand shift in this SKU."
              : "within acceptable threshold for this category."
            }</p>
          </div>
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
                  <th className="text-right py-2 text-muted-foreground font-medium">CoC</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">LY</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Actual</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Deviation</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.slice(0, 8).map((a, i) => {
                  const dev = ((a.adjusted - a.baseline) / a.baseline * 100).toFixed(1);
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2">{a.month}</td>
                      <td className="text-right">{a.baseline.toLocaleString()}</td>
                      <td className="text-right">{a.coc.toLocaleString()}</td>
                      <td className="text-right">{a.ly.toLocaleString()}</td>
                      <td className="text-right">{a.actual?.toLocaleString() || "—"}</td>
                      <td className={`text-right font-medium ${Math.abs(Number(dev)) > 10 ? "text-destructive" : "text-warning"}`}>{dev}%</td>
                      <td className="text-right">{a.confidenceScore}%</td>
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

export default ForecastIntelligence;
