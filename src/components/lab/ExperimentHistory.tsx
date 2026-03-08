import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download, GitCompare } from "lucide-react";
import { skuMaster, type SavedExperiment } from "@/data/mockData";
import { SimulationResults } from "./SimulationResults";

interface ExperimentHistoryProps {
  experiments: SavedExperiment[];
  onLoad: (exp: SavedExperiment) => void;
  onDelete: (id: string) => void;
}

export function ExperimentHistory({ experiments, onLoad, onDelete }: ExperimentHistoryProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const compareExps = compareIds.length === 2
    ? [experiments.find(e => e.id === compareIds[0])!, experiments.find(e => e.id === compareIds[1])!]
    : null;

  if (experiments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No saved experiments yet. Run a simulation and save it.</p>
      </div>
    );
  }

  const verdictStyle: Record<string, string> = {
    Pass: "bg-accent/10 text-accent",
    Review: "bg-warning/10 text-warning",
    Fail: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px]">Compare</TableHead>
            <TableHead className="text-[10px]">Name</TableHead>
            <TableHead className="text-[10px]">SKU</TableHead>
            <TableHead className="text-[10px]">Date</TableHead>
            <TableHead className="text-[10px]">Cost Δ</TableHead>
            <TableHead className="text-[10px]">Quality</TableHead>
            <TableHead className="text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments.map(exp => {
            const sku = skuMaster.find(s => s.id === exp.skuId);
            const costDelta = exp.rdCost - exp.recipeCost;
            const isSelected = compareIds.includes(exp.id);
            return (
              <TableRow key={exp.id} className={isSelected ? "bg-primary/5" : ""}>
                <TableCell>
                  <button
                    onClick={() => toggleCompare(exp.id)}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-border hover:border-primary"}`}
                  >
                    {isSelected && <GitCompare className="h-3 w-3 text-primary-foreground" />}
                  </button>
                </TableCell>
                <TableCell className="text-xs font-medium">{exp.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{sku?.name || exp.skuId}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground font-mono">{exp.date}</TableCell>
                <TableCell>
                  <span className={`text-xs font-mono ${costDelta <= 0 ? "text-accent" : "text-destructive"}`}>
                    {costDelta <= 0 ? "" : "+"}{costDelta.toFixed(3)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[9px] ${verdictStyle[exp.results.verdict]}`}>{exp.results.verdict}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onLoad(exp)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(exp.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {compareExps && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Comparing: {compareExps[0].name} vs {compareExps[1].name}</h4>
            <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => setCompareIds([])}>Clear</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {compareExps.map(exp => (
              <div key={exp.id} className="border rounded-lg p-4">
                <p className="text-xs font-semibold mb-3">{exp.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(exp.results.properties) as [string, number][]).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-[9px] text-muted-foreground uppercase">{key}</p>
                      <p className={`text-xs font-mono font-bold ${exp.results.details[key] === "pass" ? "text-accent" : exp.results.details[key] === "fail" ? "text-destructive" : "text-warning"}`}>
                        {val}
                      </p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Cost</p>
                    <p className="text-xs font-mono font-bold text-foreground">${exp.rdCost.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Verdict</p>
                    <Badge className={`text-[9px] ${verdictStyle[exp.results.verdict]}`}>{exp.results.verdict}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
