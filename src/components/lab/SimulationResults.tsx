import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { SimulatedProperties } from "@/data/mockData";

interface SimulationResultsProps {
  recipeResults: { properties: SimulatedProperties; verdict: string; details: Record<string, string> };
  rdResults: { properties: SimulatedProperties; verdict: string; details: Record<string, string> };
  recipeCost: number;
  rdCost: number;
}

const propertyLabels: Record<keyof SimulatedProperties, { label: string; unit: string }> = {
  pH: { label: "pH Level", unit: "" },
  viscosity: { label: "Viscosity", unit: "cP" },
  density: { label: "Density", unit: "g/cm³" },
  foamIndex: { label: "Foam Index", unit: "/100" },
  textureScore: { label: "Texture Score", unit: "/100" },
  consistencyRating: { label: "Consistency", unit: "/100" },
};

const verdictStyle: Record<string, string> = {
  Pass: "bg-accent/10 text-accent border-accent/30",
  Review: "bg-warning/10 text-warning border-warning/30",
  Fail: "bg-destructive/10 text-destructive border-destructive/30",
};

const detailStyle: Record<string, string> = {
  pass: "text-accent",
  review: "text-warning",
  fail: "text-destructive",
};

export function SimulationResults({ recipeResults, rdResults, recipeCost, rdCost }: SimulationResultsProps) {
  const costDelta = rdCost - recipeCost;
  const costDeltaPct = recipeCost > 0 ? ((costDelta / recipeCost) * 100).toFixed(1) : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Verdict Header */}
      <div className="flex items-center gap-3">
        <Badge className={`text-sm px-3 py-1 ${verdictStyle[rdResults.verdict]}`}>
          {rdResults.verdict === "Pass" ? "✓" : rdResults.verdict === "Fail" ? "✗" : "⚠"} {rdResults.verdict}
        </Badge>
        <span className="text-xs text-muted-foreground">
          R&D formulation quality verdict
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Cost Δ:</span>
          <Badge variant="outline" className={`font-mono text-xs ${costDelta <= 0 ? "text-accent" : "text-destructive"}`}>
            {costDelta <= 0 ? "" : "+"}{costDelta.toFixed(3)}/unit ({costDeltaPct}%)
          </Badge>
        </div>
      </div>

      {/* Property Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(Object.keys(propertyLabels) as (keyof SimulatedProperties)[]).map((key) => {
          const { label, unit } = propertyLabels[key];
          const recipeVal = recipeResults.properties[key];
          const rdVal = rdResults.properties[key];
          const delta = rdVal - recipeVal;
          const rdStatus = rdResults.details[key] || "pass";

          return (
            <div key={key} className="rounded-lg border p-3 bg-card">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Recipe</p>
                  <p className="text-sm font-mono font-medium text-foreground">{recipeVal}{unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">R&D</p>
                  <p className={`text-sm font-mono font-bold ${detailStyle[rdStatus]}`}>{rdVal}{unit}</p>
                </div>
              </div>
              {delta !== 0 && (
                <div className="mt-1.5 flex items-center justify-end gap-1">
                  <span className={`text-[10px] font-mono ${delta > 0 ? "text-warning" : "text-accent"}`}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                  </span>
                </div>
              )}
              {/* Mini bar comparison */}
              <div className="mt-2 space-y-1">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/40" style={{ width: `${Math.min(100, (recipeVal / (Math.max(recipeVal, rdVal) * 1.2)) * 100)}%` }} />
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${rdStatus === "pass" ? "bg-accent" : rdStatus === "review" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.min(100, (rdVal / (Math.max(recipeVal, rdVal) * 1.2)) * 100)}%` }} />
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
          <p className={`text-lg font-mono font-bold ${costDelta <= 0 ? "text-accent" : "text-destructive"}`}>
            ${rdCost.toFixed(3)}<span className="text-xs text-muted-foreground">/unit</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
