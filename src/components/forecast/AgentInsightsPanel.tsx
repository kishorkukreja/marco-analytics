import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateAgentNarratives, skuMaster } from "@/data/mockData";
import { useMemo } from "react";
import { ArrowRightLeft, Search, BarChart3, Brain, CheckCircle, FileText } from "lucide-react";

interface Props {
  skuId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sectionIcons = [ArrowRightLeft, Search, BarChart3, Brain, CheckCircle, FileText];

export function AgentInsightsPanel({ skuId, open, onOpenChange }: Props) {
  const sku = skuId ? skuMaster.find(s => s.id === skuId) : null;
  const narratives = useMemo(() => (skuId ? generateAgentNarratives(skuId) : null), [skuId]);

  if (!sku || !narratives) return null;

  const sections = [
    narratives.movement,
    narratives.drivers,
    narratives.benchmarkAssessment,
    narratives.mlReliability,
    narratives.recommendation,
    narratives.finalSummary,
  ];

  const confidenceColor = narratives.metrics.accuracy > 85 ? "text-accent" : narratives.metrics.accuracy > 75 ? "text-warning" : "text-destructive";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 pt-6 pb-4">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <SheetTitle className="text-base">Forecast Review Agent</SheetTitle>
            </div>
            <SheetDescription className="text-xs">
              {sku.id} — {sku.name} ({sku.region}, {sku.channel})
            </SheetDescription>
            <div className="flex gap-3 mt-2">
              <Badge variant="outline" className="text-[10px]">
                Accuracy: <span className={`font-bold ml-1 ${confidenceColor}`}>{narratives.metrics.accuracy}%</span>
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Bias: <span className="font-bold ml-1">{narratives.metrics.bias > 0 ? "+" : ""}{narratives.metrics.bias}%</span>
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Confidence: <span className="font-bold ml-1">{narratives.confidence.total}%</span>
              </Badge>
            </div>
          </SheetHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {sections.map((section, i) => {
            const Icon = sectionIcons[i];
            return (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50 text-xs leading-relaxed">
                  {section.content}
                </div>
                {i < sections.length - 1 && <Separator className="mt-5" />}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Standalone content renderer (no Sheet wrapper) for use in comparison mode */
export function AgentInsightsContent({ skuId }: { skuId: string }) {
  const sku = skuMaster.find(s => s.id === skuId);
  const narratives = useMemo(() => generateAgentNarratives(skuId), [skuId]);

  if (!sku || !narratives) return null;

  const sections = [
    narratives.movement,
    narratives.drivers,
    narratives.benchmarkAssessment,
    narratives.mlReliability,
    narratives.recommendation,
    narratives.finalSummary,
  ];

  const confidenceColor = narratives.metrics.accuracy > 85 ? "text-accent" : narratives.metrics.accuracy > 75 ? "text-warning" : "text-destructive";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-bold truncate">{sku.name}</h4>
      </div>
      <p className="text-[10px] text-muted-foreground">{sku.id} · {sku.region} · {sku.channel}</p>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px]">
          Acc: <span className={`font-bold ml-1 ${confidenceColor}`}>{narratives.metrics.accuracy}%</span>
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          Bias: <span className="font-bold ml-1">{narratives.metrics.bias > 0 ? "+" : ""}{narratives.metrics.bias}%</span>
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          Conf: <span className="font-bold ml-1">{narratives.confidence.total}%</span>
        </Badge>
      </div>
      <Separator />
      {sections.map((section, i) => {
        const Icon = sectionIcons[i];
        return (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <h5 className="text-xs font-semibold">{section.title}</h5>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50 text-[11px] leading-relaxed">
              {section.content}
            </div>
            {i < sections.length - 1 && <Separator className="mt-4" />}
          </div>
        );
      })}
    </div>
  );
}
