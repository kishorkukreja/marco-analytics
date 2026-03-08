import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, AlertTriangle, CheckCircle2, Info, Zap, Activity, TrendingUp,
  DollarSign, Target, Leaf, BarChart3, Store, Ship, Save, GitCompare, X, Clock, Percent, Boxes, Factory
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { InlineNudge } from "@/components/shared/InlineNudge";
import {
  skuMaster, materialMaster, bomTable, supplierMaster,
  calculateSimilarity, calculateRiskScore, simulateLandedCost,
  scenarioTriggers, ScenarioCategory, ScenarioTrigger,
  simulateMultiMetric, MultiMetricResult, MetricKey, metricLabels, SavedScenario
} from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area, ReferenceLine, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";

const scenarioIcons: Record<string, React.ElementType> = {
  TrendingUp, AlertTriangle, DollarSign, Target, Leaf, BarChart3, Store, Ship,
};

const categoryLabels: Record<ScenarioCategory | "all", string> = {
  all: "All Triggers",
  macroeconomic: "Macroeconomic",
  supply_chain: "Supply Chain",
  strategic: "Strategic",
  demand: "Demand",
};

const categoryColors: Record<ScenarioCategory, string> = {
  macroeconomic: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  supply_chain: "bg-destructive/10 text-destructive border-destructive/30",
  strategic: "bg-primary/10 text-primary border-primary/30",
  demand: "bg-accent/10 text-accent border-accent/30",
};

const severityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-secondary text-secondary-foreground",
};

const metricIcons: Record<MetricKey, React.ElementType> = {
  serviceLevel: CheckCircle2,
  margin: Percent,
  inventoryTurnover: Boxes,
  profitability: DollarSign,
  timeToMake: Factory,
  leadTime: Clock,
};

const SAVED_SCENARIOS_KEY = "sim_saved_scenarios";

function loadSavedScenarios(): SavedScenario[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_SCENARIOS_KEY) || "[]");
  } catch { return []; }
}

function persistScenarios(scenarios: SavedScenario[]) {
  localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(scenarios));
}

const SimulationEngine = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);

  const initialSKU = searchParams.get("sku") || skuMaster[0].id;
  const [selectedSKU, setSelectedSKU] = useState(initialSKU);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedSubstitute, setSelectedSubstitute] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simComplete, setSimComplete] = useState(false);
  const [monteCarloEnabled, setMonteCarloEnabled] = useState(false);

  // Scenario state
  const [scenarioFilter, setScenarioFilter] = useState<ScenarioCategory | "all">("all");
  const [selectedTrigger, setSelectedTrigger] = useState<ScenarioTrigger | null>(null);

  // Multi-metric Monte Carlo
  const [multiMetricResult, setMultiMetricResult] = useState<MultiMetricResult | null>(null);
  const [mcRunning, setMcRunning] = useState(false);
  const [mcProgress, setMcProgress] = useState(0);
  const [activeMetricTab, setActiveMetricTab] = useState<MetricKey>("serviceLevel");

  // Save & Compare
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(loadSavedScenarios);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (filteredSKUs.length > 0 && !filteredSKUs.find(s => s.id === selectedSKU)) {
      setSelectedSKU(filteredSKUs[0].id);
      setSelectedMaterial("");
      setSelectedSubstitute("");
      setSimComplete(false);
    }
  }, [filteredSKUs]);

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

  // Scenario triggers filtered
  const filteredTriggers = useMemo(() =>
    scenarioFilter === "all" ? scenarioTriggers : scenarioTriggers.filter(t => t.category === scenarioFilter),
    [scenarioFilter]
  );

  // Handle scenario trigger selection
  const selectTrigger = (trigger: ScenarioTrigger) => {
    setSelectedTrigger(trigger);
    // Auto-fill SKU and material
    if (trigger.affectedSKUs.length > 0) {
      const skuId = trigger.affectedSKUs[0];
      setSelectedSKU(skuId);
      setSelectedMaterial("");
      setSelectedSubstitute("");
      setSimComplete(false);
      setMultiMetricResult(null);
      // Set material after SKU change
      setTimeout(() => {
        const mats = bomTable.filter(b => b.skuId === skuId);
        const affected = mats.find(b => trigger.affectedMaterials.includes(b.materialId));
        if (affected) setSelectedMaterial(affected.materialId);
        else if (mats.length > 0) setSelectedMaterial(mats[0].materialId);
      }, 50);
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimComplete(false);
    setMultiMetricResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimComplete(true);
    }, 800);
  };

  // Multi-metric Monte Carlo
  const runMultiMetric = useCallback(() => {
    if (!currentMaterial || !selectedSub || !bomEntry) return;
    setMcRunning(true);
    setMcProgress(0);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setMcProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(interval);
        const result = simulateMultiMetric(
          sku, currentMaterial, selectedSub.material, bomEntry.compositionPct,
          selectedTrigger?.severity || "none"
        );
        setMultiMetricResult(result);
        setMcRunning(false);
      }
    }, 40);
  }, [currentMaterial, selectedSub, bomEntry, sku, selectedTrigger]);

  useEffect(() => {
    if (monteCarloEnabled && simComplete && costSim) runMultiMetric();
    else if (!monteCarloEnabled) { setMultiMetricResult(null); setMcProgress(0); }
  }, [monteCarloEnabled, simComplete, costSim, runMultiMetric]);

  // Save scenario
  const handleSave = () => {
    if (!scenarioName.trim() || !costSim || !multiMetricResult) return;
    const newScenario: SavedScenario = {
      id: `saved-${Date.now()}`,
      name: scenarioName.trim(),
      timestamp: new Date().toISOString(),
      skuId: selectedSKU,
      materialId: selectedMaterial,
      substituteId: selectedSubstitute,
      triggerId: selectedTrigger?.id || null,
      triggerTitle: selectedTrigger?.title || null,
      costSim,
      multiMetric: multiMetricResult,
    };
    const updated = [...savedScenarios, newScenario];
    setSavedScenarios(updated);
    persistScenarios(updated);
    setSaveDialogOpen(false);
    setScenarioName("");
  };

  const deleteSaved = (id: string) => {
    const updated = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updated);
    persistScenarios(updated);
    setCompareIds(prev => prev.filter(cid => cid !== id));
  };

  const toggleCompareId = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  // Radar data for compare
  const compareRadarData = useMemo(() => {
    const selected = savedScenarios.filter(s => compareIds.includes(s.id));
    if (selected.length === 0) return [];
    const metrics: MetricKey[] = ["serviceLevel", "margin", "inventoryTurnover", "profitability", "timeToMake", "leadTime"];
    return metrics.map(mk => {
      const row: Record<string, string | number> = { metric: metricLabels[mk].label };
      selected.forEach(s => {
        // Normalize to 0-100 scale for radar
        const val = s.multiMetric[mk].p50;
        let normalized: number;
        if (mk === "serviceLevel") normalized = val;
        else if (mk === "margin") normalized = val * 2; // ~50% max
        else if (mk === "inventoryTurnover") normalized = Math.max(0, 100 - val * 1.5);
        else if (mk === "profitability") normalized = Math.min(100, val / 50);
        else if (mk === "timeToMake") normalized = Math.max(0, 100 - val * 10);
        else normalized = Math.max(0, 100 - val * 2); // leadTime
        row[s.name] = +normalized.toFixed(1);
      });
      return row;
    });
  }, [compareIds, savedScenarios]);

  const radarColors = ["hsl(213, 62%, 44%)", "hsl(160, 64%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 50%)"];

  const waterfallData = costSim ? [
    { name: "Formulation", value: -(costSim.original.formulation - costSim.substitute.formulation), fill: costSim.original.formulation > costSim.substitute.formulation ? "hsl(160, 64%, 40%)" : "hsl(0, 72%, 51%)" },
    { name: "Freight", value: -(costSim.original.freight - costSim.substitute.freight), fill: costSim.original.freight > costSim.substitute.freight ? "hsl(160, 64%, 40%)" : "hsl(0, 72%, 51%)" },
    { name: "Duty", value: -(costSim.original.duty - costSim.substitute.duty), fill: costSim.original.duty > costSim.substitute.duty ? "hsl(160, 64%, 40%)" : "hsl(0, 72%, 51%)" },
    { name: "Packaging", value: -costSim.substitute.packaging, fill: "hsl(0, 72%, 51%)" },
    { name: "Warehouse", value: -(costSim.original.warehouse - costSim.substitute.warehouse), fill: costSim.original.warehouse > costSim.substitute.warehouse ? "hsl(160, 64%, 40%)" : "hsl(38, 92%, 50%)" },
  ] : [];

  const bestSub = substitutes.length > 0 ? substitutes[0] : null;
  const nudgeMessage = bestSub && currentMaterial
    ? `${bestSub.material.name} shows ${bestSub.similarity}% similarity to ${currentMaterial.name} at $${bestSub.material.costPerKg.toFixed(2)}/kg (vs $${currentMaterial.costPerKg.toFixed(2)}/kg). Risk score: ${bestSub.riskScore}%.`
    : null;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Simulation Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Scenario-driven simulation with multi-metric Monte Carlo analysis</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card !p-3">
        <GlobalFilters filters={filters} onChange={setFilters} />
      </motion.div>

      {/* ===== SCENARIO TRIGGERS ===== */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">Scenario Triggers</h3>
            <Badge variant="outline" className="text-[10px]">{scenarioTriggers.length} active</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "macroeconomic", "supply_chain", "strategic", "demand"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setScenarioFilter(cat)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                  scenarioFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredTriggers.map(trigger => {
            const IconComp = scenarioIcons[trigger.icon] || AlertTriangle;
            const isSelected = selectedTrigger?.id === trigger.id;
            return (
              <button
                key={trigger.id}
                onClick={() => selectTrigger(trigger)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${categoryColors[trigger.category]}`}>
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <Badge className={`text-[9px] ${severityColors[trigger.severity]}`}>
                    {trigger.severity}
                  </Badge>
                </div>
                <p className="text-xs font-semibold mb-1 line-clamp-1">{trigger.title}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{trigger.description}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{trigger.affectedSKUs.length} SKUs affected</span>
                  <span className="text-[9px] text-muted-foreground/50">•</span>
                  <span className="text-[9px] text-muted-foreground">{trigger.timestamp}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Context Banner */}
      {selectedTrigger && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-lg border border-warning/30 bg-warning/5 p-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">Simulating because: {selectedTrigger.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedTrigger.recommendedAction}</p>
              </div>
            </div>
            <button onClick={() => setSelectedTrigger(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Selection Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Select SKU</label>
            <Select value={selectedSKU} onValueChange={(v) => { setSelectedSKU(v); setSelectedMaterial(""); setSelectedSubstitute(""); setSimComplete(false); setMultiMetricResult(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {filteredSKUs.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Select RM/PM</label>
            <Select value={selectedMaterial} onValueChange={(v) => { setSelectedMaterial(v); setSelectedSubstitute(""); setSimComplete(false); setMultiMetricResult(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {skuMaterials.map(m => (
                  <SelectItem key={m.materialId} value={m.materialId}>
                    {m.material.id} — {m.material.name} ({m.compositionPct}%)
                  </SelectItem>
                ))}
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

      {/* Inline nudge */}
      {nudgeMessage && !selectedSubstitute && (
        <InlineNudge
          variant="opportunity"
          message={nudgeMessage}
          action="Select this substitute"
          onAction={() => bestSub && setSelectedSubstitute(bestSub.material.id)}
        />
      )}

      {/* Substitutes */}
      {currentMaterial && substitutes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Alternate RM/PM Options</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground"><Info className="h-3.5 w-3.5" /></button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-xs space-y-2">
                  <p className="font-semibold">Similarity Calculation</p>
                  <p className="font-mono text-[10px] bg-muted p-2 rounded">Score = Σ(wᵢ × |attr₁ᵢ - attr₂ᵢ| / rangeᵢ)</p>
                  <p>Weights: Viscosity (20%), Density (20%), pH (25%), Performance (35%)</p>
                </PopoverContent>
              </Popover>
            </div>
            <span className="text-xs text-muted-foreground">{substitutes.length} compatible materials found</span>
          </div>
          <div className="space-y-2">
            {substitutes.map(sub => (
              <button
                key={sub.material.id}
                onClick={() => { setSelectedSubstitute(sub.material.id); setSimComplete(false); setMultiMetricResult(null); }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSubstitute === sub.material.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{sub.material.name}</span>
                    <span className="text-xs text-muted-foreground">{sub.material.id} • {sub.supplier.name} ({sub.supplier.country})</span>
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
                Run Simulation
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={monteCarloEnabled} onCheckedChange={setMonteCarloEnabled} />
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Multi-Metric Monte Carlo</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {simComplete && costSim && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Nudges */}
            {costSim.savings > 0 && selectedSub && selectedSub.riskScore < 3 && (
              <InlineNudge variant="opportunity" message={`This substitution saves ${formatCurrency(costSim.savings)} annually with only ${selectedSub.riskScore}% risk. Consider fast-tracking through procurement approval.`} />
            )}
            {costSim.savings < 0 && (
              <InlineNudge variant="warning" message={`Despite lower material cost, increased logistics costs result in net margin erosion of ${formatCurrency(Math.abs(costSim.savings))}. Consider regional sourcing alternatives.`} />
            )}

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
                <h3 className="text-sm font-semibold mb-3">Cost Breakdown — Current vs Substitute</h3>
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

              <div className="kpi-card">
                <h3 className="text-sm font-semibold mb-3">Cost Impact Waterfall</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={waterfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => formatCurrency(Math.abs(v))} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ===== MULTI-METRIC MONTE CARLO ===== */}
            {monteCarloEnabled && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Multi-Metric Monte Carlo</h3>
                    <Badge variant="outline" className="text-[10px]">5,000 iterations × 6 metrics</Badge>
                    {selectedTrigger && (
                      <Badge className={`text-[9px] ${severityColors[selectedTrigger.severity]}`}>
                        {selectedTrigger.severity} scenario
                      </Badge>
                    )}
                  </div>
                  {mcRunning && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground font-mono">{mcProgress}%</span>
                    </div>
                  )}
                  {!mcRunning && multiMetricResult && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">Complete</Badge>}
                </div>

                {multiMetricResult ? (
                  <div className="space-y-4">
                    {/* Metric tabs */}
                    <Tabs value={activeMetricTab} onValueChange={v => setActiveMetricTab(v as MetricKey)}>
                      <TabsList className="w-full grid grid-cols-6 h-auto">
                        {(Object.keys(metricLabels) as MetricKey[]).map(mk => {
                          const MIcon = metricIcons[mk];
                          return (
                            <TabsTrigger key={mk} value={mk} className="text-[10px] gap-1 py-1.5 px-1">
                              <MIcon className="h-3 w-3" />
                              <span className="hidden lg:inline">{metricLabels[mk].label}</span>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {(Object.keys(metricLabels) as MetricKey[]).map(mk => {
                        const dist = multiMetricResult[mk];
                        const meta = metricLabels[mk];
                        return (
                          <TabsContent key={mk} value={mk} className="space-y-4">
                            {/* Distribution chart */}
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={dist.bins}>
                                <defs>
                                  <linearGradient id={`mcGrad-${mk}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(213, 62%, 44%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(213, 62%, 44%)" stopOpacity={0.02} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                                <XAxis dataKey="bin" tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" interval={Math.floor(dist.bins.length / 6)} />
                                <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                <Area type="monotone" dataKey="count" stroke="hsl(213, 62%, 44%)" fill={`url(#mcGrad-${mk})`} strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>

                            {/* P5 / P50 / P95 stats */}
                            <div className="grid grid-cols-4 gap-3">
                              {[
                                { label: "P5 (Best)", value: `${dist.p5}${meta.unit}`, color: meta.higher === "better" ? "text-accent" : "text-destructive" },
                                { label: "P50 (Median)", value: `${dist.p50}${meta.unit}`, color: "text-foreground" },
                                { label: "P95 (Worst)", value: `${dist.p95}${meta.unit}`, color: meta.higher === "better" ? "text-destructive" : "text-accent" },
                                { label: "Mean", value: `${dist.mean}${meta.unit}`, color: "text-foreground" },
                              ].map(s => (
                                <div key={s.label} className="p-2.5 rounded-lg bg-muted/50 text-center">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                                  <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        );
                      })}
                    </Tabs>

                    {/* Radar summary */}
                    <div className="border-t border-border/50 pt-4">
                      <h4 className="text-xs font-semibold mb-3">P50 Metric Summary (Radar)</h4>
                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={(() => {
                          const metrics: MetricKey[] = ["serviceLevel", "margin", "inventoryTurnover", "profitability", "timeToMake", "leadTime"];
                          return metrics.map(mk => {
                            const val = multiMetricResult[mk].p50;
                            let normalized: number;
                            if (mk === "serviceLevel") normalized = val;
                            else if (mk === "margin") normalized = val * 2;
                            else if (mk === "inventoryTurnover") normalized = Math.max(0, 100 - val * 1.5);
                            else if (mk === "profitability") normalized = Math.min(100, val / 50);
                            else if (mk === "timeToMake") normalized = Math.max(0, 100 - val * 10);
                            else normalized = Math.max(0, 100 - val * 2);
                            return { metric: metricLabels[mk].label, value: +normalized.toFixed(1), raw: `${val} ${metricLabels[mk].unit}` };
                          });
                        })()}>
                          <PolarGrid stroke="hsl(214, 20%, 90%)" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
                          <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" domain={[0, 100]} />
                          <Radar name="Current Simulation" dataKey="value" stroke="hsl(213, 62%, 44%)" fill="hsl(213, 62%, 44%)" fillOpacity={0.2} strokeWidth={2} />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== SAVE & COMPARE ===== */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3">
              {multiMetricResult && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setScenarioName(""); setSaveDialogOpen(true); }}>
                  <Save className="h-3.5 w-3.5" />
                  Save Scenario
                </Button>
              )}
              {savedScenarios.length >= 2 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCompareOpen(true)}>
                  <GitCompare className="h-3.5 w-3.5" />
                  Compare Scenarios ({savedScenarios.length})
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Save Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="e.g. LAS→AOS swap under commodity surge"
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              className="text-sm"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>SKU:</strong> {sku.id} — {sku.name}</p>
              <p><strong>Material:</strong> {currentMaterial?.name} → {selectedSub?.material.name}</p>
              {selectedTrigger && <p><strong>Trigger:</strong> {selectedTrigger.title}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!scenarioName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Panel */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Compare Saved Scenarios</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Scenario list */}
            <div className="space-y-2">
              {savedScenarios.map(s => {
                const isChecked = compareIds.includes(s.id);
                return (
                  <div key={s.id} className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${isChecked ? "border-primary bg-primary/5" : "border-border"}`}>
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleCompareId(s.id)} className="rounded border-input" />
                      <div>
                        <p className="text-xs font-semibold">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s.skuId} • {materialMaster.find(m => m.id === s.materialId)?.name} → {materialMaster.find(m => m.id === s.substituteId)?.name}
                          {s.triggerTitle && ` • ${s.triggerTitle}`}
                        </p>
                      </div>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${s.costSim.savings > 0 ? "text-accent" : "text-destructive"}`}>
                        {s.costSim.savings > 0 ? "+" : ""}{formatCurrency(s.costSim.savings)}
                      </span>
                      <button onClick={() => deleteSaved(s.id)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            {compareIds.length >= 2 && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                        {savedScenarios.filter(s => compareIds.includes(s.id)).map(s => (
                          <th key={s.id} className="text-center py-2 font-semibold">{s.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">Annual Savings</td>
                        {savedScenarios.filter(s => compareIds.includes(s.id)).map(s => (
                          <td key={s.id} className={`text-center py-2 font-bold ${s.costSim.savings > 0 ? "text-accent" : "text-destructive"}`}>
                            {formatCurrency(s.costSim.savings)}
                          </td>
                        ))}
                      </tr>
                      {(Object.keys(metricLabels) as MetricKey[]).map(mk => (
                        <tr key={mk} className="border-b border-border/50">
                          <td className="py-2 text-muted-foreground">{metricLabels[mk].label} (P50)</td>
                          {savedScenarios.filter(s => compareIds.includes(s.id)).map(s => (
                            <td key={s.id} className="text-center py-2 font-medium">
                              {s.multiMetric[mk].p50}{metricLabels[mk].unit}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Radar overlay */}
                <div>
                  <h4 className="text-xs font-semibold mb-2">Radar Comparison</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={compareRadarData}>
                      <PolarGrid stroke="hsl(214, 20%, 90%)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
                      <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" domain={[0, 100]} />
                      {savedScenarios.filter(s => compareIds.includes(s.id)).map((s, idx) => (
                        <Radar key={s.id} name={s.name} dataKey={s.name} stroke={radarColors[idx % radarColors.length]} fill={radarColors[idx % radarColors.length]} fillOpacity={0.1} strokeWidth={2} />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {compareIds.length < 2 && compareIds.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">Select at least 2 scenarios to compare</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default SimulationEngine;
