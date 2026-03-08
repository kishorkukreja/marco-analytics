import { useState, useRef, useEffect } from "react";
import { Bell, User, SlidersHorizontal, AlertTriangle, TrendingDown, AlertCircle, Lightbulb, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { skuAlerts, SKUAlert } from "@/data/mockData";

const alertTypeConfig: Record<SKUAlert["type"], { icon: typeof AlertTriangle; color: string }> = {
  margin_erosion: { icon: TrendingDown, color: "text-destructive" },
  cost_spike: { icon: AlertCircle, color: "text-warning" },
  substitution_opportunity: { icon: Lightbulb, color: "text-accent" },
  forecast_deviation: { icon: BarChart3, color: "text-primary" },
};

const severityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-accent",
};

export function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeAlerts = skuAlerts.filter(a => !dismissed.has(a.id));
  const highCount = activeAlerts.filter(a => a.severity === "high").length;
  const medCount = activeAlerts.filter(a => a.severity === "medium").length;

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-6 w-px bg-border" />
        <span className="text-sm font-medium text-foreground">Global CPG Portfolio</span>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Live</Badge>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-destructive-foreground">{activeAlerts.length}</span>
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[360px] p-0" align="end">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Notifications</p>
                <div className="flex gap-1">
                  {highCount > 0 && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]">{highCount} critical</Badge>}
                  {medCount > 0 && <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px]">{medCount} medium</Badge>}
                </div>
              </div>
              {dismissed.size > 0 && (
                <button onClick={() => setDismissed(new Set())} className="text-[10px] text-muted-foreground hover:text-foreground">
                  Restore all
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">All caught up! No active alerts.</p>
                </div>
              ) : (
                activeAlerts.map(alert => {
                  const config = alertTypeConfig[alert.type];
                  const Icon = config.icon;
                  return (
                    <div key={alert.id} className="flex items-start gap-2.5 p-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="relative mt-0.5">
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                        <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${severityDot[alert.severity]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{alert.title}</span>
                          <Badge variant="outline" className="text-[8px] shrink-0">{alert.skuId}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-semibold ${alert.type === "substitution_opportunity" ? "text-accent" : "text-destructive"}`}>
                            {alert.impact}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}
                        className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors mt-0.5"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User */}
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  );
}
