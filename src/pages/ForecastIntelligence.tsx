import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { ForecastAlertWidgets, AlertFilter } from "@/components/forecast/ForecastAlertWidgets";
import { BusinessSummaryNarrative } from "@/components/forecast/BusinessSummaryNarrative";
import { SKUForecastAccordion } from "@/components/forecast/SKUForecastAccordion";
import { computeAllSKUMetrics, generateBusinessSummary } from "@/data/mockData";

const ForecastIntelligence = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [alertFilter, setAlertFilter] = useState<AlertFilter>(null);

  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);
  const allMetrics = useMemo(() => computeAllSKUMetrics(), []);
  const metricsMap = useMemo(() => new Map(allMetrics.map(m => [m.skuId, m])), [allMetrics]);

  // Filter by alert widget
  const displaySKUs = useMemo(() => {
    const base = filteredSKUs;
    if (!alertFilter) return base;
    return base.filter(s => {
      const m = metricsMap.get(s.id);
      return m?.flags.includes(alertFilter);
    });
  }, [filteredSKUs, alertFilter, metricsMap]);

  // Only metrics for filtered SKUs (for alert counts)
  const filteredMetrics = useMemo(() => filteredSKUs.map(s => metricsMap.get(s.id)!).filter(Boolean), [filteredSKUs, metricsMap]);

  const businessSummary = useMemo(() => generateBusinessSummary(filteredSKUs.map(s => s.id)), [filteredSKUs]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Forecast Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered forecast review agent with SKU-level diagnostics & narratives</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card !p-3">
        <GlobalFilters filters={filters} onChange={setFilters} />
      </motion.div>

      {/* Alert Widgets */}
      <ForecastAlertWidgets metrics={filteredMetrics} activeFilter={alertFilter} onFilterChange={setAlertFilter} />

      {/* Business Summary */}
      <BusinessSummaryNarrative summary={businessSummary} />

      {/* SKU Accordion */}
      <SKUForecastAccordion skus={displaySKUs} metricsMap={metricsMap} />
    </div>
  );
};

export default ForecastIntelligence;
