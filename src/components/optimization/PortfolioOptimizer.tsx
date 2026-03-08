import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { skuMaster } from "@/data/mockData";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";

interface PortfolioResult {
  skuRanking: {
    id: string; name: string; compositeScore: number;
    marginScore: number; riskScore: number; costScore: number;
    recommendation: "Keep" | "Review" | "Sunset";
  }[];
  radarData: { metric: string; value: number; fullMark: number }[];
  portfolioKPIs: { avgMargin: number; riskIndex: number; revenueConcentration: number; skuEfficiency: number };
}

export default function PortfolioOptimizer() {
  const [marginWeight, setMarginWeight] = useState(40);
  const [riskWeight, setRiskWeight] = useState(30);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PortfolioResult | null>(null);

  const costWeight = 100 - marginWeight - riskWeight;

  const runOptimization = () => {
    if (costWeight < 0) return;
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
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 35);
  };

  const computeResult = () => {
    const totalRevenue = skuMaster.reduce((s, sk) => s + sk.revenue, 0);
    const maxMargin = Math.max(...skuMaster.map(s => s.currentMargin));

    const skuRanking = skuMaster.map(sku => {
      const marginScore = (sku.currentMargin / maxMargin) * 100;
      const riskScore = 100 - (sku.currentMargin < 30 ? 70 : sku.currentMargin < 35 ? 40 : 15) + Math.random() * 10;
      const costEfficiency = (sku.revenue / sku.annualVolume) * 100;
      const costScore = Math.min(100, costEfficiency * 8);

      const composite = (marginScore * marginWeight + riskScore * riskWeight + costScore * costWeight) / 100;
      const recommendation: "Keep" | "Review" | "Sunset" = composite > 70 ? "Keep" : composite > 45 ? "Review" : "Sunset";

      return {
        id: sku.id,
        name: sku.name.split(" ").slice(0, 2).join(" "),
        compositeScore: +composite.toFixed(1),
        marginScore: +marginScore.toFixed(1),
        riskScore: +riskScore.toFixed(1),
        costScore: +costScore.toFixed(1),
        recommendation,
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);

    const avgMargin = +(skuMaster.reduce((s, sk) => s + sk.currentMargin, 0) / skuMaster.length).toFixed(1);
    const topRevShare = (Math.max(...skuMaster.map(s => s.revenue)) / totalRevenue * 100);

    const radarData = [
      { metric: "Avg Margin", value: avgMargin, fullMark: 50 },
      { metric: "Portfolio Diversity", value: +(100 - topRevShare).toFixed(1), fullMark: 100 },
      { metric: "Risk Score", value: +(skuRanking.reduce((s, r) => s + r.riskScore, 0) / skuRanking.length).toFixed(1), fullMark: 100 },
      { metric: "Cost Efficiency", value: +(skuRanking.reduce((s, r) => s + r.costScore, 0) / skuRanking.length).toFixed(1), fullMark: 100 },
      { metric: "Channel Balance", value: 72, fullMark: 100 },
      { metric: "Volume Utilization", value: 85, fullMark: 100 },
    ];

    setResult({
      skuRanking,
      radarData,
      portfolioKPIs: {
        avgMargin,
        riskIndex: +(skuRanking.reduce((s, r) => s + r.riskScore, 0) / skuRanking.length).toFixed(1),
        revenueConcentration: +topRevShare.toFixed(1),
        skuEfficiency: +(totalRevenue / skuMaster.length / 1e6).toFixed(1),
      },
    });
  };

  const recColors = { Keep: "border-accent text-accent", Review: "border-warning text-warning", Sunset: "border-destructive text-destructive" };
  const barColors = { Keep: "hsl(160,64%,40%)", Review: "hsl(38,92%,50%)", Sunset: "hsl(0,72%,51%)" };

  return (
    <div className="space-y-4">
      {/* Weight Sliders */}
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Priority Weights (must sum to 100%)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Margin Weight</span>
              <span className="text-xs font-bold text-primary">{marginWeight}%</span>
            </div>
            <Slider value={[marginWeight]} onValueChange={v => { if (v[0] + riskWeight <= 100) setMarginWeight(v[0]); }} min={0} max={100} step={5} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Risk Weight</span>
              <span className="text-xs font-bold text-primary">{riskWeight}%</span>
            </div>
            <Slider value={[riskWeight]} onValueChange={v => { if (marginWeight + v[0] <= 100) setRiskWeight(v[0]); }} min={0} max={100} step={5} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Cost Weight</span>
              <span className={`text-xs font-bold ${costWeight < 0 ? "text-destructive" : "text-primary"}`}>{costWeight}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary mt-3">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, costWeight)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Auto-calculated from remaining weight</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running || costWeight < 0} className="gap-2">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Optimizing..." : "Run Portfolio Optimization"}
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
          <span className="text-sm font-semibold">Scoring portfolio…</span>
          <Progress value={Math.min(progress, 100)} className="h-2 mt-3" />
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Portfolio KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Avg Margin</p>
              <p className="text-xl font-bold text-accent">{result.portfolioKPIs.avgMargin}%</p>
            </div>
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Risk Index</p>
              <p className="text-xl font-bold text-primary">{result.portfolioKPIs.riskIndex}</p>
            </div>
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Top SKU Revenue %</p>
              <p className="text-xl font-bold text-warning">{result.portfolioKPIs.revenueConcentration}%</p>
            </div>
            <div className="kpi-card text-center">
              <p className="text-xs text-muted-foreground">Rev/SKU ($M)</p>
              <p className="text-xl font-bold text-primary">{result.portfolioKPIs.skuEfficiency}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SKU Ranking */}
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">SKU Ranking by Composite Score</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={result.skuRanking} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="compositeScore" name="Score" radius={[0, 4, 4, 0]}>
                    {result.skuRanking.map((entry, i) => (
                      <Cell key={i} fill={barColors[entry.recommendation]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Portfolio Health Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={result.radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendation Table */}
          <div className="kpi-card">
            <h3 className="text-sm font-semibold mb-3">SKU Recommendations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">SKU</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Margin</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Risk</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Cost Eff.</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Score</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {result.skuRanking.map(sku => (
                    <tr key={sku.id} className="border-b border-border/50">
                      <td className="py-2">
                        <span className="text-xs font-medium text-muted-foreground">{sku.id}</span>
                        <span className="text-xs ml-2 hidden sm:inline">{sku.name}</span>
                      </td>
                      <td className="text-right py-2 text-xs font-mono">{sku.marginScore.toFixed(0)}</td>
                      <td className="text-right py-2 text-xs font-mono">{sku.riskScore.toFixed(0)}</td>
                      <td className="text-right py-2 text-xs font-mono">{sku.costScore.toFixed(0)}</td>
                      <td className="text-right py-2 text-xs font-mono font-bold">{sku.compositeScore}</td>
                      <td className="text-right py-2">
                        <Badge variant="outline" className={`text-[10px] ${recColors[sku.recommendation]}`}>
                          {sku.recommendation}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
