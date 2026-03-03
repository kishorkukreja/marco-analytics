import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [demoMode, setDemoMode] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState(40);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            demoMode={demoMode}
            onDemoModeToggle={setDemoMode}
            riskThreshold={riskThreshold}
            onRiskThresholdChange={setRiskThreshold}
          />
          <main className="flex-1 overflow-auto p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
