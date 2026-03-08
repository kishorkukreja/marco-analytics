import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { materialMaster, supplierMaster, type LabBOMEntry } from "@/data/mockData";

interface RecipeBOMProps {
  bomEntries: LabBOMEntry[];
}

export function RecipeBOM({ bomEntries }: RecipeBOMProps) {
  const totalPct = bomEntries.reduce((s, e) => s + e.compositionPct, 0);
  const waterPct = Math.max(0, 100 - totalPct);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Recipe BOM</h3>
        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">Production Spec</Badge>
      </div>

      <Accordion type="multiple" className="space-y-1">
        {bomEntries.map((entry) => {
          const mat = materialMaster.find(m => m.id === entry.materialId);
          if (!mat) return null;
          const supplier = supplierMaster.find(s => s.id === mat.supplierId);
          const costContrib = mat.costPerKg * entry.compositionPct / 100;

          return (
            <AccordionItem key={entry.materialId} value={entry.materialId} className="border rounded-lg px-3 bg-muted/30">
              <AccordionTrigger className="py-2.5 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary font-mono">{mat.id.slice(-3)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{mat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{mat.type} • {entry.compositionPct}%</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-3 pb-2">
                  <MetricCell label="Cost/kg" value={`$${mat.costPerKg.toFixed(2)}`} />
                  <MetricCell label="Cost Contrib." value={`$${costContrib.toFixed(3)}/unit`} />
                  <MetricCell label="Composition" value={`${entry.compositionPct}%`} />
                  <MetricCell label="Viscosity" value={`${mat.viscosity} cP`} />
                  <MetricCell label="Density" value={`${mat.density} g/cm³`} />
                  <MetricCell label="pH" value={mat.pH.toFixed(1)} />
                  <MetricCell label="Perf. Index" value={`${mat.performanceIndex}/100`} />
                  <MetricCell label="Supplier" value={supplier?.name || "—"} />
                  <MetricCell label="Lead Time" value={`${supplier?.leadTimeDays || 0}d`} />
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
        <span className="text-xs font-mono font-bold text-foreground">{totalPct}%</span>
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-medium text-foreground font-mono">{value}</p>
    </div>
  );
}
