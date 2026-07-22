"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Shield, Building2, Globe, Clock, Calendar,
  Key, Activity, LogOut, Smartphone, CheckCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  tournament_ops: "bg-info/10 text-info border-info/20",
  stadium_manager: "bg-success/10 text-success border-success/20",
  security_lead: "bg-danger/10 text-danger border-danger/20",
  mobility_lead: "bg-info/10 text-info border-info/20",
  vendor_manager: "bg-warning/10 text-warning border-warning/20",
  volunteer_lead: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  support_agent: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  fan_user: "bg-surface-alt text-text-muted border-border",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full system access with all administrative privileges. Can manage users, settings, and all stadium operations.",
  tournament_ops: "Tournament-wide operational management. Can view and manage all stadiums, incidents, and communications.",
  stadium_manager: "Single stadium facility and staff management. Can manage gates, devices, shifts, and venue-specific operations.",
  security_lead: "Security operations and emergency response. Can manage incidents, escalations, and security feeds.",
  mobility_lead: "Transportation and crowd flow management. Can manage routing, transit, and crowd density monitoring.",
  vendor_manager: "Vendor contracts and food/beverage operations. Can manage vendor approvals and catering.",
  volunteer_lead: "Volunteer recruitment and shift coordination. Can manage volunteer schedules and assignments.",
  support_agent: "Fan support and ticketing assistance. Can handle fan inquiries and accessibility requests.",
  fan_user: "Basic read-only access for public information.",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const user = mounted ? (session?.user as any) : null;
  const role = user?.role || "fan_user";
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const displayName = user?.name || "User";
  const email = user?.email || "user@stadiumos.com";
  const stadiumId = user?.stadiumId;
  const language = user?.language || "en";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and manage your account details</p>
        </div>
        <Button
          variant="outline"
          className="border-danger/30 text-danger hover:bg-danger/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>

      {/* Profile header card */}
      <Card className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="px-6 pb-6 -mt-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border-4 border-surface flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-text-primary leading-tight" suppressHydrationWarning>{displayName}</h2>
              <p className="text-sm text-text-muted leading-tight" suppressHydrationWarning>{email}</p>
              <div className="mt-1.5">
                <Badge variant="outline" className={`text-[10px] ${ROLE_COLORS[role] || ROLE_COLORS.fan_user}`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Account Information */}
        <Card className="bg-surface border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { icon: <Mail className="h-4 w-4 text-text-muted" />, label: "Email", value: email },
              { icon: <Key className="h-4 w-4 text-text-muted" />, label: "User ID", value: user?.id || "N/A", mono: true },
              { icon: <Shield className="h-4 w-4 text-text-muted" />, label: "Role", value: roleLabel, badge: true, badgeColor: ROLE_COLORS[role] },
              { icon: <Building2 className="h-4 w-4 text-text-muted" />, label: "Stadium", value: stadiumId ? stadiumId.charAt(0).toUpperCase() + stadiumId.slice(1).replace(/-/g, " ") : "All Stadiums" },
              { icon: <Globe className="h-4 w-4 text-text-muted" />, label: "Language", value: LANGUAGE_LABELS[language] || language },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm text-text-secondary">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <Badge variant="outline" className={`text-[10px] ${item.badgeColor}`}>{item.value}</Badge>
                  ) : (
                    <span className={`text-sm font-medium text-text-primary ${item.mono ? "font-mono text-xs text-text-muted" : ""}`} suppressHydrationWarning>{item.value}</span>
                  )}
                </div>
                {i < 4 && <div className="mx-6 h-px bg-border" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card className="bg-surface border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" />
              Role & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-surface-alt rounded-lg p-4">
              <Badge variant="outline" className={`mb-2 text-[10px] ${ROLE_COLORS[role] || ROLE_COLORS.fan_user}`}>
                {roleLabel}
              </Badge>
              <p className="text-sm text-text-secondary leading-relaxed">
                {ROLE_DESCRIPTIONS[role] || "No description available for this role."}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3">Access Permissions</h4>
              <div className="space-y-0">
                {[
                  { label: "Command Center", allowed: ["super_admin", "tournament_ops"].includes(role) },
                  { label: "Stadium Operations", allowed: ["super_admin", "tournament_ops", "stadium_manager", "security_lead"].includes(role) },
                  { label: "Incident Management", allowed: ["super_admin", "tournament_ops", "stadium_manager", "security_lead"].includes(role) },
                  { label: "Routing & Mobility", allowed: ["super_admin", "tournament_ops", "mobility_lead"].includes(role) },
                  { label: "Communications", allowed: ["super_admin", "tournament_ops", "stadium_manager"].includes(role) },
                  { label: "Analytics", allowed: ["super_admin", "tournament_ops"].includes(role) },
                  { label: "Knowledge Base", allowed: true },
                  { label: "Simulator", allowed: ["super_admin", "tournament_ops"].includes(role) },
                  { label: "Settings", allowed: role === "super_admin" },
                  { label: "Fan Experience", allowed: true },
                ].map((perm, i) => (
                  <div key={perm.label}>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-text-secondary">{perm.label}</span>
                      {perm.allowed ? (
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                      )}
                    </div>
                    {i < 9 && <div className="h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="bg-surface border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { icon: <CheckCircle className="h-4 w-4 text-success" />, text: "Signed in successfully", time: "Just now" },
              { icon: <Activity className="h-4 w-4 text-info" />, text: "Viewed Command Center dashboard", time: "5 min ago" },
              { icon: <Shield className="h-4 w-4 text-warning" />, text: "Acknowledged security alert", time: "12 min ago" },
              { icon: <Smartphone className="h-4 w-4 text-info" />, text: "Checked device health status", time: "1 hour ago" },
            ].map((activity, i, arr) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-3">
                  <div className="mt-0.5">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{activity.text}</p>
                    <p className="text-xs text-text-muted">{activity.time}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="h-px bg-border" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-surface border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <Key className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              {
                icon: <CheckCircle className="h-4 w-4 text-success" />,
                bg: "bg-success/10",
                title: "Password",
                subtitle: "Last changed 30 days ago",
                right: <Button variant="outline" size="sm" className="border-border text-text-secondary">Change</Button>,
              },
              {
                icon: <CheckCircle className="h-4 w-4 text-success" />,
                bg: "bg-success/10",
                title: "Two-Factor Auth",
                subtitle: "Enabled via authenticator app",
                right: <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Enabled</Badge>,
              },
              {
                icon: <Clock className="h-4 w-4 text-info" />,
                bg: "bg-info/10",
                title: "Session Timeout",
                subtitle: "Auto-logout after 30 minutes",
                right: <Badge variant="secondary" className="text-[10px]">30 min</Badge>,
              },
              {
                icon: <Calendar className="h-4 w-4 text-info" />,
                bg: "bg-info/10",
                title: "Last Login",
                subtitle: "July 15, 2026 at 14:30 UTC",
                right: null,
              },
            ].map((item, i, arr) => (
              <div key={i}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.subtitle}</p>
                    </div>
                  </div>
                  {item.right}
                </div>
                {i < arr.length - 1 && <div className="h-px bg-border" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
