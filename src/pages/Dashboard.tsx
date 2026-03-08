import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Target, AlertCircle, Lightbulb, BarChart3, ChevronDown, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { GlobalFilters, FilterState, defaultFilters, filterSKUs } from "@/components/shared/GlobalFilters";
import { InlineNudge } from "@/components/shared/InlineNudge";
import { dashboardKPIs, skuMaster, trendData, savingsByCategory, skuAlerts, SKUAlert, bomTable, materialMaster, costOverTime, serviceLevelData, marginByChannel, costByRegion } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from "recharts";

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

// SKU-level actions, decisions, next steps
function getSKUContext(skuId: string) {
  const alerts = skuAlerts.filter(a => a.skuId === skuId);
  const materials = bomTable.filter(b => b.skuId === skuId).map(b => materialMaster.find(m => m.id === b.materialId)!);
  const sku = skuMaster.find(s => s.id === skuId)!;

  const actions: { label: string; status: "pending" | "in_progress" | "done"; owner: string }[] = [];
  const decisions: { label: string; status: "approved" | "pending" | "rejected" }[] = [];
  const nextSteps: string[] = [];

  if (alerts.some(a => a.type === "margin_erosion")) {
    actions.push({ label: "Run substitution simulation for cost optimization", status: "pending", owner: "Procurement" });
    actions.push({ label: "Review pricing strategy for margin recovery", status: "pending", owner: "Finance" });
    decisions.push({ label: "Approve margin recovery plan", status: "pending" });
    nextSteps.push("Identify top 2 material substitutes and run landed cost simulation");
  }
  if (alerts.some(a => a.type === "cost_spike")) {
    actions.push({ label: "Negotiate with current supplier for volume discount", status: "in_progress", owner: "Procurement" });
    actions.push({ label: "Evaluate alternate suppliers for affected materials", status: "pending", owner: "Supply Chain" });
    decisions.push({ label: "Approve alternate supplier qualification", status: "pending" });
    nextSteps.push("Complete supplier RFQ by end of month");
  }
  if (alerts.some(a => a.type === "substitution_opportunity")) {
    actions.push({ label: "Validate substitute material in R&D lab", status: "in_progress", owner: "R&D" });
    actions.push({ label: "Run full cost simulation with substitute", status: "done", owner: "Analytics" });
    decisions.push({ label: "R&D approval for material switch", status: "pending" });
    nextSteps.push("Await R&D validation results, then proceed to procurement approval");
  }
  if (alerts.some(a => a.type === "forecast_deviation")) {
    actions.push({ label: "Review demand signals and adjust forecast", status: "in_progress", owner: "Demand Planning" });
    decisions.push({ label: "Accept adjusted forecast for next cycle", status: "pending" });
    nextSteps.push("Apply seasonal correction based on LY benchmark");
  }

  if (actions.length === 0) {
    actions.push({ label: "No immediate actions required", status: "done", owner: "—" });
    decisions.push({ label: "SKU performing within targets", status: "approved" });
    nextSteps.push("Continue monitoring KPIs and forecast accuracy");
  }

  return { alerts, actions, decisions, nextSteps, materials };
}

const statusIcon = {
  pending: <Clock className="h-3 w-3 text-warning" />,
  in_progress: <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />,
  done: <CheckCircle2 className="h-3 w-3 text-accent" />,
  approved: <CheckCircle2 className="h-3 w-3 text-accent" />,
  rejected: <AlertTriangle className="h-3 w-3 text-destructive" />,
};

const Dashboard = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [expandedSKU, setExpandedSKU] = useState<string | null>(null);
  const filteredSKUs = useMemo(() => filterSKUs(filters), [filters]);

  const filteredKPIs = useMemo(() => {
    const rev = filteredSKUs.reduce((s, sku) => s + sku.revenue, 0);
    const margin = filteredSKUs.length > 0 ? +(filteredSKUs.reduce((s, sku) => s + sku.currentMargin, 0) / filteredSKUs.length).toFixed(1) : 0;
    return { revenue: rev, margin, skuCount: filteredSKUs.length };
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

      {/* Nudge */}
      <InlineNudge
        variant="opportunity"
        message="3 SKUs have viable material substitutes that could unlock $530K+ in annual savings. Click any SKU below to see detailed actions and next steps."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} title="Total Revenue" value={`$${(filteredKPIs.revenue / 1e6).toFixed(1)}M`} trend={{ value: 8.2, label: "vs LY" }} delay={0} />
        <KPICard icon={TrendingUp} title="Avg Gross Margin" value={`${filteredKPIs.margin}%`} trend={{ value: 2.4, label: "vs LY" }} variant="accent" delay={0.05} />
        <KPICard icon={Target} title="Identified Savings" value={`$${(dashboardKPIs.identifiedSavings / 1e6).toFixed(1)}M`} subtitle="Across 14 active simulations" variant="accent" delay={0.1} />
        <KPICard icon={AlertTriangle} title="Active Alerts" value={`${filteredAlerts.length}`} subtitle={`${filteredAlerts.filter(a => a.severity === "high").length} high severity`} variant={filteredAlerts.some(a => a.severity === "high") ? "warning" : "default"} delay={0.15} />
      </div>

      {/* SKU Accordion */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kpi-card">
        <h3 className="text-sm font-semibold mb-3">SKU Performance Overview</h3>
        <div className="space-y-1">
          {filteredSKUs.map(sku => {
            const isExpanded = expandedSKU === sku.id;
            const skuAlertCount = skuAlerts.filter(a => a.skuId === sku.id).length;
            const hasHighAlert = skuAlerts.some(a => a.skuId === sku.id && a.severity === "high");
            const ctx = getSKUContext(sku.id);

            return (
              <div key={sku.id} className={`rounded-lg border transition-all ${isExpanded ? "border-primary/30 bg-primary/[0.02]" : "border-border/50 hover:border-border"}`}>
                {/* Header row */}
                <button
                  onClick={() => setExpandedSKU(isExpanded ? null : sku.id)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{sku.id}</span>
                        <span className="text-xs text-muted-foreground">{sku.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{sku.brand} • {sku.category} • {sku.region}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-xs font-semibold">${(sku.revenue / 1e6).toFixed(1)}M</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className={`text-xs font-bold ${sku.currentMargin > 35 ? "text-accent" : sku.currentMargin > 28 ? "text-foreground" : "text-destructive"}`}>
                        {sku.currentMargin}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Volume</p>
                      <p className="text-xs font-semibold">{(sku.annualVolume / 1e6).toFixed(1)}M</p>
                    </div>
                    <div className="w-16 text-center">
                      {hasHighAlert ? (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]">{skuAlertCount} Alert{skuAlertCount > 1 ? "s" : ""}</Badge>
                      ) : skuAlertCount > 0 ? (
                        <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px]">{skuAlertCount} Alert{skuAlertCount > 1 ? "s" : ""}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-accent border-accent/30">Healthy</Badge>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-border/30">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                          {/* Alerts */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Alerts</p>
                            {ctx.alerts.length > 0 ? (
                              <div className="space-y-1.5">
                                {ctx.alerts.map(alert => {
                                  const config = alertTypeConfig[alert.type];
                                  const Icon = config.icon;
                                  return (
                                    <div key={alert.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                                      <Icon className={`h-3 w-3 mt-0.5 ${config.color}`} />
                                      <div className="flex-1">
                                        <p className="text-[11px] font-medium">{alert.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{alert.description}</p>
                                        <div className="flex items-center justify-between mt-1">
                                          <Badge className={`text-[8px] border ${severityStyles[alert.severity]}`}>{alert.severity}</Badge>
                                          <span className={`text-[10px] font-bold ${alert.type === "substitution_opportunity" ? "text-accent" : "text-destructive"}`}>{alert.impact}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground p-2 bg-muted/30 rounded-md">No active alerts for this SKU.</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Actions</p>
                            <div className="space-y-1.5">
                              {ctx.actions.map((action, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                                  {statusIcon[action.status]}
                                  <div className="flex-1">
                                    <p className="text-[11px]">{action.label}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] text-muted-foreground">Owner: {action.owner}</span>
                                      <Badge variant="outline" className="text-[8px] capitalize">{action.status.replace("_", " ")}</Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Decisions */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Decisions</p>
                            <div className="space-y-1.5">
                              {ctx.decisions.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                                  {statusIcon[d.status]}
                                  <span className="text-[11px] flex-1">{d.label}</span>
                                  <Badge variant="outline" className="text-[8px] capitalize">{d.status}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Next Steps */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Next Steps</p>
                            <div className="space-y-1.5">
                              {ctx.nextSteps.map((step, i) => (
                                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                                  <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                  <p className="text-[11px]">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Trend + Savings */}
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
    </div>
  );
};

export default Dashboard;
