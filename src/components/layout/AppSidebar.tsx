import { BarChart3, Cpu, FlaskConical, BrainCircuit, ChevronLeft, ChevronRight, Zap, Microscope } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Zap },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Simulation", url: "/simulation", icon: FlaskConical },
  { title: "Optimization", url: "/optimization", icon: Cpu },
  { title: "Forecast", url: "/forecast", icon: BrainCircuit },
  { title: "Lab Intel", url: "/lab", icon: Microscope },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sidebar-primary/20">
            <Zap className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-sidebar-background" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-sidebar-primary-foreground tracking-tight leading-none">MarCo 2.0</h1>
              <p className="text-[10px] text-sidebar-foreground/40 tracking-widest uppercase mt-1">Intelligence Suite</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {!collapsed && (
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30 px-3 mb-2">Navigation</p>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={collapsed ? item.title : undefined}
                      className={`
                        group relative rounded-lg transition-all duration-200
                        ${isActive
                          ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                        }
                      `}
                    >
                      <NavLink to={item.url} end>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary" />
                        )}
                        <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-sidebar-primary" : ""}`} />
                        {!collapsed && <span className="text-[13px] font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-sidebar-accent/30 border border-sidebar-border/50 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">Environment</p>
            </div>
            <p className="text-xs font-semibold text-sidebar-primary">Production</p>
            <p className="text-[10px] text-sidebar-foreground/30 font-mono mt-0.5">v2.4.1</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/30 transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[11px] font-medium">Collapse</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
