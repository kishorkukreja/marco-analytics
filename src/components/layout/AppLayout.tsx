import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { CopilotPanel } from "@/components/shared/CopilotPanel";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-3 sm:p-6 bg-background">
            {children}
          </main>
          <footer className="border-t border-border bg-muted/30 px-6 py-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>© {new Date().getFullYear()} MarCo 2.0 — Margin & Cost Intelligence</span>
            <span>v2.4.1</span>
          </footer>
        </div>
      </div>
      <CopilotPanel />
    </SidebarProvider>
  );
}
