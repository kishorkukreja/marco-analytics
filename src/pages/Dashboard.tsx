import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Package, AlertTriangle, Activity, Cpu, Target, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { dashboardKPIs, skuMaster, forecastData } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell } from "recharts";

const revenueByMonth = [
  { month: "Jul", revenue: 7.2, margin: 31.2 },
  { month: "Aug", revenue: 8.1, margin: 32.8 },
  { month: "Sep", revenue: 7.8, margin: 30.5 },
  { month: "Oct", revenue: 9.2, margin: 33.4 },
  { month: "Nov", revenue: 10.1, margin: 35.1 },
  { month: "Dec", revenue: 11.4, margin: 34.8 },
  { month: "Jan", revenue: 8.5, margin: 32.1 },
  { month: "Feb", revenue: 9.0, margin: 33.6 },
  { month: "Mar", revenue: 9.8, margin: 34.2 },
  { month: "Apr", revenue: 10.5, margin: 35.8 },
  { month: "May", revenue: 11.2, margin: 36.1 },
  { month: "Jun", revenue: 10.8, margin: 35.4 },
];

const portfolioData = skuMaster.map(sku => ({
  name: sku.name.split(" ").slice(0, 2).join(" "),
  margin: sku.currentMargin,
  risk: 10 + Math.random() * 50,
  volume: sku.annualVolume / 100000,
  id: sku.id,
}));

const savingsByCategory = [
  { category: "Laundry", savings: 890000, potential: 1200000 },
  { category: "Dishwash", savings: 340000, potential: 520000 },
  { category: "Personal Care", savings: 620000, potential: 780000 },
  { category: "Home Care", savings: 490000, potential: 640000 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time portfolio intelligence across 8 SKUs • 4 regions</p>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: 2 min ago</p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} title="Total Revenue" value={`$${(dashboardKPIs.totalRevenue / 1e6).toFixed(1)}M`} trend={{ value: 8.2, label: "vs LY" }} delay={0} />
        <KPICard icon={TrendingUp} title="Avg Gross Margin" value={`${dashboardKPIs.avgMargin}%`} trend={{ value: 2.4, label: "vs LY" }} variant="accent" delay={0.05} />
        <KPICard icon={Target} title="Identified Savings" value={`$${(dashboardKPIs.identifiedSavings / 1e6).toFixed(1)}M`} subtitle="Across 14 active simulations" variant="accent" delay={0.1} />
        <KPICard icon={AlertTriangle} title="Risk Alerts" value={`${dashboardKPIs.riskAlerts}`} subtitle="Materials above threshold" variant="warning" delay={0.15} />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Package} title="Active SKUs" value={`${dashboardKPIs.totalSKUs}`} delay={0.2} />
        <KPICard icon={Activity} title="Forecast Accuracy" value={`${dashboardKPIs.forecastAccuracy}%`} trend={{ value: 1.8, label: "vs LQ" }} delay={0.25} />
        <KPICard icon={Cpu} title="Optimization Runs" value={`${dashboardKPIs.optimizationRuns}`} subtitle="This quarter" delay={0.3} />
        <KPICard icon={BarChart3} title="Active Simulations" value={`${dashboardKPIs.activeSimulations}`} delay={0.35} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 kpi-card">
          <h3 className="text-sm font-semibold mb-4">Revenue & Margin Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 62%, 14%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(213, 62%, 14%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(213, 62%, 14%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue ($M)" />
              <Area type="monotone" dataKey="margin" stroke="hsl(160, 64%, 40%)" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Margin (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Savings by Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="kpi-card">
          <h3 className="text-sm font-semibold mb-4">Savings by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={savingsByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `$${(v/1000).toFixed(0)}K`} />
              <Bar dataKey="savings" fill="hsl(160, 64%, 40%)" radius={[0, 4, 4, 0]} name="Realized" />
              <Bar dataKey="potential" fill="hsl(214, 20%, 90%)" radius={[0, 4, 4, 0]} name="Potential" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Portfolio View */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Portfolio View — Margin vs Risk vs Volume</h3>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Bubble size = Annual Volume</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="risk" name="Risk Score" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" label={{ value: "Risk Score (%)", position: "bottom", fontSize: 11 }} />
            <YAxis dataKey="margin" name="Margin" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" label={{ value: "Gross Margin (%)", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <ZAxis dataKey="volume" range={[200, 1200]} name="Volume" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value: number, name: string) => [name === "Volume" ? `${value.toFixed(0)}K units` : `${value.toFixed(1)}%`, name]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
            />
            <Scatter data={portfolioData} fill="hsl(213, 62%, 14%)">
              {portfolioData.map((entry, i) => (
                <Cell key={i} fill={entry.risk > 40 ? "hsl(38, 92%, 50%)" : entry.risk > 25 ? "hsl(213, 62%, 14%)" : "hsl(160, 64%, 40%)"} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default Dashboard;
