import { materialMaster, calculateSimilarity, supplierMaster, type LabBOMEntry } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Suggestion {
  originalId: string;
  originalName: string;
  substituteId: string;
  substituteName: string;
  substituteType: string;
  similarity: number;
  costDelta: number;
  costDeltaPct: number;
  originalCostPerKg: number;
  substituteCostPerKg: number;
}

interface SubstitutionRecommenderProps {
  recipeBom: LabBOMEntry[];
  onApply: (originalId: string, substituteId: string) => void;
}

export function SubstitutionRecommender({ recipeBom, onApply }: SubstitutionRecommenderProps) {
  const suggestions: Suggestion[] = [];
  const bomMatIds = recipeBom.map(e => e.materialId);

  recipeBom.forEach(entry => {
    const original = materialMaster.find(m => m.id === entry.materialId);
    if (!original) return;

    materialMaster
      .filter(m => m.id !== original.id && !bomMatIds.includes(m.id))
      .forEach(candidate => {
        const similarity = calculateSimilarity(original, candidate);
        if (similarity < 50) return; // Only show viable substitutes

        const costDelta = candidate.costPerKg - original.costPerKg;
        const costDeltaPct = (costDelta / original.costPerKg) * 100;

        suggestions.push({
          originalId: original.id,
          originalName: original.name.length > 30 ? original.name.slice(0, 28) + "…" : original.name,
          substituteId: candidate.id,
          substituteName: candidate.name.length > 30 ? candidate.name.slice(0, 28) + "…" : candidate.name,
          substituteType: candidate.type,
          similarity,
          costDelta,
          costDeltaPct,
          originalCostPerKg: original.costPerKg,
          substituteCostPerKg: candidate.costPerKg,
        });
      });
  });

  // Sort by best: highest similarity first, then lowest cost
  suggestions.sort((a, b) => {
    const scoreA = a.similarity * 0.6 + Math.max(0, -a.costDeltaPct) * 0.4;
    const scoreB = b.similarity * 0.6 + Math.max(0, -b.costDeltaPct) * 0.4;
    return scoreB - scoreA;
  });

  const top = suggestions.slice(0, 8);

  if (top.length === 0) {
    return (
      <div className="text-center py-6">
        <Lightbulb className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No viable substitutions found for current BOM materials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {top.map((s, i) => {
        const supplier = supplierMaster.find(sup =>
          materialMaster.find(m => m.id === s.substituteId)?.supplierId === sup.id
        );

        return (
          <motion.div
            key={`${s.originalId}-${s.substituteId}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
          >
            {/* Similarity badge */}
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              s.similarity >= 85 ? "bg-accent/10" : s.similarity >= 70 ? "bg-warning/10" : "bg-muted"
            }`}>
              <span className={`text-xs font-bold font-mono ${
                s.similarity >= 85 ? "text-accent" : s.similarity >= 70 ? "text-warning" : "text-muted-foreground"
              }`}>
                {s.similarity.toFixed(0)}%
              </span>
            </div>

            {/* Substitution detail */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium text-muted-foreground truncate">{s.originalName}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{s.substituteName}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[8px]">{s.substituteType}</Badge>
                {supplier && (
                  <span className="text-[9px] text-muted-foreground">{supplier.name} • {supplier.leadTimeDays}d</span>
                )}
              </div>
            </div>

            {/* Cost impact */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                {s.costDelta <= 0 ? (
                  <TrendingDown className="h-3 w-3 text-accent" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs font-mono font-bold ${s.costDelta <= 0 ? "text-accent" : "text-destructive"}`}>
                  {s.costDelta <= 0 ? "" : "+"}{s.costDeltaPct.toFixed(1)}%
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">
                ${s.originalCostPerKg.toFixed(2)} → ${s.substituteCostPerKg.toFixed(2)}/kg
              </span>
            </div>

            {/* Apply button */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] flex-shrink-0"
              onClick={() => onApply(s.originalId, s.substituteId)}
            >
              Apply
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
