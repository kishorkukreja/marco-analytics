import { motion } from "framer-motion";
import { Settings, Users, Database, Bell, Shield, Globe, SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const AdminSettings = () => {
  const [riskThreshold, setRiskThreshold] = useState(40);

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration, thresholds, and user management</p>
      </motion.div>

      {/* Risk Threshold - moved from TopBar */}
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
          <Slider
            value={[riskThreshold]}
            onValueChange={(v) => setRiskThreshold(v[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Materials above {riskThreshold}% risk will be flagged across all screens. Lowering this value will surface more alerts.</p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: "Conservative", value: 25, desc: "More alerts, lower risk tolerance" },
              { label: "Balanced", value: 40, desc: "Recommended for most portfolios" },
              { label: "Aggressive", value: 60, desc: "Fewer alerts, higher risk tolerance" },
            ].map(preset => (
              <button
                key={preset.value}
                onClick={() => setRiskThreshold(preset.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  riskThreshold === preset.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-semibold">{preset.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

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
        <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="kpi-card">
          <div className="flex items-center gap-2 mb-4">
            <section.icon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{section.title}</h3>
          </div>
          <div className="space-y-3">
            {section.items.map((item, j) => (
              <div key={j} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                {item.type === "toggle" ? (
                  <Switch defaultChecked={item.value as boolean} />
                ) : (
                  <span className="text-sm font-medium">{item.value as string}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Users */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="kpi-card">
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
    </div>
  );
};

export default AdminSettings;
