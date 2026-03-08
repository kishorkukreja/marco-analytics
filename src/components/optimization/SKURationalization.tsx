import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { skuMaster } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  ScatterChart, Scatter,
} from "recharts";

interface SKURatResult {
  totalSKUs: number;
  keepCount: number;
  mergeCount: number;
  sunsetCount: number;
  projectedSavings: number;
  complexityReduction: number;
  skuAnalysis: {
    id: string; name: string; revenue: number; margin: number;
    volume: number; velocityScore: number; profitabilityScore: number;
    complexityCost: number; recommendation: "Keep" | "Merge" | "Sunset";
  }[];
  revenuePareto: { sku: string; revenuePct: number; cumPct: number }[];
  complexityVsMargin: { sku: string; complexity: number; margin: number; revenue: number }[];
}

export default function SKURationalization() {
  const [minMargin, setMinMargin] = useState(25);
  const [minVelocity, setMinVelocity] = useState(30);
  const [maxComplexity, setMaxComplexity] = useState(60);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SKURatResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setRunning(false); computeResult(); return 100; }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 40);
  };

  const computeResult = () => {
    const totalRevenue = skuMaster.reduce((s, sk) => s + sk.revenue, 0);
    const maxVolume = Math.max(...skuMaster.map(s => s.annualVolume));

    const skuAnalysis = skuMaster.map(sku => {
      const velocityScore = (sku.annualVolume / maxVolume) * 100;
      const profitabilityScore = (sku.currentMargin / 50) * 100;
      const complexityCost = +(100 - velocityScore * 0.4 - profitabilityScore * 0.3 + Math.random() * 15).toFixed(1);

      let recommendation: "Keep" | "Merge" | "Sunset" = "Keep";
      if (sku.currentMargin < minMargin && velocityScore < minVelocity) recommendation = "Sunset";
      else if (complexityCost > maxComplexity || velocityScore < minVelocity) recommendation = "Merge";

      return {
        id: sku.id, name: sku.name.split(" ").slice(0, 2).join(" "),
        revenue: sku.revenue, margin: sku.currentMargin, volume: sku.annualVolume,
        velocityScore: +velocityScore.toFixed(1), profitabilityScore: +profitabilityScore.toFixed(1),
        complexityCost: Math.max(10, complexityCost),
        recommendation,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Pareto (80/20)
    let cumRev = 0;
    const revenuePareto = skuAnalysis.map(s => {
      cumRev += s.revenue;
      return { sku: s.id, revenuePct: +(s.revenue / totalRevenue * 100).toFixed(1), cumPct: +(cumRev / totalRevenue * 100).toFixed(1) };
    });

    const complexityVsMargin = skuAnalysis.map(s => ({
      sku: s.id, complexity: s.complexityCost, margin: s.margin, revenue: s.revenue,
    }));

    const keepCount = skuAnalysis.filter(s => s.recommendation === "Keep").length;
    const mergeCount = skuAnalysis.filter(s => s.recommendation === "Merge").length;
    const sunsetCount = skuAnalysis.filter(s => s.recommendation === "Sunset").length;
    const sunsetRevenue = skuAnalysis.filter(s => s.recommendation === "Sunset").reduce((s, sk) => s + sk.revenue, 0);
    const complexitySavings = (mergeCount * 120000 + sunsetCount * 85000);

    setResult({
      totalSKUs: skuMaster.length,
      keepCount, mergeCount, sunsetCount,
      projectedSavings: complexitySavings,
      complexityReduction: +((mergeCount + sunsetCount) / skuMaster.length * 100).toFixed(0),
      skuAnalysis, revenuePareto, complexityVsMargin,
    });
  };

  const recColors = { Keep: "border-accent text-accent", Merge: "border-warning text-warning", Sunset: "border-destructive text-destructive" };
  const dotColors = { Keep: "hsl(160,64%,40%)", Merge: "hsl(38,92%,50%)", Sunset: "hsl(0,72%,51%)" };

  return (
    <div className="space-y-4">
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">SKU Rationalization Thresholds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Min Margin Threshold</span><span className="text-xs font-bold text-primary">{minMargin}%</span></div>
            <Slider value={[minMargin]} onValueChange={v => setMinMargin(v[0])} min={10} max={45} step={1} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Min Velocity Score</span><span className="text-xs font-bold text-primary">{minVelocity}</span></div>
            <Slider value={[minVelocity]} onValueChange={v => setMinVelocity(v[0])} min={10} max={70} step={5} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Max Complexity Score</span><span className="text-xs font-bold text-primary">{maxComplexity}</span></div>
            <Slider value={[maxComplexity]} onValueChange={v => setMaxComplexity(v[0])} min={20} max={90} step={5} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running} className="gap-2">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Analyzing..." : "Run SKU Rationalization"}
          </Button>
          {result && <Button variant="outline" onClick={() => setResult(null)} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>}
        </div>
      </div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <span className="text-sm font-semibold">Analyzing SKU portfolio complexity…</span>
          <Progress value={Math.min(progress, 100)} className="h-2 mt-3" />
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Total SKUs</p><p className="text-xl font-bold text-primary">{result.totalSKUs}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Keep</p><p className="text-xl font-bold text-accent">{result.keepCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Merge</p><p className="text-xl font-bold text-warning">{result.mergeCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Sunset</p><p className="text-xl font-bold text-destructive">{result.sunsetCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Complexity Savings</p><p className="text-xl font-bold text-accent">${(result.projectedSavings / 1000).toFixed(0)}K</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Revenue Pareto (80/20 Analysis)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.revenuePareto}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="sku" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="revenuePct" name="Revenue %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="cumPct" name="Cumulative %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Complexity vs. Margin</h3>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="complexity" name="Complexity" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="number" dataKey="margin" name="Margin" unit="%" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Scatter data={result.complexityVsMargin} name="SKUs">
                    {result.complexityVsMargin.map((entry, i) => {
                      const analysis = result.skuAnalysis.find(s => s.id === entry.sku);
                      return <Cell key={i} fill={dotColors[analysis?.recommendation || "Keep"]} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-card">
            <h3 className="text-sm font-semibold mb-3">SKU Analysis & Recommendations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Revenue</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Margin</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Velocity</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Complexity</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Action</th>
                </tr></thead>
                <tbody>
                  {result.skuAnalysis.map(s => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-2"><span className="text-xs font-medium">{s.id}</span><span className="text-xs ml-2 hidden sm:inline text-muted-foreground">{s.name}</span></td>
                      <td className="text-right py-2 text-xs font-mono hidden sm:table-cell">${(s.revenue / 1e6).toFixed(1)}M</td>
                      <td className="text-right py-2 text-xs font-mono">{s.margin}%</td>
                      <td className="text-right py-2 text-xs font-mono">{s.velocityScore.toFixed(0)}</td>
                      <td className="text-right py-2 text-xs font-mono">{s.complexityCost.toFixed(0)}</td>
                      <td className="text-right py-2"><Badge variant="outline" className={`text-[10px] ${recColors[s.recommendation]}`}>{s.recommendation}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
