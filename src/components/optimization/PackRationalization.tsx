import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { skuMaster } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Pack size data derived from SKU master
const packSizes = [...new Set(skuMaster.map(s => s.packSize))];

interface PackConfig {
  packSize: string;
  skuCount: number;
  totalVolume: number;
  totalRevenue: number;
  avgMargin: number;
  revenuePerUnit: number;
  complexity: number;
}

interface PackRatResult {
  totalPacks: number;
  keepCount: number;
  mergeCount: number;
  sunsetCount: number;
  projectedSavings: number;
  packAnalysis: (PackConfig & { recommendation: "Keep" | "Merge" | "Sunset"; reason: string })[];
  volumeByPack: { packSize: string; volume: number; revenue: number }[];
  marginByPack: { packSize: string; margin: number; skuCount: number }[];
  skuLevelDetail: { id: string; name: string; packSize: string; volume: number; margin: number; revenuePerUnit: number; recommendation: "Keep" | "Merge" | "Sunset" }[];
}

export default function PackRationalization() {
  const [minVolumeThreshold, setMinVolumeThreshold] = useState(20);
  const [minMarginThreshold, setMinMarginThreshold] = useState(28);
  const [maxPackVariants, setMaxPackVariants] = useState(4);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PackRatResult | null>(null);

  const runOptimization = () => {
    setRunning(true);
    setResult(null);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setRunning(false); computeResult(); return 100; }
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 35);
  };

  const computeResult = () => {
    const totalVolume = skuMaster.reduce((s, sk) => s + sk.annualVolume, 0);

    // Analyze each pack size
    const packConfigs: PackConfig[] = packSizes.map(ps => {
      const skus = skuMaster.filter(s => s.packSize === ps);
      const totalVol = skus.reduce((s, sk) => s + sk.annualVolume, 0);
      const totalRev = skus.reduce((s, sk) => s + sk.revenue, 0);
      const avgMargin = skus.reduce((s, sk) => s + sk.currentMargin, 0) / skus.length;
      return {
        packSize: ps,
        skuCount: skus.length,
        totalVolume: totalVol,
        totalRevenue: totalRev,
        avgMargin: +avgMargin.toFixed(1),
        revenuePerUnit: +(totalRev / totalVol).toFixed(2),
        complexity: +(skus.length * 15 + (1 - totalVol / totalVolume) * 40).toFixed(1),
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Determine recommendations
    const volumeThreshold = totalVolume * (minVolumeThreshold / 100);
    const packAnalysis = packConfigs.map((pc, i) => {
      let recommendation: "Keep" | "Merge" | "Sunset" = "Keep";
      let reason = "Strong volume and margin performance";

      if (pc.totalVolume < volumeThreshold && pc.avgMargin < minMarginThreshold) {
        recommendation = "Sunset";
        reason = `Low volume (${(pc.totalVolume / 1e6).toFixed(1)}M) and margin (${pc.avgMargin}%) below thresholds`;
      } else if (i >= maxPackVariants) {
        recommendation = "Merge";
        reason = `Exceeds max pack variant target of ${maxPackVariants}; merge into nearest size`;
      } else if (pc.avgMargin < minMarginThreshold) {
        recommendation = "Merge";
        reason = `Margin ${pc.avgMargin}% below ${minMarginThreshold}% threshold`;
      }

      return { ...pc, recommendation, reason };
    });

    // SKU-level detail
    const skuLevelDetail = skuMaster.map(sku => {
      const packRec = packAnalysis.find(p => p.packSize === sku.packSize);
      return {
        id: sku.id,
        name: sku.name.split(" ").slice(0, 2).join(" "),
        packSize: sku.packSize,
        volume: sku.annualVolume,
        margin: sku.currentMargin,
        revenuePerUnit: +(sku.revenue / sku.annualVolume).toFixed(2),
        recommendation: packRec?.recommendation || "Keep" as const,
      };
    });

    const volumeByPack = packConfigs.map(pc => ({
      packSize: pc.packSize, volume: +(pc.totalVolume / 1e6).toFixed(1), revenue: +(pc.totalRevenue / 1e6).toFixed(1),
    }));

    const marginByPack = packConfigs.map(pc => ({
      packSize: pc.packSize, margin: pc.avgMargin, skuCount: pc.skuCount,
    }));

    const keepCount = packAnalysis.filter(p => p.recommendation === "Keep").length;
    const mergeCount = packAnalysis.filter(p => p.recommendation === "Merge").length;
    const sunsetCount = packAnalysis.filter(p => p.recommendation === "Sunset").length;

    setResult({
      totalPacks: packSizes.length,
      keepCount, mergeCount, sunsetCount,
      projectedSavings: mergeCount * 180000 + sunsetCount * 95000,
      packAnalysis, volumeByPack, marginByPack, skuLevelDetail,
    });
  };

  const recColors = { Keep: "border-accent text-accent", Merge: "border-warning text-warning", Sunset: "border-destructive text-destructive" };

  return (
    <div className="space-y-4">
      <div className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Pack Rationalization Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Min Volume Threshold</span><span className="text-xs font-bold text-primary">{minVolumeThreshold}%</span></div>
            <Slider value={[minVolumeThreshold]} onValueChange={v => setMinVolumeThreshold(v[0])} min={5} max={40} step={5} />
            <p className="text-[10px] text-muted-foreground">% of total volume; packs below this flagged</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Min Margin Threshold</span><span className="text-xs font-bold text-primary">{minMarginThreshold}%</span></div>
            <Slider value={[minMarginThreshold]} onValueChange={v => setMinMarginThreshold(v[0])} min={15} max={45} step={1} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-xs font-medium">Max Pack Variants</span><span className="text-xs font-bold text-primary">{maxPackVariants}</span></div>
            <Slider value={[maxPackVariants]} onValueChange={v => setMaxPackVariants(v[0])} min={2} max={8} step={1} />
            <p className="text-[10px] text-muted-foreground">Target number of unique pack sizes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={runOptimization} disabled={running} className="gap-2">
            {running ? <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Analyzing..." : "Run Pack Rationalization"}
          </Button>
          {result && <Button variant="outline" onClick={() => setResult(null)} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>}
        </div>
      </div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kpi-card">
          <span className="text-sm font-semibold">Analyzing pack architecture…</span>
          <Progress value={Math.min(progress, 100)} className="h-2 mt-3" />
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Pack Variants</p><p className="text-xl font-bold text-primary">{result.totalPacks}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Keep</p><p className="text-xl font-bold text-accent">{result.keepCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Merge</p><p className="text-xl font-bold text-warning">{result.mergeCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Sunset</p><p className="text-xl font-bold text-destructive">{result.sunsetCount}</p></div>
            <div className="kpi-card text-center"><p className="text-xs text-muted-foreground">Savings</p><p className="text-xl font-bold text-accent">${(result.projectedSavings / 1000).toFixed(0)}K</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Volume & Revenue by Pack Size</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.volumeByPack} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="packSize" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="volume" name="Volume (M)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue ($M)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="kpi-card">
              <h3 className="text-sm font-semibold mb-3">Avg Margin by Pack Size</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.marginByPack}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="packSize" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 50]} unit="%" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="margin" name="Avg Margin %" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pack Size Recommendations */}
          <div className="kpi-card">
            <h3 className="text-sm font-semibold mb-3">Pack Size Recommendations</h3>
            <div className="space-y-2">
              {result.packAnalysis.map((p, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{p.packSize}</span>
                        <span className="text-xs text-muted-foreground">{p.skuCount} SKUs • {(p.totalVolume / 1e6).toFixed(1)}M units</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{p.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${recColors[p.recommendation]}`}>{p.recommendation}</Badge>
                      <p className="text-xs font-mono mt-1">{p.avgMargin}% margin</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SKU Detail Table */}
          <div className="kpi-card">
            <h3 className="text-sm font-semibold mb-3">SKU-Level Pack Detail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Pack</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Volume</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Margin</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Rev/Unit</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Action</th>
                </tr></thead>
                <tbody>
                  {result.skuLevelDetail.map(s => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-2"><span className="text-xs font-medium">{s.id}</span><span className="text-xs ml-2 hidden sm:inline text-muted-foreground">{s.name}</span></td>
                      <td className="text-right py-2 text-xs font-mono">{s.packSize}</td>
                      <td className="text-right py-2 text-xs font-mono hidden sm:table-cell">{(s.volume / 1e6).toFixed(1)}M</td>
                      <td className="text-right py-2 text-xs font-mono">{s.margin}%</td>
                      <td className="text-right py-2 text-xs font-mono hidden sm:table-cell">${s.revenuePerUnit}</td>
                      <td className="text-right py-2"><Badge variant="outline" className={`text-[10px] ${recColors[s.recommendation]}`}>{s.recommendation}</Badge></td>
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
