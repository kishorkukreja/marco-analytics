import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { ForecastAlertWidgets, AlertFilter } from "@/components/forecast/ForecastAlertWidgets";
import { BusinessSummaryNarrative } from "@/components/forecast/BusinessSummaryNarrative";
import { SKUForecastAccordion } from "@/components/forecast/SKUForecastAccordion";
import { ForecastComparison } from "@/components/forecast/ForecastComparison";
import { computeAllSKUMetrics, generateBusinessSummary } from "@/data/mockData";

const ForecastIntelligence = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [alertFilter, setAlertFilter] = useState<AlertFilter>(null);
  const [compareMode, setCompareMode] = useState(false);

  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);
  const allMetrics = useMemo(() => computeAllSKUMetrics(), []);
  const metricsMap = useMemo(() => new Map(allMetrics.map(m => [m.skuId, m])), [allMetrics]);

  const displaySKUs = useMemo(() => {
    const base = filteredSKUs;
    if (!alertFilter) return base;
    return base.filter(s => metricsMap.get(s.id)?.flags.includes(alertFilter));
  }, [filteredSKUs, alertFilter, metricsMap]);

  const filteredMetrics = useMemo(() => filteredSKUs.map(s => metricsMap.get(s.id)!).filter(Boolean), [filteredSKUs, metricsMap]);
  const businessSummary = useMemo(() => generateBusinessSummary(filteredSKUs.map(s => s.id)), [filteredSKUs]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forecast Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered forecast review agent with SKU-level diagnostics & narratives</p>
        </div>
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          onClick={() => setCompareMode(!compareMode)}
          className="gap-2 text-xs"
        >
          <GitCompareArrows className="h-3.5 w-3.5" />
          {compareMode ? "Exit Compare" : "Compare SKUs"}
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card !p-3">
        <GlobalFilters filters={filters} onChange={setFilters} />
      </motion.div>

      <ForecastAlertWidgets metrics={filteredMetrics} activeFilter={alertFilter} onFilterChange={setAlertFilter} />

      {compareMode ? (
        <ForecastComparison skus={displaySKUs} metricsMap={metricsMap} onClose={() => setCompareMode(false)} />
      ) : (
        <>
          <BusinessSummaryNarrative summary={businessSummary} />
          <SKUForecastAccordion skus={displaySKUs} metricsMap={metricsMap} />
        </>
      )}
    </div>
  );
};

export default ForecastIntelligence;
