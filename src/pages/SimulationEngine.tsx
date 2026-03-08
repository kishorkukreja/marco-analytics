import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, AlertTriangle, CheckCircle2, Info, Zap, Activity, TrendingUp,
  DollarSign, Target, Leaf, BarChart3, Store, Ship, Save, GitCompare, X, Clock,
  Percent, Boxes, Factory, ChevronRight, Settings2, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Cell, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";

const scenarioIcons: Record<string, React.ElementType> = {
  TrendingUp, AlertTriangle, DollarSign, Target, Leaf, BarChart3, Store, Ship,
};

const categoryLabels: Record<ScenarioCategory | "all", string> = {
  all: "All",
  macroeconomic: "Macro",
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

function normalizeMetric(mk: MetricKey, val: number): number {
  if (mk === "serviceLevel") return val;
  if (mk === "margin") return val * 2;
  if (mk === "inventoryTurnover") return Math.max(0, 100 - val * 1.5);
  if (mk === "profitability") return Math.min(100, val / 50);
  if (mk === "timeToMake") return Math.max(0, 100 - val * 10);
  return Math.max(0, 100 - val * 2);
}

const SimulationEngine = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);

  const initialSKU = searchParams.get("sku") || skuMaster[0].id;
  const initialTrigger = searchParams.get("trigger") || null;

  const [selectedSKU, setSelectedSKU] = useState(initialSKU);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedSubstitute, setSelectedSubstitute] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simComplete, setSimComplete] = useState(false);
  const [monteCarloEnabled, setMonteCarloEnabled] = useState(false);

  // Scenario state
  const [scenarioFilter, setScenarioFilter] = useState<ScenarioCategory | "all">("all");
  const [selectedTrigger, setSelectedTrigger] = useState<ScenarioTrigger | null>(
    initialTrigger ? scenarioTriggers.find(t => t.id === initialTrigger) || null : null
  );

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

  // Left panel active section
  const [leftTab, setLeftTab] = useState<"scenarios" | "config">("scenarios");

  const sku = skuMaster.find(s => s.id === selectedSKU)!;
  const skuMaterials = bomTable.filter(b => b.skuId === selectedSKU).map(b => ({
    ...b,
    material: materialMaster.find(m => m.id === b.materialId)!,
  }));

  // Auto-select trigger from URL on mount
  useEffect(() => {
    if (initialTrigger) {
      const trigger = scenarioTriggers.find(t => t.id === initialTrigger);
      if (trigger) {
        setSelectedTrigger(trigger);
        if (trigger.affectedSKUs.length > 0) {
          const skuId = trigger.affectedSKUs.includes(initialSKU) ? initialSKU : trigger.affectedSKUs[0];
          setSelectedSKU(skuId);
          setTimeout(() => {
            const mats = bomTable.filter(b => b.skuId === skuId);
            const affected = mats.find(b => trigger.affectedMaterials.includes(b.materialId));
            if (affected) setSelectedMaterial(affected.materialId);
            else if (mats.length > 0) setSelectedMaterial(mats[0].materialId);
          }, 50);
        }
      }
    }
  }, []);

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

  const filteredTriggers = useMemo(() =>
    scenarioFilter === "all" ? scenarioTriggers : scenarioTriggers.filter(t => t.category === scenarioFilter),
    [scenarioFilter]
  );

  const selectTrigger = (trigger: ScenarioTrigger) => {
    setSelectedTrigger(trigger);
    if (trigger.affectedSKUs.length > 0) {
      const skuId = trigger.affectedSKUs[0];
      setSelectedSKU(skuId);
      setSelectedMaterial("");
      setSelectedSubstitute("");
      setSimComplete(false);
      setMultiMetricResult(null);
      setTimeout(() => {
        const mats = bomTable.filter(b => b.skuId === skuId);
        const affected = mats.find(b => trigger.affectedMaterials.includes(b.materialId));
        if (affected) setSelectedMaterial(affected.materialId);
        else if (mats.length > 0) setSelectedMaterial(mats[0].materialId);
      }, 50);
    }
    setLeftTab("config");
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

  const compareRadarData = useMemo(() => {
    const selected = savedScenarios.filter(s => compareIds.includes(s.id));
    if (selected.length === 0) return [];
    const metrics: MetricKey[] = ["serviceLevel", "margin", "inventoryTurnover", "profitability", "timeToMake", "leadTime"];
    return metrics.map(mk => {
      const row: Record<string, string | number> = { metric: metricLabels[mk].label };
      selected.forEach(s => {
        row[s.name] = +normalizeMetric(mk, s.multiMetric[mk].p50).toFixed(1);
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

  const canRun = !!selectedSub;
  const hasResults = simComplete && costSim;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulation Engine</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Scenario-driven simulation with multi-metric Monte Carlo</p>
        </div>
        <div className="flex items-center gap-2">
          {savedScenarios.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setCompareOpen(true)}>
              <GitCompare className="h-3.5 w-3.5" />
              Compare ({savedScenarios.length})
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card !p-3">
        <GlobalFilters filters={filters} onChange={setFilters} />
      </motion.div>

      {/* ===== SPLIT LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ===== LEFT PANEL — Settings ===== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3">

          {/* Left panel tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setLeftTab("scenarios")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                leftTab === "scenarios" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Scenarios
            </button>
            <button
              onClick={() => setLeftTab("config")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                leftTab === "config" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings2 className="h-3 w-3" />
              Configure
            </button>
          </div>

          {/* Context Banner */}
          {selectedTrigger && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-warning/30 bg-warning/5 p-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{selectedTrigger.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{selectedTrigger.recommendedAction}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTrigger(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}

          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-2">
              <AnimatePresence mode="wait">
                {/* ===== SCENARIOS TAB ===== */}
                {leftTab === "scenarios" && (
                  <motion.div key="scenarios" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                    {/* Category filter pills */}
                    <div className="flex flex-wrap gap-1">
                      {(["all", "macroeconomic", "supply_chain", "strategic", "demand"] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setScenarioFilter(cat)}
                          className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                            scenarioFilter === cat
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {categoryLabels[cat]}
                        </button>
                      ))}
                    </div>

                    {/* Scenario cards */}
                    {filteredTriggers.map(trigger => {
                      const IconComp = scenarioIcons[trigger.icon] || AlertTriangle;
                      const isSelected = selectedTrigger?.id === trigger.id;
                      return (
                        <button
                          key={trigger.id}
                          onClick={() => selectTrigger(trigger)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border hover:border-primary/30 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <div className={`p-1.5 rounded-md ${categoryColors[trigger.category]}`}>
                              <IconComp className="h-3 w-3" />
                            </div>
                            <Badge className={`text-[8px] ${severityColors[trigger.severity]}`}>
                              {trigger.severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] font-semibold mb-0.5 line-clamp-1">{trigger.title}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{trigger.description}</p>
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground">{trigger.affectedSKUs.length} SKUs</span>
                            <span className="text-[9px] text-muted-foreground/40">•</span>
                            <span className="text-[9px] text-muted-foreground">{trigger.timestamp}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground/40 ml-auto" />
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {/* ===== CONFIG TAB ===== */}
                {leftTab === "config" && (
                  <motion.div key="config" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                    {/* SKU Select */}
                    <div className="kpi-card !p-3 space-y-3">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">SKU</label>
                        <Select value={selectedSKU} onValueChange={(v) => { setSelectedSKU(v); setSelectedMaterial(""); setSelectedSubstitute(""); setSimComplete(false); setMultiMetricResult(null); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {filteredSKUs.map(s => <SelectItem key={s.id} value={s.id}>{s.id} — {s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          <Badge variant="outline" className="text-[9px]">{sku.brand}</Badge>
                          <Badge variant="outline" className="text-[9px]">{sku.region}</Badge>
                          <Badge variant="outline" className="text-[9px]">{sku.channel}</Badge>
                          <Badge variant="outline" className="text-[9px]">Margin: {sku.currentMargin}%</Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Raw Material / Packaging</label>
                        <Select value={selectedMaterial} onValueChange={(v) => { setSelectedMaterial(v); setSelectedSubstitute(""); setSimComplete(false); setMultiMetricResult(null); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {skuMaterials.map(m => (
                              <SelectItem key={m.materialId} value={m.materialId}>
                                {m.material.name} ({m.compositionPct}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Substitutes */}
                    {currentMaterial && substitutes.length > 0 && (
                      <div className="kpi-card !p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-[11px] font-semibold">Alternate Materials</h3>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground"><Info className="h-3 w-3" /></button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72 text-xs space-y-2">
                                <p className="font-semibold">Similarity Score</p>
                                <p className="font-mono text-[10px] bg-muted p-2 rounded">Score = Σ(wᵢ × |attr₁ᵢ - attr₂ᵢ| / rangeᵢ)</p>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{substitutes.length} found</span>
                        </div>
                        <div className="space-y-1.5">
                          {substitutes.map(sub => (
                            <button
                              key={sub.material.id}
                              onClick={() => { setSelectedSubstitute(sub.material.id); setSimComplete(false); setMultiMetricResult(null); }}
                              className={`w-full text-left p-2 rounded-md border transition-all text-[11px] ${
                                selectedSubstitute === sub.material.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-[11px]">{sub.material.name}</p>
                                  <p className="text-[9px] text-muted-foreground">{sub.supplier.name} • {sub.supplier.country}</p>
                                </div>
                                <div className="flex items-center gap-2.5 text-[10px]">
                                  <div className="text-center">
                                    <p className="font-bold text-primary">{sub.similarity}%</p>
                                    <p className="text-[8px] text-muted-foreground">Sim</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold">${sub.material.costPerKg.toFixed(2)}</p>
                                    <p className="text-[8px] text-muted-foreground">$/kg</p>
                                  </div>
                                  <div className="text-center">
                                    <p className={`font-bold ${sub.riskScore < 2 ? "text-accent" : sub.riskScore < 5 ? "text-warning" : "text-destructive"}`}>
                                      {sub.riskScore}%
                                    </p>
                                    <p className="text-[8px] text-muted-foreground">Risk</p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monte Carlo toggle */}
                    <div className="kpi-card !p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[11px] font-medium">Monte Carlo Analysis</span>
                        </div>
                        <Switch checked={monteCarloEnabled} onCheckedChange={setMonteCarloEnabled} />
                      </div>
                      {monteCarloEnabled && (
                        <p className="text-[9px] text-muted-foreground mt-1">5,000 iterations × 6 business metrics</p>
                      )}
                    </div>

                    {/* Run Button */}
                    <Button
                      onClick={runSimulation}
                      disabled={!canRun || isSimulating}
                      size="lg"
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                    >
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

                    {/* Save button (visible when we have results) */}
                    {hasResults && multiMetricResult && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs"
                        onClick={() => { setScenarioName(""); setSaveDialogOpen(true); }}
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save This Scenario
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* ===== RIGHT PANEL — Results ===== */}
        <div className="lg:col-span-7 xl:col-span-8">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-2">
              <AnimatePresence mode="wait">
                {!hasResults ? (
                  /* Empty state */
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[60vh] text-center"
                  >
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <LayoutDashboard className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-sm font-semibold text-muted-foreground">No Simulation Results Yet</h3>
                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                      Select a scenario trigger or configure SKU, material, and substitute on the left panel, then run the simulation.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Nudges */}
                    {costSim!.savings > 0 && selectedSub && selectedSub.riskScore < 3 && (
                      <InlineNudge variant="opportunity" message={`Saves ${formatCurrency(costSim!.savings)} annually with ${selectedSub.riskScore}% risk. Consider fast-tracking procurement.`} />
                    )}
                    {costSim!.savings < 0 && (
                      <InlineNudge variant="warning" message={`Net margin erosion of ${formatCurrency(Math.abs(costSim!.savings))} due to logistics. Consider regional alternatives.`} />
                    )}

                    {/* Summary KPIs */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="kpi-card !p-3 border-accent/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Annual Savings</p>
                        <p className={`text-xl font-bold ${costSim!.savings > 0 ? "text-accent" : "text-destructive"}`}>
                          {costSim!.savings > 0 ? "+" : ""}{formatCurrency(costSim!.savings)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{sku.annualVolume.toLocaleString()} units</p>
                      </div>
                      <div className="kpi-card !p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Margin Impact</p>
                        <p className={`text-xl font-bold ${costSim!.marginImpact > 0 ? "text-accent" : "text-destructive"}`}>
                          {costSim!.marginImpact > 0 ? "+" : ""}{costSim!.marginImpact}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Gross margin</p>
                      </div>
                      <div className={`kpi-card !p-3 ${selectedSub!.riskScore < 2 ? "border-accent/30" : selectedSub!.riskScore < 5 ? "border-warning/30" : "border-destructive/30"}`}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {selectedSub!.riskScore < 2 ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                          <p className="text-lg font-bold">{selectedSub!.riskScore}%</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{selectedSub!.riskScore < 2 ? "Low" : selectedSub!.riskScore < 5 ? "Medium" : "High"} Risk</p>
                      </div>
                    </div>

                    {/* Cost Breakdown + Waterfall */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="kpi-card !p-3">
                        <h3 className="text-[11px] font-semibold mb-2">Cost Breakdown</h3>
                        <div className="space-y-1.5">
                          {(["formulation", "freight", "duty", "warehouse", "manufacturing", "packaging"] as const).map(key => (
                            <div key={key} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                              <span className="text-[10px] capitalize text-muted-foreground">{key}</span>
                              <div className="flex items-center gap-3 text-[10px]">
                                <span className="w-16 text-right">{formatCurrency(costSim!.original[key])}</span>
                                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="w-16 text-right font-medium">{formatCurrency(costSim!.substitute[key])}</span>
                                <span className={`w-14 text-right font-bold ${costSim!.original[key] - costSim!.substitute[key] > 0 ? "text-accent" : costSim!.original[key] - costSim!.substitute[key] < 0 ? "text-destructive" : ""}`}>
                                  {costSim!.original[key] - costSim!.substitute[key] > 0 ? "+" : ""}{formatCurrency(costSim!.original[key] - costSim!.substitute[key])}
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-1.5 font-bold text-xs">
                            <span>Total Landed Cost</span>
                            <div className="flex items-center gap-3">
                              <span className="w-16 text-right">{formatCurrency(costSim!.original.total)}</span>
                              <ArrowRight className="h-2.5 w-2.5" />
                              <span className="w-16 text-right">{formatCurrency(costSim!.substitute.total)}</span>
                              <span className={`w-14 text-right ${costSim!.savings > 0 ? "text-accent" : "text-destructive"}`}>
                                {costSim!.savings > 0 ? "+" : ""}{formatCurrency(costSim!.savings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="kpi-card !p-3">
                        <h3 className="text-[11px] font-semibold mb-2">Cost Impact Waterfall</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={waterfallData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" />
                            <YAxis tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => formatCurrency(Math.abs(v))} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {waterfallData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* ===== MULTI-METRIC MONTE CARLO ===== */}
                    {monteCarloEnabled && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="kpi-card !p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-primary" />
                            <h3 className="text-[11px] font-semibold">Monte Carlo — Multi-Metric</h3>
                            {selectedTrigger && (
                              <Badge className={`text-[8px] ${severityColors[selectedTrigger.severity]}`}>
                                {selectedTrigger.severity}
                              </Badge>
                            )}
                          </div>
                          {mcRunning && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-2.5 w-2.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              <span className="text-[10px] text-muted-foreground font-mono">{mcProgress}%</span>
                            </div>
                          )}
                          {!mcRunning && multiMetricResult && <Badge className="bg-accent/10 text-accent border-accent/20 text-[9px]">Complete</Badge>}
                        </div>

                        {multiMetricResult ? (
                          <div className="space-y-4">
                            <Tabs value={activeMetricTab} onValueChange={v => setActiveMetricTab(v as MetricKey)}>
                              <TabsList className="w-full grid grid-cols-6 h-auto">
                                {(Object.keys(metricLabels) as MetricKey[]).map(mk => {
                                  const MIcon = metricIcons[mk];
                                  return (
                                    <TabsTrigger key={mk} value={mk} className="text-[9px] gap-1 py-1.5 px-0.5">
                                      <MIcon className="h-3 w-3" />
                                      <span className="hidden xl:inline">{metricLabels[mk].label}</span>
                                    </TabsTrigger>
                                  );
                                })}
                              </TabsList>

                              {(Object.keys(metricLabels) as MetricKey[]).map(mk => {
                                const dist = multiMetricResult[mk];
                                const meta = metricLabels[mk];
                                return (
                                  <TabsContent key={mk} value={mk} className="space-y-3">
                                    <ResponsiveContainer width="100%" height={180}>
                                      <AreaChart data={dist.bins}>
                                        <defs>
                                          <linearGradient id={`mcG-${mk}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(213, 62%, 44%)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(213, 62%, 44%)" stopOpacity={0.02} />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                                        <XAxis dataKey="bin" tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" interval={Math.floor(dist.bins.length / 5)} />
                                        <YAxis tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" />
                                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                                        <Area type="monotone" dataKey="count" stroke="hsl(213, 62%, 44%)" fill={`url(#mcG-${mk})`} strokeWidth={2} />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                    <div className="grid grid-cols-4 gap-2">
                                      {[
                                        { label: "P5", value: `${dist.p5}${meta.unit}`, color: meta.higher === "better" ? "text-accent" : "text-destructive" },
                                        { label: "P50", value: `${dist.p50}${meta.unit}`, color: "text-foreground" },
                                        { label: "P95", value: `${dist.p95}${meta.unit}`, color: meta.higher === "better" ? "text-destructive" : "text-accent" },
                                        { label: "Mean", value: `${dist.mean}${meta.unit}`, color: "text-foreground" },
                                      ].map(s => (
                                        <div key={s.label} className="p-2 rounded-md bg-muted/50 text-center">
                                          <p className="text-[9px] text-muted-foreground uppercase">{s.label}</p>
                                          <p className={`text-xs font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </TabsContent>
                                );
                              })}
                            </Tabs>

                            {/* Radar summary */}
                            <div className="border-t border-border/50 pt-3">
                              <h4 className="text-[10px] font-semibold mb-2 text-muted-foreground uppercase tracking-wider">P50 Radar Overview</h4>
                              <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={(() => {
                                  const metrics: MetricKey[] = ["serviceLevel", "margin", "inventoryTurnover", "profitability", "timeToMake", "leadTime"];
                                  return metrics.map(mk => ({
                                    metric: metricLabels[mk].label,
                                    value: +normalizeMetric(mk, multiMetricResult[mk].p50).toFixed(1),
                                    raw: `${multiMetricResult[mk].p50} ${metricLabels[mk].unit}`,
                                  }));
                                })()}>
                                  <PolarGrid stroke="hsl(214, 20%, 90%)" />
                                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} stroke="hsl(215, 16%, 47%)" />
                                  <PolarRadiusAxis tick={{ fontSize: 8 }} stroke="hsl(215, 16%, 47%)" domain={[0, 100]} />
                                  <Radar name="Simulation" dataKey="value" stroke="hsl(213, 62%, 44%)" fill="hsl(213, 62%, 44%)" fillOpacity={0.2} strokeWidth={2} />
                                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32">
                            <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>

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
            {savedScenarios.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No saved scenarios yet. Run a simulation with Monte Carlo enabled and save it.</p>
            ) : (
              <>
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

                {compareIds.length === 1 && (
                  <p className="text-xs text-muted-foreground text-center">Select at least 2 scenarios to compare</p>
                )}
              </>
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
