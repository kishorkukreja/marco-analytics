import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const roiProjection = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  cumSavings: Math.round(195000 * (i + 1) * (1 + i * 0.02)),
  target: 195000 * (i + 1),
}));

const scenarioComparison = [
  { metric: "Material Cost", current: 4.2, scenarioA: 3.8, scenarioB: 3.5 },
  { metric: "Freight", current: 0.8, scenarioA: 1.1, scenarioB: 0.9 },
  { metric: "Duty", current: 0.2, scenarioA: 0.4, scenarioB: 0.15 },
  { metric: "Total Landed", current: 5.8, scenarioA: 5.9, scenarioB: 5.1 },
  { metric: "Gross Margin %", current: 32.4, scenarioA: 31.8, scenarioB: 35.1 },
];

const InsightsPage = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Insights & Value</h1>
        <p className="text-sm text-muted-foreground mt-1">Measurable business impact and ROI tracking</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} title="Total Realized Savings" value="$2.34M" trend={{ value: 12.4, label: "vs target" }} variant="accent" delay={0} />
        <KPICard icon={TrendingUp} title="Portfolio Margin Uplift" value="+2.1%" subtitle="Across optimized SKUs" delay={0.05} />
        <KPICard icon={Target} title="Forecast Accuracy Gain" value="+4.2%" subtitle="Post AI agent deployment" variant="accent" delay={0.1} />
        <KPICard icon={BarChart3} title="Cost Avoidance" value="$890K" subtitle="Through proactive substitution" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kpi-card">
          <h3 className="text-sm font-semibold mb-4">12-Month ROI Projection</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={roiProjection}>
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 64%, 40%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(160, 64%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Area type="monotone" dataKey="cumSavings" stroke="hsl(160, 64%, 40%)" fill="url(#savGrad)" strokeWidth={2} name="Cumulative Savings" />
              <Area type="monotone" dataKey="target" stroke="hsl(215, 16%, 47%)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="kpi-card">
          <h3 className="text-sm font-semibold mb-4">Scenario Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Current</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Scenario A</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Scenario B</th>
                </tr>
              </thead>
              <tbody>
                {scenarioComparison.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2.5 font-medium">{row.metric}</td>
                    <td className="text-right">{row.metric.includes("%") ? `${row.current}%` : `$${row.current}M`}</td>
                    <td className={`text-right font-medium ${row.scenarioA < row.current ? "text-accent" : row.scenarioA > row.current && !row.metric.includes("Margin") ? "text-destructive" : ""}`}>
                      {row.metric.includes("%") ? `${row.scenarioA}%` : `$${row.scenarioA}M`}
                    </td>
                    <td className={`text-right font-bold ${row.scenarioB < row.current && !row.metric.includes("Margin") ? "text-accent" : row.metric.includes("Margin") && row.scenarioB > row.current ? "text-accent" : ""}`}>
                      {row.metric.includes("%") ? `${row.scenarioB}%` : `$${row.scenarioB}M`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs font-medium text-accent">Recommendation: Scenario B</p>
            <p className="text-[10px] text-muted-foreground mt-1">+2.7% margin uplift with acceptable risk. Requires supplier consolidation with ChemCorp Global.</p>
          </div>
        </motion.div>
      </div>

      {/* Approval Workflow */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="kpi-card">
        <h3 className="text-sm font-semibold mb-4">Approval Workflow Simulation</h3>
        <div className="flex items-center justify-between">
          {[
            { dept: "R&D", status: "approved", by: "Dr. Chen", date: "Feb 28" },
            { dept: "Procurement", status: "approved", by: "M. Rodriguez", date: "Mar 1" },
            { dept: "Finance", status: "pending", by: "—", date: "—" },
            { dept: "Regulatory", status: "queued", by: "—", date: "—" },
          ].map((step, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center ${i > 0 ? "ml-4" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === "approved" ? "bg-accent/10 text-accent" :
                  step.status === "pending" ? "bg-warning/10 text-warning animate-pulse" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step.status === "approved" ? "✓" : step.status === "pending" ? "⏳" : "·"}
                </div>
                <p className="text-xs font-medium mt-2">{step.dept}</p>
                <p className="text-[10px] text-muted-foreground">{step.by}</p>
                <p className="text-[10px] text-muted-foreground">{step.date}</p>
              </div>
              {i < 3 && <div className={`w-16 h-0.5 ml-4 ${step.status === "approved" ? "bg-accent" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default InsightsPage;
