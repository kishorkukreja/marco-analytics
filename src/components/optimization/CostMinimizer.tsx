import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  skuMaster, materialMaster, bomTable, supplierMaster, logisticsRates,
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface CostResult {
  totalSavings: number;
  savingsPct: number;
  recommendations: { type: string; description: string; savings: number; risk: string }[];
  costBreakdown: { category: string; formulation: number; freight: number; duty: number; warehouse: number }[];
  savingsByCategory: { category: string; current: number; optimized: number }[];
}

export default function CostMinimizer() {
  const [targetReduction, setTargetReduction] = useState(10);
  const [minPerformance, setMinPerformance] = useState(75);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CostResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          computeResult();
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 40);
  };

  const computeResult = () => {
    const categories = [...new Set(skuMaster.map(s => s.category))];

    // Cost breakdown by category
    const costBreakdown = categories.map(cat => {
      const catSKUs = skuMaster.filter(s => s.category === cat);
      const totalRev = catSKUs.reduce((s, sk) => s + sk.revenue, 0);
      return {
        category: cat,
        formulation: +(totalRev * 0.35 / 1e6).toFixed(2),
        freight: +(totalRev * 0.06 / 1e6).toFixed(2),
        duty: +(totalRev * 0.02 / 1e6).toFixed(2),
        warehouse: +(totalRev * 0.04 / 1e6).toFixed(2),
      };
    });

    // Savings by category
    const reductionFactor = targetReduction / 100;
    const savingsByCategory = categories.map(cat => {
      const catSKUs = skuMaster.filter(s => s.category === cat);
      const current = +(catSKUs.reduce((s, sk) => s + sk.revenue * 0.47, 0) / 1e6).toFixed(2);
      const optimized = +(current * (1 - reductionFactor * (0.6 + Math.random() * 0.4))).toFixed(2);
      return { category: cat, current, optimized };
    });

    // Generate recommendations
    const recs: CostResult["recommendations"] = [];

    // Supplier consolidation
    const supplierCounts = new Map<string, number>();
    bomTable.forEach(b => {
      const mat = materialMaster.find(m => m.id === b.materialId);
      if (mat) supplierCounts.set(mat.supplierId, (supplierCounts.get(mat.supplierId) || 0) + 1);
    });
    const topSupplier = supplierMaster.reduce((best, s) => (supplierCounts.get(s.id) || 0) > (supplierCounts.get(best.id) || 0) ? s : best);
    recs.push({
      type: "Supplier Consolidation",
      description: `Consolidate 60% of surfactant orders to ${topSupplier.name} for volume discount`,
      savings: 185000,
      risk: "Low",
    });

    // Freight optimization
    recs.push({
      type: "Freight Route Optimization",
      description: "Switch APAC inbound from sea-air to full sea route, saving $0.08/kg on avg",
      savings: 142000,
      risk: "Low",
    });

    // Duty optimization
    recs.push({
      type: "Duty Reduction",
      description: "Reclassify Citric Acid under HS 2918.14 for 0% duty in EMEA (currently at 2%)",
      savings: 67000,
      risk: "Medium",
    });

    // MOQ optimization
    recs.push({
      type: "MOQ Batching",
      description: "Batch Zeolite 4A orders quarterly instead of monthly to reduce per-unit freight",
      savings: 38000,
      risk: "Low",
    });

    // Warehouse consolidation
    recs.push({
      type: "Warehouse Optimization",
      description: "Cross-dock EMEA materials through Hamburg instead of split Rotterdam/Antwerp",
      savings: 52000,
      risk: "Medium",
    });

    const totalSavings = recs.reduce((s, r) => s + r.savings, 0);
    const totalCost = skuMaster.reduce((s, sk) => s + sk.revenue * 0.47, 0);

    setResult({
      totalSavings,
      savingsPct: +(totalSavings / totalCost * 100).toFixed(2),
      recommendations: recs,
      costBreakdown,
      savingsByCategory,
    });
  };

  return (
    <div className="space-y-4">
      {/* Constraints */}
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Cost Reduction Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Target Cost Reduction</span>
              <span className="text-xs font-bold text-primary">{targetReduction}%</span>
            </div>
            <Slider value={[targetReduction]} onValueChange={v => setTargetReduction(v[0])} min={2} max={25} step={1} />
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
            {running ? "Optimizing..." : "Run Cost Optimization"}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <span className="text-sm font-semibold">Analyzing cost structure…</span>
          <Progress value={Math.min(progress, 100)} className="h-2 mt-3" />
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary */}
          <div className="kpi-card bg-accent/10">
            <div className="flex items-center gap-3 flex-wrap">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              <div>
                <p className="text-lg font-bold text-accent">Total Savings Identified: ${(result.totalSavings / 1000).toFixed(0)}K/yr</p>
                <p className="text-xs text-muted-foreground">{result.savingsPct}% of total landed cost • {result.recommendations.length} actionable recommendations</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="kpi-card">
            <h3 className="text-sm font-semibold mb-3">Cost Reduction Recommendations</h3>
            <div className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Badge variant="outline" className="text-[10px] mb-1">{rec.type}</Badge>
                      <p className="text-sm">{rec.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${rec.risk === "Low" ? "border-accent text-accent" : "border-warning text-warning"}`}>{rec.risk}</Badge>
                      <p className="text-sm font-bold text-accent mt-1">+${(rec.savings / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Cost Breakdown by Category ($M)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.costBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="formulation" name="Formulation" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="freight" name="Freight" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="duty" name="Duty" stackId="a" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="warehouse" name="Warehouse" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Current vs. Optimized Cost ($M)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.savingsByCategory} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="current" name="Current" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimized" name="Optimized" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
