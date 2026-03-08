import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, BarChart3, PieChart, Layers, FlaskConical, Package } from "lucide-react";
import MarginOptimizer from "@/components/optimization/MarginOptimizer";
import CostMinimizer from "@/components/optimization/CostMinimizer";
import ForecastAligner from "@/components/optimization/ForecastAligner";
import PortfolioOptimizer from "@/components/optimization/PortfolioOptimizer";
import SKURationalization from "@/components/optimization/SKURationalization";
import RawMaterialRationalization from "@/components/optimization/RawMaterialRationalization";
import PackRationalization from "@/components/optimization/PackRationalization";

const OptimizationEngine = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Optimization Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Multi-objective optimization across margin, cost, demand, portfolio & rationalization</p>
      </motion.div>

      <Tabs defaultValue="margin" className="w-full">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 h-auto p-1 bg-muted gap-0.5">
            <TabsTrigger value="margin" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              Margin
            </TabsTrigger>
            <TabsTrigger value="cost" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              Cost
            </TabsTrigger>
            <TabsTrigger value="forecast" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <BarChart3 className="h-3.5 w-3.5 shrink-0" />
              Demand
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <PieChart className="h-3.5 w-3.5 shrink-0" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="sku-rat" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <Layers className="h-3.5 w-3.5 shrink-0" />
              SKU Rat.
            </TabsTrigger>
            <TabsTrigger value="raw-rat" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <FlaskConical className="h-3.5 w-3.5 shrink-0" />
              Raw Rat.
            </TabsTrigger>
            <TabsTrigger value="pack-rat" className="gap-1.5 text-[11px] sm:text-sm whitespace-nowrap px-2 sm:px-3">
              <Package className="h-3.5 w-3.5 shrink-0" />
              Pack Rat.
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="margin"><MarginOptimizer /></TabsContent>
        <TabsContent value="cost"><CostMinimizer /></TabsContent>
        <TabsContent value="forecast"><ForecastAligner /></TabsContent>
        <TabsContent value="portfolio"><PortfolioOptimizer /></TabsContent>
        <TabsContent value="sku-rat"><SKURationalization /></TabsContent>
        <TabsContent value="raw-rat"><RawMaterialRationalization /></TabsContent>
        <TabsContent value="pack-rat"><PackRationalization /></TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizationEngine;
