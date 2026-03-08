import { motion } from "framer-motion";
import { Activity, Target, TrendingDown, AlertTriangle } from "lucide-react";
import { SKUForecastMetrics } from "@/data/mockData";

export type AlertFilter = "volatile_run_rate" | "low_accuracy" | "high_margin" | "bias_detected" | null;

interface Props {
  metrics: SKUForecastMetrics[];
  activeFilter: AlertFilter;
  onFilterChange: (filter: AlertFilter) => void;
}

const alertConfig = [
  { key: "volatile_run_rate" as const, label: "Volatile Run Rate", sublabel: ">10% MoM", icon: Activity, colorClass: "text-warning" },
  { key: "low_accuracy" as const, label: "Low Accuracy", sublabel: "<80%", icon: TrendingDown, colorClass: "text-destructive" },
  { key: "high_margin" as const, label: "High Margin SKUs", sublabel: ">35% margin", icon: Target, colorClass: "text-accent" },
  { key: "bias_detected" as const, label: "Bias Detected", sublabel: ">5% systematic", icon: AlertTriangle, colorClass: "text-warning" },
];

export function ForecastAlertWidgets({ metrics, activeFilter, onFilterChange }: Props) {
  const counts = alertConfig.map(a => ({
    ...a,
    count: metrics.filter(m => m.flags.includes(a.key)).length,
  }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {counts.map((alert, i) => {
        const isActive = activeFilter === alert.key;
        const Icon = alert.icon;
        return (
          <motion.button
            key={alert.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            onClick={() => onFilterChange(isActive ? null : alert.key)}
            className={`kpi-card !p-4 text-left transition-all cursor-pointer ${isActive ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-4 w-4 ${alert.colorClass}`} />
              <span className={`text-2xl font-bold ${alert.colorClass}`}>{alert.count}</span>
            </div>
            <p className="text-xs font-semibold">{alert.label}</p>
            <p className="text-[10px] text-muted-foreground">{alert.sublabel}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
