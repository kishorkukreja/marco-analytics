import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { ForecastAlertWidgets, AlertFilter } from "@/components/forecast/ForecastAlertWidgets";
import { BusinessSummaryNarrative } from "@/components/forecast/BusinessSummaryNarrative";
import { SKUForecastAccordion } from "@/components/forecast/SKUForecastAccordion";
import { ForecastComparison } from "@/components/forecast/ForecastComparison";
import { ForecastDisaggregation } from "@/components/forecast/ForecastDisaggregation";
import { computeAllSKUMetrics, generateBusinessSummary } from "@/data/mockData";

const ForecastIntelligence = () => {
  const [activeTab, setActiveTab] = useState("disaggregation");
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

  const handleDrillDown = (skuId: string) => {
    setActiveTab("deepdive");
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forecast Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered forecast review agent with SKU-level diagnostics & narratives</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="disaggregation" className="text-xs px-6">Forecast Disaggregation</TabsTrigger>
          <TabsTrigger value="deepdive" className="text-xs px-6">SKU Forecast Deep Dive</TabsTrigger>
        </TabsList>

        <TabsContent value="disaggregation" className="mt-5">
          <ForecastDisaggregation onDrillDown={handleDrillDown} />
        </TabsContent>

        <TabsContent value="deepdive" className="mt-5 space-y-5">
          <div className="flex items-center justify-end">
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCompareMode(!compareMode)}
              className="gap-2 text-xs"
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              {compareMode ? "Exit Compare" : "Compare SKUs"}
            </Button>
          </div>

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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForecastIntelligence;
