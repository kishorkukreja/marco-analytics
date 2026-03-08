import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, BarChart3, PieChart } from "lucide-react";
import MarginOptimizer from "@/components/optimization/MarginOptimizer";
import CostMinimizer from "@/components/optimization/CostMinimizer";
import ForecastAligner from "@/components/optimization/ForecastAligner";
import PortfolioOptimizer from "@/components/optimization/PortfolioOptimizer";

const OptimizationEngine = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Optimization Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Multi-objective optimization for margin, cost, demand, and portfolio</p>
      </motion.div>

      <Tabs defaultValue="margin" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted">
          <TabsTrigger value="margin" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Margin</span> Max
          </TabsTrigger>
          <TabsTrigger value="cost" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
            <DollarSign className="h-3.5 w-3.5" />
            Cost <span className="hidden sm:inline">Min</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Forecast-</span>Demand
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
            <PieChart className="h-3.5 w-3.5" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="margin">
          <MarginOptimizer />
        </TabsContent>
        <TabsContent value="cost">
          <CostMinimizer />
        </TabsContent>
        <TabsContent value="forecast">
          <ForecastAligner />
        </TabsContent>
        <TabsContent value="portfolio">
          <PortfolioOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizationEngine;
