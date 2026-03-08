import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Play, Save, RotateCcw, Beaker, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeBOM } from "@/components/lab/RecipeBOM";
import { RnDBOM } from "@/components/lab/RnDBOM";
import { SimulationResults } from "@/components/lab/SimulationResults";
import { ExperimentHistory } from "@/components/lab/ExperimentHistory";
import { SubstitutionRecommender } from "@/components/lab/SubstitutionRecommender";
import {
  skuMaster,
  getRecipeBOM,
  getBOMCost,
  simulateFormulation,
  type LabBOMEntry,
  type SavedExperiment,
} from "@/data/mockData";

const STORAGE_KEY = "lab-experiments";

function loadExperiments(): SavedExperiment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveExperimentsToStorage(exps: SavedExperiment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exps));
}

export default function LabIntelligence() {
  const [selectedSku, setSelectedSku] = useState(skuMaster[0].id);
  const [recipeBom, setRecipeBom] = useState<LabBOMEntry[]>([]);
  const [rdBom, setRdBom] = useState<LabBOMEntry[]>([]);
  const [simRan, setSimRan] = useState(false);
  const [expName, setExpName] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [experiments, setExperiments] = useState<SavedExperiment[]>(loadExperiments);

  const sku = skuMaster.find(s => s.id === selectedSku)!;
  const category = sku.category;

  useEffect(() => {
    const recipe = getRecipeBOM(selectedSku);
    setRecipeBom(recipe);
    setRdBom(recipe.map(e => ({ ...e })));
    setSimRan(false);
  }, [selectedSku]);

  const recipeCost = getBOMCost(recipeBom);
  const rdCost = getBOMCost(rdBom);
  const recipeResults = simulateFormulation(recipeBom, category);
  const rdResults = simulateFormulation(rdBom, category);
  const totalRdPct = rdBom.reduce((s, e) => s + e.compositionPct, 0);

  const runSimulation = () => setSimRan(true);

  const resetRdBom = () => {
    setRdBom(recipeBom.map(e => ({ ...e })));
    setSimRan(false);
  };

  const saveExperiment = () => {
    if (!expName.trim()) return;
    const exp: SavedExperiment = {
      id: `EXP-${Date.now()}`,
      name: expName.trim(),
      skuId: selectedSku,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      rdBom: [...rdBom],
      results: rdResults,
      recipeCost,
      rdCost,
      notes: expNotes.trim(),
    };
    const updated = [exp, ...experiments];
    setExperiments(updated);
    saveExperimentsToStorage(updated);
    setExpName("");
    setExpNotes("");
  };

  const updateExperimentNotes = (id: string, notes: string) => {
    const updated = experiments.map(e => e.id === id ? { ...e, notes } : e);
    setExperiments(updated);
    saveExperimentsToStorage(updated);
  };

  const loadExperiment = (exp: SavedExperiment) => {
    setSelectedSku(exp.skuId);
    setExpNotes(exp.notes || "");
    setTimeout(() => {
      setRdBom(exp.rdBom.map(e => ({ ...e })));
      setSimRan(true);
    }, 50);
  };

  const deleteExperiment = (id: string) => {
    const updated = experiments.filter(e => e.id !== id);
    setExperiments(updated);
    saveExperimentsToStorage(updated);
  };

  const applySubstitution = (originalId: string, substituteId: string) => {
    const updated = rdBom.map(e =>
      e.materialId === originalId ? { ...e, materialId: substituteId } : e
    );
    setRdBom(updated);
    setSimRan(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg enterprise-gradient flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Lab Intelligence</h1>
            <p className="text-xs text-muted-foreground">Formulation R&D · Recipe vs Experimental BOM · Property Simulation</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          {experiments.length} Saved Experiments
        </Badge>
      </motion.div>

      {/* SKU Selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Select SKU</label>
              <Select value={selectedSku} onValueChange={setSelectedSku}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skuMaster.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="text-xs">{s.id} — {s.name} ({s.category})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Badge variant="outline" className="text-[9px]">{sku.category}</Badge>
              <Badge variant="outline" className="text-[9px]">{sku.region}</Badge>
              <Badge variant="outline" className="text-[9px]">{sku.packSize}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Substitution Recommender */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Substitution Recommendations
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">AI-ranked alternatives based on similarity scores, cost savings, and supplier reliability</p>
        </CardHeader>
        <CardContent>
          <SubstitutionRecommender recipeBom={recipeBom} onApply={applySubstitution} />
        </CardContent>
      </Card>

      {/* Two-Panel BOM View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <RecipeBOM bomEntries={recipeBom} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <RnDBOM bomEntries={rdBom} recipeBom={recipeBom} onChange={(entries) => { setRdBom(entries); setSimRan(false); }} />
          </CardContent>
        </Card>
      </div>

      {/* Simulation Controls */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex items-center gap-3">
          <Button onClick={runSimulation} disabled={totalRdPct > 100} className="gap-2">
            <Play className="h-4 w-4" />
            Run Simulation
          </Button>
          <Button variant="outline" onClick={resetRdBom} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Recipe
          </Button>
        </div>
        <div className="ml-auto flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Experiment name..."
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="h-9 w-48 text-xs"
            />
            <Button variant="secondary" onClick={saveExperiment} disabled={!simRan || !expName.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
          <Textarea
            placeholder="Hypothesis, observations, notes..."
            value={expNotes}
            onChange={(e) => setExpNotes(e.target.value)}
            className="w-full min-w-[320px] text-xs h-16 resize-none"
          />
        </div>
      </div>

      {/* Simulation Results */}
      {simRan && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Beaker className="h-4 w-4 text-primary" />
              Simulation Results — {sku.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimulationResults
              recipeResults={recipeResults}
              rdResults={rdResults}
              recipeCost={recipeCost}
              rdCost={rdCost}
            />
          </CardContent>
        </Card>
      )}

      {/* Experiment History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Experiment History</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperimentHistory
            experiments={experiments}
            onLoad={loadExperiment}
            onDelete={deleteExperiment}
            onUpdateNotes={updateExperimentNotes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
