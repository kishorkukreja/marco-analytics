import { BarChart3, Cpu, FlaskConical, BrainCircuit, Lightbulb, Server, Settings, ChevronLeft, ChevronRight, Zap } from "lucide-react";
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
  { title: "Simulation Engine", url: "/simulation", icon: FlaskConical },
  { title: "Optimization Engine", url: "/optimization", icon: Cpu },
  { title: "Forecast Intelligence", url: "/forecast", icon: BrainCircuit },
  { title: "Insights & Value", url: "/insights", icon: Lightbulb },
  { title: "System Architecture", url: "/architecture", icon: Server },
  { title: "Admin Settings", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg enterprise-gradient flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-sidebar-primary-foreground tracking-tight">MarCo 2.0</h1>
              <p className="text-[10px] text-sidebar-foreground/60 tracking-widest uppercase">Forecast Intelligence</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={collapsed ? item.title : undefined}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3 mb-2">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 mb-1">Environment</p>
            <p className="text-xs font-medium text-sidebar-primary">Production • v2.4.1</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[11px]">Collapse</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
