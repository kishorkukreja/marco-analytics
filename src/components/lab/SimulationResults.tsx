import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BrainCircuit, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { materialMaster, categoryThresholds, type SimulatedProperties, type LabBOMEntry } from "@/data/mockData";

interface SimulationResultsProps {
  recipeResults: { properties: SimulatedProperties; verdict: string; details: Record<string, string> };
  rdResults: { properties: SimulatedProperties; verdict: string; details: Record<string, string> };
  recipeCost: number;
  rdCost: number;
  category: string;
  rdBom: LabBOMEntry[];
  recipeBom: LabBOMEntry[];
}

const propertyLabels: Record<keyof SimulatedProperties, { label: string; unit: string; description: string }> = {
  pH: { label: "pH Level", unit: "", description: "Acidity/alkalinity balance" },
  viscosity: { label: "Viscosity", unit: " cP", description: "Flow resistance" },
  density: { label: "Density", unit: " g/cm³", description: "Mass per unit volume" },
  foamIndex: { label: "Foam Index", unit: "/100", description: "Foaming performance" },
  textureScore: { label: "Texture Score", unit: "/100", description: "Tactile quality" },
  consistencyRating: { label: "Consistency", unit: "/100", description: "Batch uniformity" },
};

function generateInsights(
  recipeProps: SimulatedProperties,
  rdProps: SimulatedProperties,
  recipeCost: number,
  rdCost: number,
  category: string,
  rdBom: LabBOMEntry[],
  recipeBom: LabBOMEntry[],
): string[] {
  const insights: string[] = [];
  const thresholds = categoryThresholds[category] || categoryThresholds["Laundry"];

  // Cost analysis
  const costDelta = rdCost - recipeCost;
  const costDeltaPct = recipeCost > 0 ? (costDelta / recipeCost) * 100 : 0;
  if (Math.abs(costDeltaPct) > 0.5) {
    insights.push(
      costDelta < 0
        ? `Cost reduction of ${Math.abs(costDeltaPct).toFixed(1)}% ($${Math.abs(costDelta).toFixed(3)}/unit) — formulation is more economical than recipe.`
        : `Cost increase of ${costDeltaPct.toFixed(1)}% ($${costDelta.toFixed(3)}/unit) — evaluate whether property improvements justify the premium.`
    );
  }

  // pH insight
  const pHDelta = rdProps.pH - recipeProps.pH;
  const [pHLo, pHHi] = thresholds.pH;
  if (Math.abs(pHDelta) > 0.3) {
    insights.push(`pH shifted ${pHDelta > 0 ? "up" : "down"} by ${Math.abs(pHDelta).toFixed(2)} (${recipeProps.pH} → ${rdProps.pH}). ${category} typical range: ${pHLo}–${pHHi}. ${rdProps.pH < pHLo || rdProps.pH > pHHi ? "Current value falls outside typical range — consider pH adjuster." : "Within expected range."}`);
  }

  // Viscosity insight
  const viscDelta = rdProps.viscosity - recipeProps.viscosity;
  if (Math.abs(viscDelta) > 2) {
    const [vLo, vHi] = thresholds.viscosity;
    insights.push(`Viscosity changed by ${viscDelta > 0 ? "+" : ""}${viscDelta.toFixed(1)} cP. ${category} range: ${vLo}–${vHi} cP. ${rdProps.viscosity < vLo ? "Below typical — may feel thin or watery." : rdProps.viscosity > vHi ? "Above typical — may affect pourability or dispensing." : "Sits within expected range for this category."}`);
  }

  // Foam insight
  const foamDelta = rdProps.foamIndex - recipeProps.foamIndex;
  if (Math.abs(foamDelta) > 3) {
    insights.push(`Foam index ${foamDelta > 0 ? "improved" : "decreased"} by ${Math.abs(foamDelta).toFixed(1)} points. ${foamDelta < -10 ? "Significant foam reduction — check surfactant concentration." : foamDelta > 10 ? "Notably higher foaming — verify consumer acceptability." : "Moderate change."}`);
  }

  // Material swap detection
  const swappedIn = rdBom.filter(r => !recipeBom.find(b => b.materialId === r.materialId));
  const swappedOut = recipeBom.filter(b => !rdBom.find(r => r.materialId === b.materialId));
  if (swappedIn.length > 0) {
    const names = swappedIn.map(e => materialMaster.find(m => m.id === e.materialId)?.name || e.materialId).join(", ");
    insights.push(`New materials introduced: ${names}. Monitor for interaction effects with existing ingredients.`);
  }
  if (swappedOut.length > 0) {
    const names = swappedOut.map(e => materialMaster.find(m => m.id === e.materialId)?.name || e.materialId).join(", ");
    insights.push(`Removed from recipe: ${names}. Verify their functional role is covered by remaining materials.`);
  }

  // Composition balance
  const totalPct = rdBom.reduce((s, e) => s + e.compositionPct, 0);
  if (totalPct < 30) {
    insights.push(`Active material composition is only ${totalPct}% — high water/filler ratio. Performance may be diluted.`);
  }

  // Texture + consistency combined
  const texDelta = rdProps.textureScore - recipeProps.textureScore;
  const conDelta = rdProps.consistencyRating - recipeProps.consistencyRating;
  if (Math.abs(texDelta) > 5 || Math.abs(conDelta) > 5) {
    insights.push(`Texture ${texDelta > 0 ? "improved" : "shifted"} by ${texDelta.toFixed(1)}pts, consistency by ${conDelta > 0 ? "+" : ""}${conDelta.toFixed(1)}pts. ${Math.abs(texDelta) > 15 || Math.abs(conDelta) > 15 ? "Substantial sensory change — recommend panel testing." : "Moderate shift — within reformulation tolerance."}`);
  }

  // Density
  const denDelta = rdProps.density - recipeProps.density;
  if (Math.abs(denDelta) > 0.05) {
    insights.push(`Density changed by ${denDelta > 0 ? "+" : ""}${denDelta.toFixed(3)} g/cm³. ${Math.abs(denDelta) > 0.1 ? "May affect packaging fill volumes and labeling." : "Minor — unlikely to impact packaging."}`);
  }

  if (insights.length === 0) {
    insights.push("Formulation properties are closely aligned with the current recipe. No significant deviations detected.");
  }

  return insights;
}

export function SimulationResults({ recipeResults, rdResults, recipeCost, rdCost, category, rdBom, recipeBom }: SimulationResultsProps) {
  const costDelta = rdCost - recipeCost;
  const costDeltaPct = recipeCost > 0 ? ((costDelta / recipeCost) * 100).toFixed(1) : "0";
  const insights = generateInsights(recipeResults.properties, rdResults.properties, recipeCost, rdCost, category, rdBom, recipeBom);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header - neutral cost summary */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          {Object.keys(propertyLabels).length} Properties Analyzed
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Cost Δ:</span>
          <Badge variant="outline" className="font-mono text-xs">
            {costDelta === 0 ? "—" : `${costDelta > 0 ? "+" : ""}${costDelta.toFixed(3)}/unit (${costDeltaPct}%)`}
          </Badge>
        </div>
      </div>

      {/* Property Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(Object.keys(propertyLabels) as (keyof SimulatedProperties)[]).map((key) => {
          const { label, unit, description } = propertyLabels[key];
          const recipeVal = recipeResults.properties[key];
          const rdVal = rdResults.properties[key];
          const delta = rdVal - recipeVal;
          const maxVal = Math.max(recipeVal, rdVal, 1);

          return (
            <div key={key} className="rounded-lg border p-3 bg-card">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
                {delta !== 0 && (
                  <div className="flex items-center gap-0.5">
                    {delta > 0 ? <ArrowUp className="h-2.5 w-2.5 text-muted-foreground" /> : <ArrowDown className="h-2.5 w-2.5 text-muted-foreground" />}
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                    </span>
                  </div>
                )}
                {delta === 0 && <Minus className="h-2.5 w-2.5 text-muted-foreground/40" />}
              </div>
              <p className="text-[8px] text-muted-foreground/60 mb-2">{description}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Recipe</p>
                  <p className="text-sm font-mono font-medium text-foreground">{recipeVal}{unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">R&D</p>
                  <p className="text-sm font-mono font-bold text-foreground">{rdVal}{unit}</p>
                </div>
              </div>
              {/* Neutral comparison bars */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] text-muted-foreground w-6">RCP</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/40" style={{ width: `${Math.min(100, (recipeVal / (maxVal * 1.2)) * 100)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] text-muted-foreground w-6">R&D</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (rdVal / (maxVal * 1.2)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost Comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 bg-card">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Recipe Cost</p>
          <p className="text-lg font-mono font-bold text-foreground">${recipeCost.toFixed(3)}<span className="text-xs text-muted-foreground">/unit</span></p>
        </div>
        <div className="rounded-lg border p-3 bg-card">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">R&D Cost</p>
          <p className="text-lg font-mono font-bold text-foreground">
            ${rdCost.toFixed(3)}<span className="text-xs text-muted-foreground">/unit</span>
          </p>
        </div>
      </div>

      {/* AI Agent Insights */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="h-3.5 w-3.5 text-primary" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">Experiment Insights</h4>
          <Badge variant="outline" className="text-[8px] ml-auto">Agent Analysis</Badge>
        </div>
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2"
            >
              <span className="text-[9px] font-mono text-primary/60 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
