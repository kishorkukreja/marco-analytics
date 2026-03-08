import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  summary: {
    totalRunRate: number;
    avgAccuracy: number;
    avgCoCChange: number;
    totalCoCCases: number;
    upMovers: { sku: { id: string; name: string; brand: string }; metrics: { cocChange: number; runRate: number } }[];
    downMovers: { sku: { id: string; name: string; brand: string }; metrics: { cocChange: number; runRate: number } }[];
    brandSummaries: { brand: string; avgCoC: number }[];
    skuCount: number;
    flaggedCount: number;
  };
}

export function BusinessSummaryNarrative({ summary }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="kpi-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Business Summary</h3>
        <Badge variant="outline" className="text-[10px] ml-auto">Auto-Generated</Badge>
      </div>
      <div className="bg-muted/30 rounded-lg p-4 border border-border/50 text-xs leading-relaxed space-y-2">
        <p>
          <strong>Total Portfolio:</strong> {summary.avgCoCChange > 0 ? "+" : ""}{summary.avgCoCChange}% CoC
          ({summary.avgCoCChange > 0 ? "+" : ""}{summary.totalCoCCases.toLocaleString()} cases) across {summary.skuCount} SKUs.
          Average forecast accuracy: {summary.avgAccuracy}%. Total run-rate: {summary.totalRunRate.toLocaleString()} cases/month.
        </p>
        {summary.upMovers.length > 0 && (
          <p>
            <strong>Largest upward movers:</strong>{" "}
            {summary.upMovers.map(m => `${m.sku.name} +${Math.round(m.metrics.runRate * m.metrics.cocChange / 100).toLocaleString()} cases`).join("; ")}.
          </p>
        )}
        {summary.downMovers.length > 0 && (
          <p>
            <strong>Declines:</strong>{" "}
            {summary.downMovers.map(m => `${m.sku.name} ${Math.round(m.metrics.runRate * m.metrics.cocChange / 100).toLocaleString()} cases`).join("; ")}.
          </p>
        )}
        <p>
          <strong>Brand view:</strong>{" "}
          {summary.brandSummaries.map(b => `${b.brand} ${b.avgCoC > 0 ? "+" : ""}${b.avgCoC}%`).join(", ")}.
        </p>
        <p>
          <strong>{summary.flaggedCount} SKUs flagged</strong> for review based on accuracy, bias, or volatility thresholds.
        </p>
      </div>
    </motion.div>
  );
}
