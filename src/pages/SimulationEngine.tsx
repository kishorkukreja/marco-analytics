import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ArrowRight, AlertTriangle, CheckCircle2, Info, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { skuMaster, materialMaster, bomTable, supplierMaster, calculateSimilarity, calculateRiskScore, simulateLandedCost } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, ReferenceLine } from "recharts";

const SimulationEngine = () => {
  const [selectedSKU, setSelectedSKU] = useState(skuMaster[0].id);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedSubstitute, setSelectedSubstitute] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simComplete, setSimComplete] = useState(false);
  const [monteCarloEnabled, setMonteCarloEnabled] = useState(false);
  const [mcRunning, setMcRunning] = useState(false);
  const [mcIterations, setMcIterations] = useState(0);
  const [mcData, setMcData] = useState<{ bin: string; count: number; cumPct: number }[]>([]);

  const sku = skuMaster.find(s => s.id === selectedSKU)!;
  const skuMaterials = bomTable.filter(b => b.skuId === selectedSKU).map(b => ({
    ...b,
    material: materialMaster.find(m => m.id === b.materialId)!,
  }));

  useEffect(() => {
    if (skuMaterials.length > 0 && !selectedMaterial) {
      setSelectedMaterial(skuMaterials[0].materialId);
    }
  }, [selectedSKU]);

  const currentMaterial = materialMaster.find(m => m.id === selectedMaterial);
  
  const substitutes = useMemo(() => {
    if (!currentMaterial) return [];
    return materialMaster
      .filter(m => m.id !== currentMaterial.id && m.type === currentMaterial.type)
      .map(m => ({
        material: m,
        similarity: calculateSimilarity(currentMaterial, m),
        riskScore: calculateRiskScore(currentMaterial, m),
        supplier: supplierMaster.find(s => s.id === m.supplierId)!,
      }))
      .filter(s => s.similarity > 30)
      .sort((a, b) => b.similarity - a.similarity);
  }, [currentMaterial]);

  const selectedSub = substitutes.find(s => s.material.id === selectedSubstitute);
  const bomEntry = bomTable.find(b => b.skuId === selectedSKU && b.materialId === selectedMaterial);

  const costSim = useMemo(() => {
    if (!currentMaterial || !selectedSub || !bomEntry) return null;
    return simulateLandedCost(sku, currentMaterial, selectedSub.material, bomEntry.compositionPct);
  }, [currentMaterial, selectedSub, bomEntry, sku]);

  const runSimulation = () => {
    setIsSimulating(true);
    setSimComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimComplete(true);
    }, 800);
  };

  // Monte Carlo Simulation
  const runMonteCarlo = useCallback(() => {
    if (!costSim) return;
    setMcRunning(true);
    setMcIterations(0);
    setMcData([]);

    const totalCost = costSim.substitute.total;
    const N = 5000;
    const results: number[] = [];

    // Simulate cost variations with normal distribution (Box-Muller)
    for (let i = 0; i < N; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      // Material cost ±12%, freight ±18%, duty ±8%, packaging ±5%
      const matVar = 1 + z * 0.12;
      const z2 = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
      const freightVar = 1 + z2 * 0.18;
      const z3 = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
      const dutyVar = 1 + z3 * 0.08;
      const z4 = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
      const pkgVar = 1 + z4 * 0.05;

      const simCost =
        costSim.substitute.formulation * matVar +
        costSim.substitute.freight * freightVar +
        costSim.substitute.duty * dutyVar +
        costSim.substitute.packaging * pkgVar +
        costSim.substitute.manufacturing +
        costSim.substitute.warehouse;
      results.push(simCost);
    }

    results.sort((a, b) => a - b);
    const min = results[0];
    const max = results[results.length - 1];
    const bins = 30;
    const binWidth = (max - min) / bins;
    const histogram: { bin: string; count: number; cumPct: number }[] = [];
    let cumulative = 0;

    for (let i = 0; i < bins; i++) {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const count = results.filter(r => r >= lo && r < hi).length;
      cumulative += count;
      histogram.push({
        bin: `$${(lo / 1000).toFixed(0)}K`,
        count,
        cumPct: Math.round((cumulative / N) * 100),
      });
    }

    // Animate iteration counter
    let iter = 0;
    const step = Math.ceil(N / 20);
    const interval = setInterval(() => {
      iter += step;
      if (iter >= N) {
        iter = N;
        clearInterval(interval);
        setMcRunning(false);
        setMcData(histogram);
      }
      setMcIterations(iter);
    }, 50);
  }, [costSim]);

  useEffect(() => {
    if (monteCarloEnabled && simComplete && costSim) {
      runMonteCarlo();
    } else if (!monteCarloEnabled) {
      setMcData([]);
      setMcIterations(0);
    }
  }, [monteCarloEnabled, simComplete, costSim, runMonteCarlo]);
  const waterfallData = costSim ? [
    { name: "Formulation", value: -(costSim.original.formulation - costSim.substitute.formulation), fill: costSim.original.formulation > costSim.substitute.formulation ? "hsl(160, 64%, 40%)" : "hsl(0, 72%, 51%)" },
    { name: "Freight", value: -(costSim.original.freight - costSim.substitute.freight), fill: costSim.original.freight > costSim.substitute.freight ? "hsl(160, 64%, 40%)" : "hsl(0, 72%, 51%)" },
    { name: "Duty", value: -(costSim.original.duty - costSim.substitute.duty), fill: costSim.original.duty > costSim.substitute.duty ? "hsl(160, 64%, 40%)" : "hsl(0, 72%, 51%)" },
    { name: "Packaging", value: -costSim.substitute.packaging, fill: "hsl(0, 72%, 51%)" },
    { name: "Warehouse", value: -(costSim.original.warehouse - costSim.substitute.warehouse), fill: costSim.original.warehouse > costSim.substitute.warehouse ? "hsl(160, 64%, 40%)" : "hsl(38, 92%, 50%)" },
  ] : [];

  // Monte Carlo stats
  const mcStats = useMemo(() => {
    if (!mcData.length || !costSim) return null;
    const totalCost = costSim.substitute.total;
    const p5 = mcData.find(d => d.cumPct >= 5);
    const p50 = mcData.find(d => d.cumPct >= 50);
    const p95 = mcData.find(d => d.cumPct >= 95);
    return { mean: totalCost, p5: p5?.bin || "", p50: p50?.bin || "", p95: p95?.bin || "" };
  }, [mcData, costSim]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Simulation Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Material substitution analysis with full landed cost simulation</p>
      </motion.div>

      {/* Selection Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Select SKU</label>
            <Select value={selectedSKU} onValueChange={(v) => { setSelectedSKU(v); setSelectedMaterial(""); setSelectedSubstitute(""); setSimComplete(false); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {skuMaster.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Select Material</label>
            <Select value={selectedMaterial} onValueChange={(v) => { setSelectedMaterial(v); setSelectedSubstitute(""); setSimComplete(false); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {skuMaterials.map(m => <SelectItem key={m.materialId} value={m.materialId}>{m.material.id} — {m.material.name} ({m.compositionPct}%)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">SKU Details</label>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{sku.brand}</Badge>
                <Badge variant="outline" className="text-[10px]">{sku.region}</Badge>
                <Badge variant="outline" className="text-[10px]">{sku.channel}</Badge>
                <Badge variant="outline" className="text-[10px]">Margin: {sku.currentMargin}%</Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similarity Results */}
      {currentMaterial && substitutes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Material Substitutes</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground"><Info className="h-3.5 w-3.5" /></button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-xs space-y-2">
                  <p className="font-semibold">How Similarity is Calculated</p>
                  <p className="font-mono text-[10px] bg-muted p-2 rounded">Score = Σ(wᵢ × |attr₁ᵢ - attr₂ᵢ| / rangeᵢ)</p>
                  <p>Weights: Viscosity (20%), Density (20%), pH (25%), Performance (35%)</p>
                  <p className="font-semibold mt-2">Risk Score</p>
                  <p className="font-mono text-[10px] bg-muted p-2 rounded">Risk = AttrVariance × HistFailRate × SupplierReliability</p>
                </PopoverContent>
              </Popover>
            </div>
            <span className="text-xs text-muted-foreground">Showing {substitutes.length} compatible materials</span>
          </div>
          <div className="space-y-2">
            {substitutes.map(sub => (
              <button
                key={sub.material.id}
                onClick={() => { setSelectedSubstitute(sub.material.id); setSimComplete(false); }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSubstitute === sub.material.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{sub.material.name}</span>
                      <span className="text-xs text-muted-foreground">{sub.material.id} • {sub.supplier.name} ({sub.supplier.country})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Similarity</p>
                      <p className="text-sm font-bold text-primary">{sub.similarity}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Cost/kg</p>
                      <p className="text-sm font-semibold">${sub.material.costPerKg.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Risk</p>
                      <p className={`text-sm font-bold ${sub.riskScore < 2 ? "text-accent" : sub.riskScore < 5 ? "text-warning" : "text-destructive"}`}>
                        {sub.riskScore}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Lead Time</p>
                      <p className="text-sm">{sub.supplier.leadTimeDays}d</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Run Simulation */}
      {selectedSub && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-6">
          <Button onClick={runSimulation} disabled={isSimulating} size="lg" className="gap-2 bg-primary hover:bg-primary/90">
            {isSimulating ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run Cost Simulation
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={monteCarloEnabled} onCheckedChange={setMonteCarloEnabled} />
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Monte Carlo</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Simulation Results */}
      <AnimatePresence>
        {simComplete && costSim && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="kpi-card border-accent/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Annual Savings</p>
                <p className={`text-2xl font-bold ${costSim.savings > 0 ? "text-accent" : "text-destructive"}`}>
                  {costSim.savings > 0 ? "+" : ""}{formatCurrency(costSim.savings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">On {sku.annualVolume.toLocaleString()} units</p>
              </div>
              <div className="kpi-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Margin Impact</p>
                <p className={`text-2xl font-bold ${costSim.marginImpact > 0 ? "text-accent" : "text-destructive"}`}>
                  {costSim.marginImpact > 0 ? "+" : ""}{costSim.marginImpact}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Gross margin change</p>
              </div>
              <div className={`kpi-card ${selectedSub!.riskScore < 2 ? "border-accent/30" : selectedSub!.riskScore < 5 ? "border-warning/30" : "border-destructive/30"}`}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Assessment</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedSub!.riskScore < 2 ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
                  <p className="text-lg font-bold">{selectedSub!.riskScore < 2 ? "Low Risk" : selectedSub!.riskScore < 5 ? "Medium Risk" : "High Risk"}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score: {selectedSub!.riskScore}%</p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="kpi-card">
                <h3 className="text-sm font-semibold mb-3">Cost Breakdown Comparison</h3>
                <div className="space-y-2">
                  {(["formulation", "freight", "duty", "warehouse", "manufacturing", "packaging"] as const).map(key => (
                    <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-xs capitalize text-muted-foreground">{key}</span>
                      <div className="flex items-center gap-6 text-xs">
                        <span className="w-24 text-right">{formatCurrency(costSim.original[key])}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="w-24 text-right font-medium">{formatCurrency(costSim.substitute[key])}</span>
                        <span className={`w-20 text-right font-bold ${costSim.original[key] - costSim.substitute[key] > 0 ? "text-accent" : costSim.original[key] - costSim.substitute[key] < 0 ? "text-destructive" : ""}`}>
                          {costSim.original[key] - costSim.substitute[key] > 0 ? "+" : ""}{formatCurrency(costSim.original[key] - costSim.substitute[key])}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 font-bold">
                    <span className="text-sm">Total Landed Cost</span>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="w-24 text-right">{formatCurrency(costSim.original.total)}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="w-24 text-right">{formatCurrency(costSim.substitute.total)}</span>
                      <span className={`w-20 text-right ${costSim.savings > 0 ? "text-accent" : "text-destructive"}`}>
                        {costSim.savings > 0 ? "+" : ""}{formatCurrency(costSim.savings)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waterfall */}
              <div className="kpi-card">
                <h3 className="text-sm font-semibold mb-3">Cost Impact Waterfall</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={waterfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => formatCurrency(Math.abs(v))} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Edge case: margin erosion */}
                {costSim.savings < 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-destructive">Margin Erosion Detected</p>
                        <p className="text-[10px] text-muted-foreground mt-1">While material cost is lower, increased logistics and duty costs result in net margin erosion of {formatCurrency(Math.abs(costSim.savings))} annually.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default SimulationEngine;
