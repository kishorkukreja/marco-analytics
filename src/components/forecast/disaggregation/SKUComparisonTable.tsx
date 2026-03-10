import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Search } from "lucide-react";
import type { DisaggregationForecast } from "@/data/mockData";

interface Props {
  forecasts: DisaggregationForecast[];
  onSKUClick?: (skuId: string) => void;
}

type SortKey = "skuName" | "category" | "currentRevenue" | "totalForecastVolume" | "volumeGrowth" | "forecastConfidence" | "marginContribution" | "riskLevel";

export function SKUComparisonTable({ forecasts, onSKUClick }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("currentRevenue");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = useMemo(() => {
    let data = forecasts;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(f => f.skuName.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.skuId.toLowerCase().includes(q));
    }
    data = [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [forecasts, search, sortKey, sortAsc]);

  const riskBadge = (level: string) => {
    const styles = { low: "bg-accent/15 text-accent", medium: "bg-warning/15 text-warning", high: "bg-destructive/15 text-destructive" };
    return <Badge variant="outline" className={`text-[10px] ${styles[level as keyof typeof styles]}`}>{level}</Badge>;
  };

  const growthColor = (v: number) => v > 5 ? "text-accent" : v < -5 ? "text-destructive" : "text-warning";
  const confColor = (v: number) => v > 85 ? "text-accent" : v > 75 ? "text-warning" : "text-destructive";

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <button onClick={() => handleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="kpi-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">SKU Forecast Comparison</h3>
          <p className="text-xs text-muted-foreground">{filtered.length} SKUs — click to drill down</p>
        </div>
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs"><SortHeader label="SKU" k="skuName" /></TableHead>
              <TableHead className="text-xs"><SortHeader label="Category" k="category" /></TableHead>
              <TableHead className="text-xs text-right"><SortHeader label="Revenue" k="currentRevenue" /></TableHead>
              <TableHead className="text-xs text-right"><SortHeader label="Fcst Vol (12M)" k="totalForecastVolume" /></TableHead>
              <TableHead className="text-xs text-right"><SortHeader label="Growth %" k="volumeGrowth" /></TableHead>
              <TableHead className="text-xs text-right"><SortHeader label="Confidence" k="forecastConfidence" /></TableHead>
              <TableHead className="text-xs text-right"><SortHeader label="Margin $M" k="marginContribution" /></TableHead>
              <TableHead className="text-xs text-center"><SortHeader label="Risk" k="riskLevel" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(fc => (
              <TableRow
                key={fc.skuId}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSKUClick?.(fc.skuId)}
              >
                <TableCell className="text-xs font-medium">{fc.skuName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{fc.category}</TableCell>
                <TableCell className="text-xs text-right font-mono">${(fc.currentRevenue / 1000000).toFixed(1)}M</TableCell>
                <TableCell className="text-xs text-right font-mono">{(fc.totalForecastVolume / 1000).toFixed(0)}K</TableCell>
                <TableCell className={`text-xs text-right font-semibold ${growthColor(fc.volumeGrowth)}`}>
                  {fc.volumeGrowth > 0 ? "+" : ""}{fc.volumeGrowth}%
                </TableCell>
                <TableCell className={`text-xs text-right font-semibold ${confColor(fc.forecastConfidence)}`}>
                  {fc.forecastConfidence}%
                </TableCell>
                <TableCell className="text-xs text-right font-mono">${fc.marginContribution}M</TableCell>
                <TableCell className="text-xs text-center">{riskBadge(fc.riskLevel)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
