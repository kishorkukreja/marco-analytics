import { motion } from "framer-motion";
import { Settings, Users, Database, Bell, Shield, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and user management</p>
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
        <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="kpi-card">
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
