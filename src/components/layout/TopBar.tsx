import { useState } from "react";
import { Download, Bell, User, SlidersHorizontal, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  demoMode: boolean;
  onDemoModeToggle: (v: boolean) => void;
  riskThreshold: number;
  onRiskThresholdChange: (v: number) => void;
}

export function TopBar({ demoMode, onDemoModeToggle, riskThreshold, onRiskThresholdChange }: TopBarProps) {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-6 w-px bg-border" />
        <span className="text-sm font-medium text-foreground">Global CPG Portfolio</span>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Live</Badge>
      </div>

      <div className="flex items-center gap-3">
        {/* Risk Threshold */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Risk: {riskThreshold}%
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-3">
              <p className="text-sm font-medium">Risk Threshold</p>
              <Slider
                value={[riskThreshold]}
                onValueChange={(v) => onRiskThresholdChange(v[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Materials above {riskThreshold}% risk will be flagged</p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
          <Play className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Demo</span>
          <Switch checked={demoMode} onCheckedChange={onDemoModeToggle} className="scale-75" />
        </div>

        {/* Export */}
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </button>

        {/* User */}
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  );
}
