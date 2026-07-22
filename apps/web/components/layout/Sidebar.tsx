"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Building2, AlertTriangle, Navigation, Radio,
  BarChart3, BookOpen, Play, Settings, ChevronLeft, ChevronRight,
  LogOut, Wifi, WifiOff, User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Command Center", href: "/command-center", icon: LayoutDashboard },
  { label: "Stadium Ops", href: "/stadium-ops", icon: Building2 },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Routing & Mobility", href: "/routing", icon: Navigation },
  { label: "Communications", href: "/notifications", icon: Radio },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { label: "Simulator", href: "/simulator", icon: Play },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const userRole = mounted ? ((session?.user as any)?.role ?? "operator") : "operator";
  const userId = mounted ? (session?.user?.id ?? "000") : "000";
  const callsign = `Ops-${String(userId).slice(-3).padStart(3, "0")}`;
  const displayName = mounted ? (session?.user?.name || callsign) : callsign;
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = userRole.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen border-r border-border bg-surface transition-all duration-200 ease-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              S
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold text-text-primary truncate">StadiumOS</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-muted hover:bg-surface-alt hover:text-text-primary"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-text-muted")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Status & User */}
        <div className="border-t border-border/50 p-2 space-y-2">
          {/* Connection status */}
          <div className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs", collapsed ? "justify-center" : "")}>
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-success shrink-0" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-danger shrink-0" />
            )}
            {!collapsed && (
              <span className={isOnline ? "text-success" : "text-danger"}>
                {isOnline ? "System Online" : "Offline"}
              </span>
            )}
          </div>

          {/* User */}
          <div className={cn("flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-surface-alt transition-colors", collapsed ? "justify-center" : "")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text-primary truncate">{displayName}</p>
                <p className="text-[10px] text-text-muted truncate">{roleLabel}</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              "text-text-muted hover:bg-danger/10 hover:text-danger",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="w-full"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
