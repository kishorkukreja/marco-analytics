import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { skuMaster, forecastData } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";

interface ForecastResult {
  overStockCost: number;
  underStockCost: number;
  optimalSafety: number;
  serviceLevel: number;
  procurementSchedule: { month: string; demand: number; planned: number; safety: number }[];
  riskTradeoff: { safetyDays: number; inventoryCost: number; stockoutRisk: number }[];
}

export default function ForecastAligner() {
  const [selectedSku, setSelectedSku] = useState("SKU-001");
  const [safetyStock, setSafetyStock] = useState(15);
  const [maxInventoryDays, setMaxInventoryDays] = useState(45);
  const [serviceTarget, setServiceTarget] = useState(95);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ForecastResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          computeResult();
          return 100;
        }
        return prev + Math.floor(Math.random() * 6) + 3;
      });
    }, 50);
  };

  const computeResult = () => {
    const skuForecasts = forecastData.filter(f => f.skuId === selectedSku);
    const sku = skuMaster.find(s => s.id === selectedSku)!;
    const monthlyAvg = sku.annualVolume / 12;

    // Build procurement schedule for next 12 months
    const futureMonths = skuForecasts.slice(-12);
    const safetyUnits = Math.round(monthlyAvg * (safetyStock / 100));

    const procurementSchedule = futureMonths.map(f => ({
      month: f.month,
      demand: Math.round(f.adjustedForecast / 1000),
      planned: Math.round((f.adjustedForecast + safetyUnits * 0.3) / 1000),
      safety: Math.round(safetyUnits / 1000),
    }));

    // Risk tradeoff curve
    const riskTradeoff = Array.from({ length: 10 }, (_, i) => {
      const days = (i + 1) * 5;
      return {
        safetyDays: days,
        inventoryCost: +(days * monthlyAvg / 30 * 2.5 / 1e6).toFixed(3),
        stockoutRisk: +(Math.max(0, 25 - days * 0.8 + Math.random() * 3)).toFixed(1),
      };
    });

    const overStockCost = +(safetyUnits * 12 * 1.2 / 1e6).toFixed(2);
    const underStockCost = +(monthlyAvg * 0.05 * 12 * 3.5 / 1e6).toFixed(2);

    setResult({
      overStockCost,
      underStockCost,
      optimalSafety: safetyStock,
      serviceLevel: Math.min(99.5, serviceTarget + (safetyStock - 10) * 0.15),
      procurementSchedule,
      riskTradeoff,
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Forecast-Demand Alignment Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-medium">SKU</span>
            <Select value={selectedSku} onValueChange={setSelectedSku}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {skuMaster.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.id} — {s.name.split(" ").slice(0, 2).join(" ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Safety Stock %</span>
              <span className="text-xs font-bold text-primary">{safetyStock}%</span>
            </div>
            <Slider value={[safetyStock]} onValueChange={v => setSafetyStock(v[0])} min={5} max={40} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Max Inventory Days</span>
              <span className="text-xs font-bold text-primary">{maxInventoryDays}</span>
            </div>
            <Slider value={[maxInventoryDays]} onValueChange={v => setMaxInventoryDays(v[0])} min={15} max={90} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Service Level Target</span>
              <span className="text-xs font-bold text-primary">{serviceTarget}%</span>
            </div>
            <Slider value={[serviceTarget]} onValueChange={v => setServiceTarget(v[0])} min={85} max={99} step={1} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running} className="gap-2">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Aligning..." : "Run Forecast Alignment"}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <span className="text-sm font-semibold">Analyzing demand patterns…</span>
          <Progress value={Math.min(progress, 100)} className="h-2 mt-3" />
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Overstock Cost</p>
              <p className="text-xl font-bold text-warning">${result.overStockCost}M</p>
            </div>
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Understock Cost</p>
              <p className="text-xl font-bold text-destructive">${result.underStockCost}M</p>
            </div>
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Optimal Safety</p>
              <p className="text-xl font-bold text-primary">{result.optimalSafety}%</p>
            </div>
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Projected SL</p>
              <p className="text-xl font-bold text-accent">{result.serviceLevel.toFixed(1)}%</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Demand vs. Planned Procurement (K units)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.procurementSchedule}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="demand" name="Demand" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="planned" name="Planned" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="safety" name="Safety Stock" stroke="hsl(var(--chart-3))" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Inventory Cost vs. Stockout Risk</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.riskTradeoff}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="safetyDays" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Safety Days", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="inventoryCost" name="Inv. Cost ($M)" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="stockoutRisk" name="Stockout Risk (%)" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
