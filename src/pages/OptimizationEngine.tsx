import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, AlertTriangle, XCircle, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface OptResult {
  status: "optimal" | "feasible" | "infeasible";
  iterations: number;
  objectiveValue: number;
  marginUplift: number;
  recommendations: { skuId: string; action: string; impact: string; risk: string }[];
  constraints: { name: string; status: "binding" | "slack"; value: number; limit: number }[];
}

const OptimizationEngine = () => {
  const [riskCap, setRiskCap] = useState(40);
  const [capacityCap, setCapacityCap] = useState(85);
  const [running, setRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [result, setResult] = useState<OptResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setIterations(0);
    
    const interval = setInterval(() => {
      setIterations(prev => {
        if (prev >= 247) {
          clearInterval(interval);
          setRunning(false);
          const feasible = riskCap > 15;
          setResult({
            status: feasible ? (riskCap > 30 ? "optimal" : "feasible") : "infeasible",
            iterations: 247,
            objectiveValue: feasible ? 34.8 + (riskCap - 30) * 0.05 : 0,
            marginUplift: feasible ? 2.1 + (riskCap - 30) * 0.02 : 0,
            recommendations: feasible ? [
              { skuId: "SKU-001", action: "Switch LAS → AOS", impact: "+$180K/yr", risk: "Low" },
              { skuId: "SKU-003", action: "Switch SLES → AOS", impact: "+$95K/yr", risk: "Medium" },
              { skuId: "SKU-005", action: "Consolidate supplier to ChemCorp", impact: "+$42K/yr", risk: "Low" },
              { skuId: "SKU-006", action: "Increase Glycerin % (cost neutral, performance gain)", impact: "+0.3% margin", risk: "Low" },
            ] : [],
            constraints: [
              { name: "Risk Score", status: "binding", value: riskCap, limit: riskCap },
              { name: "Supplier Capacity", status: capacityCap < 90 ? "binding" : "slack", value: capacityCap - 8, limit: capacityCap },
              { name: "Min Order Qty", status: "slack", value: 6200, limit: 5000 },
              { name: "Regulatory Approval", status: "slack", value: 1, limit: 1 },
            ],
          });
          return prev;
        }
        return prev + Math.floor(Math.random() * 12) + 3;
      });
    }, 30);
  };

  const statusConfig = {
    optimal: { icon: CheckCircle2, label: "Optimal Solution Found", color: "text-accent", bg: "bg-accent/10" },
    feasible: { icon: AlertTriangle, label: "Feasible but Risk High", color: "text-warning", bg: "bg-warning/10" },
    infeasible: { icon: XCircle, label: "No Feasible Solution", color: "text-destructive", bg: "bg-destructive/10" },
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Optimization Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">MILP-based portfolio optimization for maximum gross margin</p>
      </motion.div>

      {/* Constraint Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Optimization Constraints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Max Risk Score Threshold</span>
              <span className="text-xs font-bold text-primary">{riskCap}%</span>
            </div>
            <Slider value={[riskCap]} onValueChange={v => setRiskCap(v[0])} min={5} max={80} step={5} />
            <p className="text-[10px] text-muted-foreground">Lower values restrict to safer substitutions</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Supplier Capacity Utilization Cap</span>
              <span className="text-xs font-bold text-primary">{capacityCap}%</span>
            </div>
            <Slider value={[capacityCap]} onValueChange={v => setCapacityCap(v[0])} min={50} max={100} step={5} />
            <p className="text-[10px] text-muted-foreground">Max capacity a single supplier can be allocated</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running} className="gap-2 bg-primary">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Solving..." : "Run Optimization"}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </motion.div>

      {/* Running Animation */}
      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold">MILP Solver Running</span>
          </div>
          <Progress value={(iterations / 247) * 100} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground font-mono">Iterations: {Math.min(iterations, 247)} / 247 • Objective convergence: {((iterations / 247) * 98 + 2).toFixed(1)}%</p>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Status */}
          <div className={`kpi-card ${statusConfig[result.status].bg} border-current/20`}>
            <div className="flex items-center gap-3">
              {(() => { const Icon = statusConfig[result.status].icon; return <Icon className={`h-6 w-6 ${statusConfig[result.status].color}`} />; })()}
              <div>
                <p className={`text-lg font-bold ${statusConfig[result.status].color}`}>{statusConfig[result.status].label}</p>
                <p className="text-xs text-muted-foreground">{result.iterations} iterations • Objective: {result.objectiveValue.toFixed(1)}% gross margin</p>
              </div>
              {result.status !== "infeasible" && (
                <Badge className="ml-auto bg-accent text-accent-foreground">+{result.marginUplift.toFixed(1)}% Margin Uplift</Badge>
              )}
            </div>
          </div>

          {result.status !== "infeasible" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recommendations */}
              <div className="kpi-card">
                <h3 className="text-sm font-semibold mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium">{rec.skuId}</p>
                          <p className="text-sm mt-0.5">{rec.action}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`text-[10px] ${rec.risk === "Low" ? "border-accent text-accent" : "border-warning text-warning"}`}>{rec.risk}</Badge>
                          <p className="text-sm font-bold text-accent mt-1">{rec.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraint Status */}
              <div className="kpi-card">
                <h3 className="text-sm font-semibold mb-3">Constraint Status</h3>
                <div className="space-y-3">
                  {result.constraints.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm">{c.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">{c.value} / {c.limit}</span>
                        <Badge variant="outline" className={`text-[10px] ${c.status === "binding" ? "border-warning text-warning" : "border-accent text-accent"}`}>
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OptimizationEngine;
