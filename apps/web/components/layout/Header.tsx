"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Search, Bell, Sun, Moon, Globe, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/ThemeProvider";

const ROUTE_LABELS: Record<string, string> = {
  "/command-center": "Command Center",
  "/stadium-ops": "Stadium Operations",
  "/incidents": "Incident Management",
  "/routing": "Routing & Mobility",
  "/notifications": "Communications",
  "/comms": "Communications",
  "/analytics": "Analytics Dashboard",
  "/knowledge": "Knowledge Base",
  "/simulator": "Event Simulator",
  "/settings": "Settings",
  "/fan": "Fan Experience",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const user = mounted ? (session?.user as any) : null;
  const displayName = user?.name || "User";
  const userRole = user?.role ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Operator";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const baseRoute = "/" + (pathname.split("/")[1] || "");
  const pageTitle = ROUTE_LABELS[baseRoute] || "Dashboard";

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/50 bg-surface/80 backdrop-blur-md">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        {/* Breadcrumb / Page title */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-text-primary truncate">{pageTitle}</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] shrink-0">
            Match Day
          </Badge>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <Input
              placeholder="Search..."
              className="h-8 w-56 pl-8 text-xs bg-surface-alt border-border/50"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications" onClick={() => window.location.href = "/notifications"}>
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            3
          </span>
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Language */}
        <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">EN</span>
        </span>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-xs font-medium text-text-primary">{displayName}</span>
              <ChevronDown className="h-3 w-3 text-text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-surface border border-border">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-text-primary">{displayName}</p>
              <p className="text-xs text-text-muted">{user?.email || "admin@stadiumos.com"}</p>
              <Badge variant="secondary" className="mt-1 text-[10px]">{userRole}</Badge>
            </div>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="cursor-pointer text-danger focus:text-danger"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
