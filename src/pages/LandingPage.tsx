import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap, BarChart3, FlaskConical, BrainCircuit, TrendingUp, TrendingDown,
  ArrowRight, Shield, Activity, DollarSign, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardKPIs, skuAlerts, trendData } from "@/data/mockData";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useCountUp } from "@/hooks/useCountUp";

function AnimatedKPI({ value, prefix = "", suffix = "", decimals = 0, delay = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number; delay?: number }) {
  const count = useCountUp(value, 1400, delay);
  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

const LandingPage = () => {
  const navigate = useNavigate();

  const criticalAlerts = skuAlerts.filter(a => a.severity === "high").length;
  const latestTrend = trendData[trendData.length - 1];
  const prevTrend = trendData[trendData.length - 2];
  const revGrowth = +((latestTrend.revenue - prevTrend.revenue) / prevTrend.revenue * 100).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.07]"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          style={{
            background: `
              radial-gradient(ellipse 600px 400px at 20% 30%, hsl(var(--primary)) 0%, transparent 70%),
              radial-gradient(ellipse 500px 350px at 70% 60%, hsl(var(--accent)) 0%, transparent 70%),
              radial-gradient(ellipse 400px 300px at 50% 80%, hsl(var(--chart-3)) 0%, transparent 70%)
            `,
          }}
        />
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-[0.05]"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `
              radial-gradient(ellipse 500px 500px at 80% 20%, hsl(var(--accent)) 0%, transparent 60%),
              radial-gradient(ellipse 400px 400px at 20% 70%, hsl(var(--primary)) 0%, transparent 60%)
            `,
          }}
        />
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          animate={{
            scale: [1.1, 1, 1.1],
            x: [-20, 20, -20],
            y: [10, -10, 10],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `
              radial-gradient(ellipse 350px 350px at 60% 40%, hsl(var(--chart-3)) 0%, transparent 60%),
              radial-gradient(ellipse 300px 300px at 30% 50%, hsl(var(--secondary)) 0%, transparent 60%)
            `,
          }}
        />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl enterprise-gradient flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-foreground">MarCo 2.0</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Margin & Cost Intelligence</p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4">
              Intelligent Margin
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                & Cost Optimization
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mb-6 sm:mb-8">
              End-to-end visibility across formulation costs, supply chain logistics, and demand signals — 
              powered by scenario simulation and predictive intelligence to protect and grow margins.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => navigate("/dashboard")}>
                <BarChart3 className="h-4 w-4" />
                Open Dashboard
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/simulation")}>
                <FlaskConical className="h-4 w-4" />
                Run Simulation
              </Button>
            </div>
          </motion.div>

          {/* Hero KPI strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10"
          >
            {[
              { label: "Portfolio Revenue", numValue: dashboardKPIs.totalRevenue / 1e6, prefix: "$", suffix: "M", decimals: 1, icon: DollarSign, trend: revGrowth, color: "text-accent" },
              { label: "Avg Gross Margin", numValue: dashboardKPIs.avgMargin, suffix: "%", decimals: 1, icon: TrendingUp, trend: 1.2, color: "text-accent" },
              { label: "Identified Savings", numValue: dashboardKPIs.identifiedSavings / 1e6, prefix: "$", suffix: "M", decimals: 1, icon: Activity, trend: 14, color: "text-accent" },
              { label: "Active Risk Alerts", numValue: criticalAlerts, decimals: 0, icon: AlertTriangle, trend: null, color: "text-warning" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="kpi-card !p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/5">
                    <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                  </div>
                  {kpi.trend !== null && (
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.trend >= 0 ? "text-accent" : "text-destructive"}`}>
                      {kpi.trend >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {kpi.trend >= 0 ? "+" : ""}{kpi.trend}%
                    </span>
                  )}
                  {kpi.trend === null && <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px]">Attention</Badge>}
                </div>
                <p className="text-xl font-bold text-foreground">
                  <AnimatedKPI value={kpi.numValue} prefix={kpi.prefix || ""} suffix={kpi.suffix || ""} decimals={kpi.decimals} delay={400 + i * 100} />
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== MODULE CARDS ===== */}
      <section className="max-w-[1400px] mx-auto px-6 pb-12 flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold tracking-tight">Command Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Navigate to any module to take action</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Dashboard",
              description: "Portfolio-wide P&L visibility with SKU-level drill-down, cost trends, and margin analysis across all categories and regions.",
              icon: BarChart3,
              route: "/dashboard",
              metric: { label: "SKUs Tracked", value: dashboardKPIs.totalSKUs.toString() },
              action: "View Dashboard",
              accent: "bg-primary/5 border-primary/20 hover:border-primary/40",
              iconBg: "bg-primary/10 text-primary",
            },
            {
              title: "Simulation Engine",
              description: "Scenario-driven material substitution with multi-metric Monte Carlo analysis across service level, margin, profitability, and lead time.",
              icon: FlaskConical,
              route: "/simulation",
              metric: { label: "Active Simulations", value: dashboardKPIs.activeSimulations.toString() },
              action: "Run Simulation",
              accent: "bg-accent/5 border-accent/20 hover:border-accent/40",
              iconBg: "bg-accent/10 text-accent",
            },
            {
              title: "Forecast Intelligence",
              description: "Multi-heuristic demand forecasting with confidence scoring, anomaly detection, and scenario-adjusted projections.",
              icon: BrainCircuit,
              route: "/forecast",
              metric: { label: "Forecast Accuracy", value: `${dashboardKPIs.forecastAccuracy}%` },
              action: "View Forecasts",
              accent: "bg-chart-3/5 border-chart-3/20 hover:border-chart-3/40",
              iconBg: "bg-chart-3/10 text-chart-3",
            },
          ].map((mod, i) => (
            <motion.button
              key={mod.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              onClick={() => navigate(mod.route)}
              className={`text-left rounded-xl border p-5 transition-all group ${mod.accent} hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${mod.iconBg}`}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>

              <h3 className="text-sm font-bold mb-1.5">{mod.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">{mod.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div>
                  <p className="text-lg font-bold text-foreground">{mod.metric.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{mod.metric.label}</p>
                </div>
                <span className="text-[10px] font-medium text-primary group-hover:underline">{mod.action} →</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Mini revenue sparkline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 kpi-card !p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold">Revenue vs Cost — 12 Month Trend</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Portfolio-level overview</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] text-muted-foreground">Margin %</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="heroRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="heroMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#heroRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="margin" stroke="hsl(var(--accent))" fill="url(#heroMargin)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Footer tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em]">Enterprise-grade margin intelligence</span>
            <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
          <p className="text-[10px] text-muted-foreground/40">
            {dashboardKPIs.optimizationRuns} optimization runs completed • {dashboardKPIs.activeSimulations} active simulations • {dashboardKPIs.forecastAccuracy}% forecast accuracy
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
