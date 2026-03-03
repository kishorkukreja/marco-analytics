import { motion } from "framer-motion";
import { Database, Cpu, BrainCircuit, Server, ArrowRight, Layers, Shield, Zap } from "lucide-react";

const layers = [
  {
    title: "Data Layer",
    icon: Database,
    color: "bg-primary/10 text-primary border-primary/20",
    items: [
      "SKU Master (8 SKUs × 7 attributes)",
      "Material Master (10 materials × 8 attributes)",
      "Supplier Master (5 suppliers × 6 attributes)",
      "BOM Table (20 mappings)",
      "Historical Cost (120 records, 12 months)",
      "Forecast Dataset (192 records, 24 months)",
      "Logistics Master (9 route configurations)",
    ],
  },
  {
    title: "Logic Layer",
    icon: Cpu,
    color: "bg-accent/10 text-accent border-accent/20",
    items: [
      "Material Similarity Engine (Weighted Euclidean)",
      "Risk Scoring (Variance × Failure Rate × Reliability)",
      "Cost Simulation (7-component landed cost)",
      "MILP Optimization (Margin maximization)",
      "Forecast Confidence (5-factor composite score)",
      "Anomaly Detection (2σ deviation rule)",
    ],
  },
  {
    title: "Intelligence Layer",
    icon: BrainCircuit,
    color: "bg-warning/10 text-warning border-warning/20",
    items: [
      "AI Agent Recommendations",
      "Explainable AI Summaries",
      "Multi-layer Forecast Validation",
      "Monte Carlo Risk Simulation",
      "Scenario Comparison Engine",
    ],
  },
  {
    title: "Presentation Layer",
    icon: Layers,
    color: "bg-secondary/10 text-secondary border-secondary/20",
    items: [
      "Executive Dashboard (KPIs + Charts)",
      "Interactive Simulation Interface",
      "Portfolio Bubble Visualization",
      "Waterfall Cost Breakdown",
      "Client Demo Mode (90s automated)",
      "Export & Reporting",
    ],
  },
];

const ArchitecturePage = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-sm text-muted-foreground mt-1">MarCo 2.0 layered architecture overview</p>
      </motion.div>

      {/* Architecture Diagram */}
      <div className="space-y-4">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`kpi-card border ${layer.color.split(" ")[2]}`}
          >
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

      {/* Technical Specs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-semibold">Performance</h4>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Simulation latency: {"<"}1s</p>
            <p>• Optimization solver: {"<"}3s</p>
            <p>• Forecast refresh: real-time</p>
            <p>• Data throughput: 10K records/s</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">Security</h4>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• SOC 2 Type II compliant</p>
            <p>• AES-256 encryption at rest</p>
            <p>• TLS 1.3 in transit</p>
            <p>• RBAC with SSO integration</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-3">
            <Server className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold">Infrastructure</h4>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Multi-region deployment</p>
            <p>• 99.95% SLA uptime</p>
            <p>• Auto-scaling compute</p>
            <p>• DR: RPO 1hr, RTO 4hr</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ArchitecturePage;
