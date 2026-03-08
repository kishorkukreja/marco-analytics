import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { materialMaster, bomTable, supplierMaster, skuMaster } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

interface RawRatResult {
  totalMaterials: number;
  keepCount: number;
  consolidateCount: number;
  eliminateCount: number;
  projectedSavings: number;
  supplierReduction: number;
  materialAnalysis: {
    id: string; name: string; type: string; usageCount: number;
    costPerKg: number; annualSpend: number; supplierName: string;
    substitutability: number; recommendation: "Keep" | "Consolidate" | "Eliminate";
  }[];
  spendByType: { type: string; spend: number; materialCount: number }[];
  supplierConcentration: { supplier: string; spend: number; materialCount: number }[];
}

export default function RawMaterialRationalization() {
  const [minUsage, setMinUsage] = useState(2);
  const [maxCostPerKg, setMaxCostPerKg] = useState(5);
  const [minSubstitutability, setMinSubstitutability] = useState(70);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<RawRatResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setRunning(false); computeResult(); return 100; }
        return prev + Math.floor(Math.random() * 7) + 3;
      });
    }, 40);
  };

  const computeResult = () => {
    const materialAnalysis = materialMaster.map(mat => {
      const usage = bomTable.filter(b => b.materialId === mat.id);
      const usageCount = usage.length;
      const supplier = supplierMaster.find(s => s.id === mat.supplierId);

      // Estimate annual spend
      let annualSpend = 0;
      usage.forEach(u => {
        const sku = skuMaster.find(s => s.id === u.skuId);
        if (sku) annualSpend += sku.annualVolume * (u.compositionPct / 100) * mat.costPerKg;
      });

      // Substitutability: how many same-type materials exist
      const sameType = materialMaster.filter(m => m.type === mat.type && m.id !== mat.id);
      const substitutability = sameType.length > 0 ? Math.min(95, 50 + sameType.length * 15) : 10;

      let recommendation: "Keep" | "Consolidate" | "Eliminate" = "Keep";
      if (usageCount < minUsage && substitutability >= minSubstitutability) recommendation = "Eliminate";
      else if (mat.costPerKg > maxCostPerKg && sameType.length > 0) recommendation = "Consolidate";
      else if (usageCount === 0) recommendation = "Eliminate";

      return {
        id: mat.id,
        name: mat.name.length > 25 ? mat.name.split("(")[1]?.replace(")", "") || mat.name.slice(0, 20) : mat.name,
        type: mat.type,
        usageCount,
        costPerKg: mat.costPerKg,
        annualSpend: +annualSpend.toFixed(0),
        supplierName: supplier?.name || "Unknown",
        substitutability,
        recommendation,
      };
    }).sort((a, b) => b.annualSpend - a.annualSpend);

    // Spend by type
    const typeMap = new Map<string, { spend: number; count: number }>();
    materialAnalysis.forEach(m => {
      const prev = typeMap.get(m.type) || { spend: 0, count: 0 };
      typeMap.set(m.type, { spend: prev.spend + m.annualSpend, count: prev.count + 1 });
    });
    const spendByType = Array.from(typeMap.entries()).map(([type, v]) => ({
      type, spend: +(v.spend / 1e6).toFixed(2), materialCount: v.count,
    })).sort((a, b) => b.spend - a.spend);

    // Supplier concentration
    const supMap = new Map<string, { spend: number; count: number }>();
    materialAnalysis.forEach(m => {
      const prev = supMap.get(m.supplierName) || { spend: 0, count: 0 };
      supMap.set(m.supplierName, { spend: prev.spend + m.annualSpend, count: prev.count + 1 });
    });
    const supplierConcentration = Array.from(supMap.entries()).map(([supplier, v]) => ({
      supplier, spend: +(v.spend / 1e6).toFixed(2), materialCount: v.count,
    })).sort((a, b) => b.spend - a.spend);

    const keepCount = materialAnalysis.filter(m => m.recommendation === "Keep").length;
    const consolidateCount = materialAnalysis.filter(m => m.recommendation === "Consolidate").length;
    const eliminateCount = materialAnalysis.filter(m => m.recommendation === "Eliminate").length;

    setResult({
      totalMaterials: materialMaster.length,
      keepCount, consolidateCount, eliminateCount,
      projectedSavings: consolidateCount * 95000 + eliminateCount * 45000,
      supplierReduction: eliminateCount > 0 ? 1 : 0,
      materialAnalysis, spendByType, supplierConcentration,
    });
  };

  const PIE_COLORS = ["hsl(213,62%,14%)", "hsl(160,64%,40%)", "hsl(38,92%,50%)", "hsl(215,16%,47%)", "hsl(0,72%,51%)"];
  const recColors = { Keep: "border-accent text-accent", Consolidate: "border-warning text-warning", Eliminate: "border-destructive text-destructive" };

  return (
    <div className="space-y-4">
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Raw Material Rationalization Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Min Usage (# SKUs)</span><span className="text-xs font-bold text-primary">{minUsage}</span></div>
            <Slider value={[minUsage]} onValueChange={v => setMinUsage(v[0])} min={1} max={6} step={1} />
            <p className="text-[10px] text-muted-foreground">Materials used in fewer SKUs flagged for elimination</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Max Cost/Kg Target</span><span className="text-xs font-bold text-primary">${maxCostPerKg.toFixed(2)}</span></div>
            <Slider value={[maxCostPerKg]} onValueChange={v => setMaxCostPerKg(v[0])} min={1} max={8} step={0.5} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Min Substitutability</span><span className="text-xs font-bold text-primary">{minSubstitutability}%</span></div>
            <Slider value={[minSubstitutability]} onValueChange={v => setMinSubstitutability(v[0])} min={30} max={95} step={5} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running} className="gap-2">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Analyzing..." : "Run Raw Material Rationalization"}
          </Button>
          {result && <Button variant="outline" onClick={() => setResult(null)} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>}
        </div>
      </div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <span className="text-sm font-semibold">Analyzing raw material portfolio…</span>
          <Progress value={Math.min(progress, 100)} className="h-2 mt-3" />
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Total Materials</p><p className="text-xl font-bold text-primary">{result.totalMaterials}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Keep</p><p className="text-xl font-bold text-accent">{result.keepCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Consolidate</p><p className="text-xl font-bold text-warning">{result.consolidateCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Eliminate</p><p className="text-xl font-bold text-destructive">{result.eliminateCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Savings</p><p className="text-xl font-bold text-accent">${(result.projectedSavings / 1000).toFixed(0)}K</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Spend by Material Type ($M)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.spendByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="spend" name="Spend ($M)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Supplier Spend Concentration</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.supplierConcentration} dataKey="spend" nameKey="supplier" cx="50%" cy="50%" outerRadius={90} label={({ supplier, spend }) => `${supplier.split(" ")[0]} $${spend}M`} labelLine={false}>
                    {result.supplierConcentration.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-card">
            <h3 className="text-sm font-semibold mb-3">Material Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">Material</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">$/Kg</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Usage</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Spend</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Subst.</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Action</th>
                </tr></thead>
                <tbody>
                  {result.materialAnalysis.map(m => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2"><span className="text-xs font-medium">{m.id}</span><span className="text-xs ml-2 hidden sm:inline text-muted-foreground">{m.name}</span></td>
                      <td className="text-right py-2 text-xs">{m.type}</td>
                      <td className="text-right py-2 text-xs font-mono hidden sm:table-cell">${m.costPerKg.toFixed(2)}</td>
                      <td className="text-right py-2 text-xs font-mono">{m.usageCount}</td>
                      <td className="text-right py-2 text-xs font-mono hidden sm:table-cell">${(m.annualSpend / 1e6).toFixed(2)}M</td>
                      <td className="text-right py-2 text-xs font-mono">{m.substitutability}%</td>
                      <td className="text-right py-2"><Badge variant="outline" className={`text-[10px] ${recColors[m.recommendation]}`}>{m.recommendation}</Badge></td>
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
