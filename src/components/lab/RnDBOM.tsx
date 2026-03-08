import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { materialMaster, type LabBOMEntry } from "@/data/mockData";

interface RnDBOMProps {
  bomEntries: LabBOMEntry[];
  recipeBom: LabBOMEntry[];
  onChange: (entries: LabBOMEntry[]) => void;
}

export function RnDBOM({ bomEntries, recipeBom, onChange }: RnDBOMProps) {
  const totalPct = bomEntries.reduce((s, e) => s + e.compositionPct, 0);
  const waterPct = Math.max(0, 100 - totalPct);
  const usedIds = bomEntries.map(e => e.materialId);
  const availableMaterials = materialMaster.filter(m => !usedIds.includes(m.id));

  const updateEntry = (idx: number, updates: Partial<LabBOMEntry>) => {
    const next = [...bomEntries];
    next[idx] = { ...next[idx], ...updates };
    onChange(next);
  };

  const removeEntry = (idx: number) => {
    onChange(bomEntries.filter((_, i) => i !== idx));
  };

  const addEntry = (materialId: string) => {
    onChange([...bomEntries, { materialId, compositionPct: 5 }]);
  };

  const getDelta = (entry: LabBOMEntry) => {
    const recipe = recipeBom.find(r => r.materialId === entry.materialId);
    if (!recipe) return { pctDelta: entry.compositionPct, isNew: true };
    return { pctDelta: entry.compositionPct - recipe.compositionPct, isNew: false };
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">R&D BOM</h3>
        <Badge className="bg-accent/10 text-accent border-accent/20 text-[9px] uppercase tracking-wider">Experimental</Badge>
      </div>

      <Accordion type="multiple" className="space-y-1">
        {bomEntries.map((entry, idx) => {
          const mat = materialMaster.find(m => m.id === entry.materialId);
          if (!mat) return null;
          const { pctDelta, isNew } = getDelta(entry);
          const recipeCost = recipeBom.find(r => r.materialId === entry.materialId);
          const costContrib = mat.costPerKg * entry.compositionPct / 100;

          return (
            <AccordionItem key={`${entry.materialId}-${idx}`} value={`${entry.materialId}-${idx}`} className="border rounded-lg px-3 bg-accent/5 border-accent/20">
              <AccordionTrigger className="py-2.5 hover:no-underline">
                <div className="flex items-center gap-3 text-left flex-1">
                  <div className="h-7 w-7 rounded bg-accent/10 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-accent font-mono">{mat.id.slice(-3)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{mat.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{mat.type} • {entry.compositionPct}%</span>
                      {isNew ? (
                        <Badge className="bg-accent/10 text-accent text-[8px]">NEW</Badge>
                      ) : pctDelta !== 0 ? (
                        <Badge className={`text-[8px] ${pctDelta > 0 ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"}`}>
                          {pctDelta > 0 ? "+" : ""}{pctDelta}%
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Swap Material</label>
                      <Select value={entry.materialId} onValueChange={(val) => updateEntry(idx, { materialId: val })}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materialMaster.map(m => (
                            <SelectItem key={m.id} value={m.id} disabled={usedIds.includes(m.id) && m.id !== entry.materialId}>
                              <span className="text-xs">{m.name} ({m.type})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Composition %</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={entry.compositionPct}
                        onChange={(e) => updateEntry(idx, { compositionPct: Math.max(0, Math.min(100, Number(e.target.value))) })}
                        className="h-8 text-xs mt-1 font-mono"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 mt-4 text-destructive hover:text-destructive" onClick={() => removeEntry(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <DeltaCell label="Cost/kg" value={`$${mat.costPerKg.toFixed(2)}`} />
                    <DeltaCell label="Cost Contrib." value={`$${costContrib.toFixed(3)}/unit`} />
                    <DeltaCell label="pH" value={mat.pH.toFixed(1)} />
                    <DeltaCell label="Viscosity" value={`${mat.viscosity} cP`} />
                    <DeltaCell label="Density" value={`${mat.density} g/cm³`} />
                    <DeltaCell label="Perf. Index" value={`${mat.performanceIndex}/100`} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {waterPct > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-dashed">
          <span className="text-[10px] text-muted-foreground">Water / Filler (balance)</span>
          <span className="text-xs font-mono font-medium text-muted-foreground">{waterPct}%</span>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 border-t mt-2">
        <span className="text-xs font-medium text-foreground">Total Active Materials</span>
        <span className={`text-xs font-mono font-bold ${totalPct > 100 ? "text-destructive" : "text-foreground"}`}>{totalPct}%</span>
      </div>

      {totalPct > 100 && (
        <p className="text-[10px] text-destructive px-3">⚠ Total exceeds 100% — adjust composition before simulating.</p>
      )}

      {availableMaterials.length > 0 && (
        <div className="pt-2">
          <Select onValueChange={addEntry}>
            <SelectTrigger className="h-8 text-xs border-dashed">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Plus className="h-3 w-3" />
                <span>Add Material</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableMaterials.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="text-xs">{m.name} ({m.type}) — ${m.costPerKg.toFixed(2)}/kg</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function DeltaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-medium text-foreground font-mono">{value}</p>
    </div>
  );
}
