import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SimulationEngine from "./pages/SimulationEngine";
import OptimizationEngine from "./pages/OptimizationEngine";
import ForecastIntelligence from "./pages/ForecastIntelligence";
import InsightsPage from "./pages/InsightsPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/simulation" element={<SimulationEngine />} />
            <Route path="/optimization" element={<OptimizationEngine />} />
            <Route path="/forecast" element={<ForecastIntelligence />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/admin" element={<AdminSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
