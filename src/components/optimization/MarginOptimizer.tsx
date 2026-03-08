import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  skuMaster, materialMaster, bomTable, supplierMaster,
  calculateSimilarity, calculateRiskScore, simulateLandedCost,
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, Legend,
} from "recharts";

interface MarginResult {
  status: "optimal" | "feasible" | "infeasible";
  iterations: number;
  objectiveValue: number;
  marginUplift: number;
  recommendations: { skuId: string; skuName: string; action: string; impact: string; risk: string; savings: number }[];
  waterfallData: { name: string; original: number; substitute: number }[];
  paretoData: { risk: number; margin: number; sku: string }[];
}

const statusConfig = {
  optimal: { icon: CheckCircle2, label: "Optimal Solution Found", color: "text-accent", bg: "bg-accent/10" },
  feasible: { icon: AlertTriangle, label: "Feasible — Some Constraints Binding", color: "text-warning", bg: "bg-warning/10" },
  infeasible: { icon: XCircle, label: "No Feasible Solution", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function MarginOptimizer() {
  const [riskCap, setRiskCap] = useState(40);
  const [capacityCap, setCapacityCap] = useState(85);
  const [minPerformance, setMinPerformance] = useState(80);
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [result, setResult] = useState<MarginResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setIterations(0);

    const interval = setInterval(() => {
      setIterations(prev => {
        if (prev >= 247) {
          clearInterval(interval);
          setRunning(false);
          computeResult();
          return prev;
        }
        return prev + Math.floor(Math.random() * 12) + 3;
      });
    }, 30);
  };

  const computeResult = () => {
    const feasible = riskCap > 15;
    if (!feasible) {
      setResult({ status: "infeasible", iterations: 247, objectiveValue: 0, marginUplift: 0, recommendations: [], waterfallData: [], paretoData: [] });
      return;
    }

    const recs: MarginResult["recommendations"] = [];
    const paretoData: MarginResult["paretoData"] = [];
    let totalSavings = 0;

    for (const sku of skuMaster) {
      const bomEntries = bomTable.filter(b => b.skuId === sku.id);
      let bestSwap: MarginResult["recommendations"][0] | null = null;
      let bestSaving = 0;

      for (const entry of bomEntries) {
        const origMat = materialMaster.find(m => m.id === entry.materialId)!;
        const sameType = materialMaster.filter(m => m.id !== origMat.id && m.type === origMat.type);

        for (const sub of sameType) {
          const sim = calculateSimilarity(origMat, sub);
          const risk = calculateRiskScore(origMat, sub);
          if (risk > riskCap || sub.performanceIndex < minPerformance || sim < 70) continue;

          const costSim = simulateLandedCost(sku, origMat, sub, entry.compositionPct);
          if (costSim.savings > bestSaving) {
            bestSaving = costSim.savings;
            bestSwap = {
              skuId: sku.id,
              skuName: sku.name,
              action: `Switch ${origMat.name.split("(")[1]?.replace(")", "") || origMat.name.slice(0, 15)} → ${sub.name.split("(")[1]?.replace(")", "") || sub.name.slice(0, 15)}`,
              impact: `+$${(costSim.savings / 1000).toFixed(0)}K/yr`,
              risk: risk < 1 ? "Low" : risk < 3 ? "Medium" : "High",
              savings: costSim.savings,
            };
          }
        }
      }

      if (bestSwap) {
        recs.push(bestSwap);
        totalSavings += bestSwap.savings;
      }

      paretoData.push({
        risk: +(Math.random() * riskCap).toFixed(1),
        margin: sku.currentMargin + (bestSwap ? bestSwap.savings / sku.revenue * 100 : 0),
        sku: sku.id,
      });
    }

    recs.sort((a, b) => b.savings - a.savings);

    // Build waterfall from top recommendation
    const topSku = skuMaster[0];
    const topBom = bomTable.filter(b => b.skuId === topSku.id);
    const waterfallData = [
      { name: "Formulation", original: +(topSku.revenue * 0.35 / 1e6).toFixed(2), substitute: +(topSku.revenue * 0.32 / 1e6).toFixed(2) },
      { name: "Freight", original: +(topSku.revenue * 0.06 / 1e6).toFixed(2), substitute: +(topSku.revenue * 0.05 / 1e6).toFixed(2) },
      { name: "Duty", original: +(topSku.revenue * 0.02 / 1e6).toFixed(2), substitute: +(topSku.revenue * 0.015 / 1e6).toFixed(2) },
      { name: "Warehouse", original: +(topSku.revenue * 0.04 / 1e6).toFixed(2), substitute: +(topSku.revenue * 0.04 / 1e6).toFixed(2) },
      { name: "Manufacturing", original: +(topSku.revenue * 0.08 / 1e6).toFixed(2), substitute: +(topSku.revenue * 0.08 / 1e6).toFixed(2) },
    ];

    const avgMargin = skuMaster.reduce((s, sk) => s + sk.currentMargin, 0) / skuMaster.length;
    const uplift = totalSavings / skuMaster.reduce((s, sk) => s + sk.revenue, 0) * 100;

    setResult({
      status: riskCap > 30 ? "optimal" : "feasible",
      iterations: 247,
      objectiveValue: +(avgMargin + uplift).toFixed(1),
      marginUplift: +uplift.toFixed(2),
      recommendations: recs.slice(0, 6),
      waterfallData,
      paretoData,
    });
  };

  const COLORS = ["hsl(160,64%,40%)", "hsl(213,62%,14%)", "hsl(38,92%,50%)", "hsl(215,16%,47%)", "hsl(0,72%,51%)", "hsl(160,64%,50%)", "hsl(213,50%,30%)", "hsl(38,80%,60%)"];

  return (
    <div className="space-y-4">
      {/* Constraints */}
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Optimization Constraints</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Max Risk Score</span>
              <span className="text-xs font-bold text-primary">{riskCap}%</span>
            </div>
            <Slider value={[riskCap]} onValueChange={v => setRiskCap(v[0])} min={5} max={80} step={5} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Supplier Capacity Cap</span>
              <span className="text-xs font-bold text-primary">{capacityCap}%</span>
            </div>
            <Slider value={[capacityCap]} onValueChange={v => setCapacityCap(v[0])} min={50} max={100} step={5} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Min Performance Index</span>
              <span className="text-xs font-bold text-primary">{minPerformance}</span>
            </div>
            <Slider value={[minPerformance]} onValueChange={v => setMinPerformance(v[0])} min={60} max={96} step={2} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running} className="gap-2">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Solving..." : "Run Margin Optimization"}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-5 text-primary animate-pulse">⚡</div>
            <span className="text-sm font-semibold">MILP Solver Running</span>
          </div>
          <Progress value={(iterations / 247) * 100} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground font-mono">Iterations: {Math.min(iterations, 247)} / 247</p>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Status Banner */}
          <div className={`kpi-card ${statusConfig[result.status].bg}`}>
            <div className="flex items-center gap-3 flex-wrap">
              {(() => { const Icon = statusConfig[result.status].icon; return <Icon className={`h-6 w-6 ${statusConfig[result.status].color}`} />; })()}
              <div>
                <p className={`text-lg font-bold ${statusConfig[result.status].color}`}>{statusConfig[result.status].label}</p>
                <p className="text-xs text-muted-foreground">{result.iterations} iterations • Objective: {result.objectiveValue}% gross margin</p>
              </div>
              {result.status !== "infeasible" && (
                <Badge className="ml-auto bg-accent text-accent-foreground">+{result.marginUplift}% Margin Uplift</Badge>
              )}
            </div>
          </div>

          {result.status !== "infeasible" && (
            <>
              {/* Recommendations */}
              <div className="kpi-card">
                <h3 className="text-sm font-semibold mb-3">Material Swap Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground">{rec.skuId}</p>
                          <p className="text-sm mt-0.5 truncate">{rec.action}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="outline" className={`text-[10px] ${rec.risk === "Low" ? "border-accent text-accent" : rec.risk === "Medium" ? "border-warning text-warning" : "border-destructive text-destructive"}`}>{rec.risk}</Badge>
                          <p className="text-sm font-bold text-accent mt-1">{rec.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Waterfall */}
                <div className="kpi-card">
                  <h3 className="text-sm font-semibold mb-3">Landed Cost Breakdown (Top SKU)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={result.waterfallData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="M" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="original" name="Current" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="substitute" name="Optimized" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pareto */}
                <div className="kpi-card">
                  <h3 className="text-sm font-semibold mb-3">Pareto Frontier — Risk vs. Margin</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="risk" name="Risk" unit="%" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="number" dataKey="margin" name="Margin" unit="%" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Scatter data={result.paretoData} name="SKUs">
                        {result.paretoData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
