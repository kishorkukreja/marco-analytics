import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisaggregationFilters, DisaggregationFilterState, defaultDisaggregationFilters, filterDisaggregationSKUs } from "./disaggregation/DisaggregationFilters";
import { ForecastKPIStrip } from "./disaggregation/ForecastKPIStrip";
import { MultiSKUTrendChart } from "./disaggregation/MultiSKUTrendChart";
import { SKUComparisonTable } from "./disaggregation/SKUComparisonTable";
import { ComponentForecastView } from "./disaggregation/ComponentForecastView";
import { MarginImpactChart } from "./disaggregation/MarginImpactChart";
import { ForecastBubbleChart } from "./disaggregation/ForecastBubbleChart";
import { generateDisaggregationForecasts, computeComponentDemand, computeDisaggregationKPIs } from "@/data/mockData";

interface Props {
  onDrillDown?: (skuId: string) => void;
}

export function ForecastDisaggregation({ onDrillDown }: Props) {
  const [filters, setFilters] = useState<DisaggregationFilterState>(defaultDisaggregationFilters);
  const [viewMode, setViewMode] = useState<"sku" | "component">("sku");

  const filteredSKUs = useMemo(() => filterDisaggregationSKUs(filters), [filters]);
  const skuIds = useMemo(() => filteredSKUs.map(s => s.id), [filteredSKUs]);
  const horizon = parseInt(filters.horizon);

  const forecasts = useMemo(() => generateDisaggregationForecasts(skuIds, horizon), [skuIds, horizon]);
  const componentDemand = useMemo(() => computeComponentDemand(skuIds, horizon), [skuIds, horizon]);
  const kpis = useMemo(() => computeDisaggregationKPIs(skuIds), [skuIds]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="kpi-card !p-3">
        <DisaggregationFilters filters={filters} onChange={setFilters} />
      </motion.div>

      {/* View Toggle */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="flex justify-center">
        <Tabs value={viewMode} onValueChange={v => setViewMode(v as "sku" | "component")}>
          <TabsList className="h-9">
            <TabsTrigger value="sku" className="text-xs px-5">SKU Forecast View</TabsTrigger>
            <TabsTrigger value="component" className="text-xs px-5">Component Forecast View</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* KPI Strip */}
      <ForecastKPIStrip kpis={kpis} />

      {viewMode === "sku" ? (
        <>
          <MultiSKUTrendChart forecasts={forecasts} scenario={filters.scenario} onSKUClick={onDrillDown} />
          <SKUComparisonTable forecasts={forecasts} onSKUClick={onDrillDown} />
          <div className="grid grid-cols-2 gap-5">
            <MarginImpactChart forecasts={forecasts} />
            <ForecastBubbleChart forecasts={forecasts} onSKUClick={onDrillDown} />
          </div>
        </>
      ) : (
        <>
          <ComponentForecastView componentDemand={componentDemand} />
          <MarginImpactChart forecasts={forecasts} />
        </>
      )}
    </div>
  );
}
