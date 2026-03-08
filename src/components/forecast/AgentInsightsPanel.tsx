import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { generateAgentNarratives, skuMaster } from "@/data/mockData";
import { useMemo } from "react";
import { ArrowRightLeft, Search, BarChart3, Brain, CheckCircle, FileText } from "lucide-react";

interface Props {
  skuId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sectionIcons = [ArrowRightLeft, Search, BarChart3, Brain, CheckCircle, FileText];
const sectionKeys = ["movement", "drivers", "benchmark", "ml", "recommendation", "summary"] as const;

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
      <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
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

        <Tabs defaultValue="movement" className="mt-4">
          <TabsList className="w-full flex overflow-x-auto h-auto flex-wrap gap-1 bg-muted/50 p-1">
            {sectionKeys.map((key, i) => {
              const Icon = sectionIcons[i];
              return (
                <TabsTrigger key={key} value={key} className="text-[10px] gap-1 px-2 py-1.5">
                  <Icon className="h-3 w-3" />
                  {sections[i].title.split(" ").slice(0, 2).join(" ")}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sectionKeys.map((key, i) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  {(() => { const Icon = sectionIcons[i]; return <Icon className="h-4 w-4 text-primary" />; })()}
                  {sections[i].title}
                </h4>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50 text-xs leading-relaxed">
                  {sections[i].content}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
