import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Package, AlertTriangle, Target, ArrowRight, AlertCircle, Lightbulb, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { InlineNudge } from "@/components/shared/InlineNudge";
import { dashboardKPIs, skuMaster, trendData, savingsByCategory, skuAlerts, SKUAlert } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const alertTypeConfig: Record<SKUAlert["type"], { icon: typeof AlertTriangle; color: string; label: string }> = {
  margin_erosion: { icon: TrendingDown, color: "text-destructive", label: "Margin" },
  cost_spike: { icon: AlertCircle, color: "text-warning", label: "Cost" },
  substitution_opportunity: { icon: Lightbulb, color: "text-accent", label: "Opportunity" },
  forecast_deviation: { icon: BarChart3, color: "text-primary", label: "Forecast" },
};

const severityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-accent/10 text-accent border-accent/20",
};

const Dashboard = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);

  const filteredKPIs = useMemo(() => {
    const rev = filteredSKUs.reduce((s, sku) => s + sku.revenue, 0);
    const margin = filteredSKUs.length > 0 ? +(filteredSKUs.reduce((s, sku) => s + sku.currentMargin, 0) / filteredSKUs.length).toFixed(1) : 0;
    const totalCost = rev * (1 - margin / 100);
    return { revenue: rev, margin, cost: totalCost, skuCount: filteredSKUs.length };
  }, [filteredSKUs]);

  const filteredAlerts = useMemo(() => {
    const skuIds = new Set(filteredSKUs.map(s => s.id));
    return skuAlerts.filter(a => skuIds.has(a.skuId));
  }, [filteredSKUs]);

  const filteredSavings = useMemo(() => {
    if (!filters.category) return savingsByCategory;
    return savingsByCategory.filter(s => s.category === filters.category);
  }, [filters.category]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header + Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Executive Summary</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Portfolio overview across {filteredKPIs.skuCount} SKU{filteredKPIs.skuCount !== 1 ? "s" : ""} • Real-time insights
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Last updated: 2 min ago</p>
        </div>
        <div className="kpi-card !p-3">
          <GlobalFilters filters={filters} onChange={setFilters} />
        </div>
      </motion.div>

      {/* Inline nudge */}
      <InlineNudge
        variant="opportunity"
        message="3 SKUs have viable material substitutes that could unlock $530K+ in annual savings. SKU-001 (LAS → AOS) has the highest potential at $320K."
        action="Open Simulation Engine"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} title="Total Revenue" value={`$${(filteredKPIs.revenue / 1e6).toFixed(1)}M`} trend={{ value: 8.2, label: "vs LY" }} delay={0} />
        <KPICard icon={TrendingUp} title="Avg Gross Margin" value={`${filteredKPIs.margin}%`} trend={{ value: 2.4, label: "vs LY" }} variant="accent" delay={0.05} />
        <KPICard icon={Target} title="Identified Savings" value={`$${(dashboardKPIs.identifiedSavings / 1e6).toFixed(1)}M`} subtitle="Across 14 active simulations" variant="accent" delay={0.1} />
        <KPICard icon={AlertTriangle} title="Active Alerts" value={`${filteredAlerts.length}`} subtitle={`${filteredAlerts.filter(a => a.severity === "high").length} high severity`} variant={filteredAlerts.some(a => a.severity === "high") ? "warning" : "default"} delay={0.15} />
      </div>

      {/* SKU-level KPI Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kpi-card">
        <h3 className="text-sm font-semibold mb-3">SKU Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground font-medium">SKU</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Brand</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Category</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Revenue</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Margin</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Volume</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSKUs.map(sku => {
                const hasAlert = skuAlerts.some(a => a.skuId === sku.id && a.severity === "high");
                return (
                  <tr key={sku.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{sku.id}</td>
                    <td className="py-2.5">{sku.brand}</td>
                    <td className="py-2.5">{sku.category}</td>
                    <td className="py-2.5 text-right font-medium">${(sku.revenue / 1e6).toFixed(1)}M</td>
                    <td className={`py-2.5 text-right font-bold ${sku.currentMargin > 35 ? "text-accent" : sku.currentMargin > 28 ? "text-foreground" : "text-destructive"}`}>
                      {sku.currentMargin}%
                    </td>
                    <td className="py-2.5 text-right">{(sku.annualVolume / 1e6).toFixed(1)}M</td>
                    <td className="py-2.5 text-center">
                      {hasAlert ? (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]">Alert</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-accent border-accent/30">Healthy</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Trend + Savings row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 kpi-card">
          <h3 className="text-sm font-semibold mb-4">Cost, Revenue & Margin Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 62%, 14%)" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="hsl(213, 62%, 14%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" domain={[20, 45]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(213, 62%, 14%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue ($M)" />
              <Area yAxisId="left" type="monotone" dataKey="totalCost" stroke="hsl(0, 72%, 51%)" fill="url(#costGrad)" strokeWidth={1.5} strokeDasharray="4 4" name="Cost ($M)" />
              <Area yAxisId="right" type="monotone" dataKey="margin" stroke="hsl(160, 64%, 40%)" fill="none" strokeWidth={2} name="Margin (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="kpi-card">
          <h3 className="text-sm font-semibold mb-4">Savings by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredSavings} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" width={85} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Bar dataKey="realized" fill="hsl(160, 64%, 40%)" radius={[0, 4, 4, 0]} name="Realized" />
              <Bar dataKey="potential" fill="hsl(214, 20%, 90%)" radius={[0, 4, 4, 0]} name="Potential" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">SKU Alerts & Actions Required</h3>
          <Badge variant="outline" className="text-[10px]">{filteredAlerts.length} active</Badge>
        </div>
        <div className="space-y-2">
          {filteredAlerts.map(alert => {
            const config = alertTypeConfig[alert.type];
            const Icon = config.icon;
            return (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className={`p-1.5 rounded-md ${alert.severity === "high" ? "bg-destructive/10" : alert.severity === "medium" ? "bg-warning/10" : "bg-accent/10"}`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{alert.title}</span>
                    <Badge className={`text-[9px] border ${severityStyles[alert.severity]}`}>{alert.severity}</Badge>
                    <Badge variant="outline" className="text-[9px]">{alert.skuId}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{alert.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${alert.type === "substitution_opportunity" ? "text-accent" : "text-destructive"}`}>{alert.impact}</p>
                  <p className="text-[10px] text-muted-foreground">{alert.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
