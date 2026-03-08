import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Users, Database, Bell, Shield, Globe, SlidersHorizontal, Server, Layers, Cpu, BrainCircuit, Zap, ArrowRight, Lightbulb, DollarSign, Target, BarChart3, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/shared/KPICard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── Insights Data ──
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

// ── Architecture Data ──
const layers = [
  { title: "Data Layer", icon: Database, color: "bg-primary/10 text-primary border-primary/20", items: ["SKU Master (8 SKUs × 7 attributes)", "Material Master (10 materials × 8 attributes)", "Supplier Master (5 suppliers × 6 attributes)", "BOM Table (20 mappings)", "Historical Cost (120 records)", "Forecast Dataset (192 records)", "Logistics Master (9 routes)"] },
  { title: "Logic Layer", icon: Cpu, color: "bg-accent/10 text-accent border-accent/20", items: ["Material Similarity Engine", "Risk Scoring", "Cost Simulation (7-component)", "MILP Optimization", "Forecast Confidence (5-factor)", "Anomaly Detection (2σ rule)"] },
  { title: "Intelligence Layer", icon: BrainCircuit, color: "bg-warning/10 text-warning border-warning/20", items: ["AI Agent Recommendations", "Explainable AI Summaries", "Multi-layer Forecast Validation", "Monte Carlo Risk Simulation", "Scenario Comparison Engine"] },
  { title: "Presentation Layer", icon: Layers, color: "bg-secondary/10 text-secondary border-secondary/20", items: ["Executive Dashboard", "Interactive Simulation", "Portfolio Visualization", "Waterfall Cost Breakdown", "Export & Reporting"] },
];

const SettingsPage = () => {
  const [riskThreshold, setRiskThreshold] = useState(40);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration, insights, and system architecture</p>
      </motion.div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="config" className="text-xs gap-1.5"><Settings className="h-3.5 w-3.5" />Configuration</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs gap-1.5"><Lightbulb className="h-3.5 w-3.5" />Insights & Value</TabsTrigger>
          <TabsTrigger value="architecture" className="text-xs gap-1.5"><Server className="h-3.5 w-3.5" />Architecture</TabsTrigger>
        </TabsList>

        {/* ── Configuration Tab ── */}
        <TabsContent value="config" className="space-y-4">
          {/* Risk Threshold */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="kpi-card">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Risk Threshold Configuration</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Global Risk Threshold</span>
                <span className="text-sm font-bold text-primary">{riskThreshold}%</span>
              </div>
              <Slider value={[riskThreshold]} onValueChange={(v) => setRiskThreshold(v[0])} max={100} min={0} step={5} className="w-full" />
              <p className="text-xs text-muted-foreground">Materials above {riskThreshold}% risk will be flagged across all screens.</p>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { label: "Conservative", value: 25, desc: "More alerts, lower risk tolerance" },
                  { label: "Balanced", value: 40, desc: "Recommended for most portfolios" },
                  { label: "Aggressive", value: 60, desc: "Fewer alerts, higher risk tolerance" },
                ].map(preset => (
                  <button key={preset.value} onClick={() => setRiskThreshold(preset.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${riskThreshold === preset.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <p className="text-xs font-semibold">{preset.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Settings sections */}
          {[
            { icon: Globe, title: "General", items: [
              { label: "Platform Name", value: "MarCo 2.0 – Simulation & Forecast Intelligence", type: "text" },
              { label: "Default Region", value: "EMEA", type: "text" },
              { label: "Currency", value: "USD", type: "text" },
              { label: "Timezone", value: "UTC+1 (CET)", type: "text" },
            ]},
            { icon: Shield, title: "Security & Access", items: [
              { label: "SSO Enabled", value: true, type: "toggle" },
              { label: "MFA Required", value: true, type: "toggle" },
              { label: "Session Timeout", value: "30 min", type: "text" },
              { label: "IP Allowlisting", value: false, type: "toggle" },
            ]},
            { icon: Database, title: "Data Management", items: [
              { label: "Auto-refresh Interval", value: "5 min", type: "text" },
              { label: "Data Retention", value: "24 months", type: "text" },
              { label: "Export Format", value: "CSV, PDF, XLSX", type: "text" },
              { label: "Audit Logging", value: true, type: "toggle" },
            ]},
            { icon: Bell, title: "Notifications", items: [
              { label: "Risk Alerts", value: true, type: "toggle" },
              { label: "Optimization Complete", value: true, type: "toggle" },
              { label: "Forecast Anomalies", value: true, type: "toggle" },
              { label: "Email Digest", value: false, type: "toggle" },
            ]},
          ].map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }} className="kpi-card">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">{section.title}</h3>
              </div>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    {item.type === "toggle" ? <Switch defaultChecked={item.value as boolean} /> : <span className="text-sm font-medium">{item.value as string}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Users */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="kpi-card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Active Users</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">12 users</Badge>
            </div>
            <div className="space-y-2">
              {[
                { name: "Sarah Chen", role: "Admin", dept: "Supply Chain", last: "2 min ago" },
                { name: "Marco Rodriguez", role: "Analyst", dept: "Procurement", last: "15 min ago" },
                { name: "Lisa Wang", role: "Viewer", dept: "Finance", last: "1 hr ago" },
                { name: "James Park", role: "Analyst", dept: "R&D", last: "3 hr ago" },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                    <span className="text-[10px] text-muted-foreground">{user.last}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Insights & Value Tab ── */}
        <TabsContent value="insights" className="space-y-4">
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
                <p className="text-[10px] text-muted-foreground mt-1">+2.7% margin uplift with acceptable risk. Requires supplier consolidation.</p>
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
                      step.status === "approved" ? "bg-accent/10 text-accent" : step.status === "pending" ? "bg-warning/10 text-warning animate-pulse" : "bg-muted text-muted-foreground"
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
        </TabsContent>

        {/* ── Architecture Tab ── */}
        <TabsContent value="architecture" className="space-y-4">
          <div className="space-y-4">
            {layers.map((layer, i) => (
              <motion.div key={layer.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`kpi-card border ${layer.color.split(" ")[2]}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${layer.color.split(" ").slice(0, 2).join(" ")}`}>
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-2">{layer.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                      {layer.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {i < layers.length - 1 && (
                  <div className="flex justify-center mt-3">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-3"><Zap className="h-4 w-4 text-accent" /><h4 className="text-sm font-semibold">Performance</h4></div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Simulation latency: {"<"}1s</p><p>• Optimization solver: {"<"}3s</p><p>• Forecast refresh: real-time</p><p>• Data throughput: 10K records/s</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-primary" /><h4 className="text-sm font-semibold">Security</h4></div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• SOC 2 Type II compliant</p><p>• AES-256 encryption at rest</p><p>• TLS 1.3 in transit</p><p>• RBAC with SSO integration</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-3"><Server className="h-4 w-4 text-warning" /><h4 className="text-sm font-semibold">Infrastructure</h4></div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Multi-region deployment</p><p>• 99.95% SLA uptime</p><p>• Auto-scaling compute</p><p>• DR: RPO 1hr, RTO 4hr</p>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;