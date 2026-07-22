"use client";

import { useState } from "react";
import {
  OfflineIndicator,
  VenueOverview,
  IncidentBoard,
  GatePerformance,
  ZoneCongestion,
  ServiceQueues,
  SOPQuickActions,
  WorkforceQueue,
  DeviceHealth,
  LocalizedNotifications,
  ShiftHandoffLog,
  MatchDayModeSwitch,
  AuditHistorySidebar,
} from "@/components/stadium-ops";
import { useStadiumOps } from "@/hooks/useStadiumOps";
import type { MatchDayMode, UserRole } from "@/lib/stadium-ops/types";
import { MATCH_DAY_MODE_LABELS } from "@/lib/stadium-ops/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  AlertTriangle,
  Users,
  Wifi,
  WifiOff,
  Shield,
  MapPin,
  Bell,
  ClipboardCheck,
  Cpu,
  ArrowRightLeft,
  LayoutDashboard,
  DoorOpen,
  Zap,
} from "lucide-react";

interface StadiumOpsClientProps {
  venueId: string;
  venueName: string;
}

const FALLBACK_STAFF = [
  { id: "s1", name: "Marcus Johnson", role: "security_lead" as UserRole },
  { id: "s2", name: "Sarah Chen", role: "support_agent" as UserRole },
  { id: "s3", name: "David Park", role: "stadium_manager" as UserRole },
  { id: "s4", name: "Ana Rodriguez", role: "stadium_manager" as UserRole },
];

const MODE_BADGE_COLORS: Record<MatchDayMode, string> = {
  pre_event: "bg-info/15 text-info border-info/20",
  in_event: "bg-success/15 text-success border-success/20",
  post_event: "bg-warning/15 text-warning border-warning/20",
};

export default function StadiumOpsClient({
  venueId,
  venueName,
}: StadiumOpsClientProps) {
  const {
    state,
    mode,
    setMode,
    openIncident,
    assignIncident,
    escalateIncident,
    closeIncident,
    addIncidentNote,
    triggerSop,
    completeSopStep,
    sendNotification,
    resolveWorkforceIssue,
    completeHandoff,
    acknowledgeDevice,
    toggleGate,
    isOffline,
    pendingCount,
    processPending,
    auditSidebarOpen,
    setAuditSidebarOpen,
    availableStaff,
  } = useStadiumOps(venueId);

  const activeIncidentCount = state.incidents.filter(
    (i) => i.status !== "resolved" && i.status !== "closed"
  ).length;

  const pendingWorkforceCount = state.workforceIssues.filter(
    (w) => w.status !== "resolved"
  ).length;

  const handleOpenIncident = (data: {
    title: string;
    description: string;
    category: import("@/lib/stadium-ops/types").IncidentCategory;
    severity: import("@/lib/stadium-ops/types").IncidentSeverity;
    zone: string;
    zoneId: string;
    tags: string[];
  }) => {
    openIncident({
      ...data,
      status: "open",
      reportedBy: "Command Center",
      reportedByRole: "stadium_manager",
    });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <OfflineIndicator
        isOffline={isOffline}
        pendingCount={pendingCount}
        onProcessPending={processPending}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2">
            <Shield className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{venueName}</h1>
            <p className="text-sm text-text-muted">
              Stadium Operations • {venueId.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`${MODE_BADGE_COLORS[mode]} text-xs`}
          >
            {MATCH_DAY_MODE_LABELS[mode]}
          </Badge>

          <MatchDayModeSwitch mode={mode} onModeChange={setMode} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditSidebarOpen(!auditSidebarOpen)}
            className="relative gap-2 border-border bg-surface text-text-secondary hover:bg-surface-alt hover:text-text-primary"
          >
            <History className="h-4 w-4" />
            Audit Trail
            <Badge className="ml-1 bg-surface-alt text-text-primary text-[10px] px-1.5">
              {state.auditLog.length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="bg-surface border border-border p-1 h-auto flex-wrap">
          <TabsTrigger
            value="overview"
            className="gap-2 data-[state=active]:bg-success/15 data-[state=active]:text-success"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="incidents"
            className="gap-2 data-[state=active]:bg-danger/15 data-[state=active]:text-danger"
          >
            <AlertTriangle className="h-4 w-4" />
            Incidents
            {activeIncidentCount > 0 && (
              <Badge className="bg-danger/20 text-danger border-danger/20 text-[10px] px-1.5 ml-1">
                {activeIncidentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="gates"
            className="gap-2 data-[state=active]:bg-info/15 data-[state=active]:text-info"
          >
            <DoorOpen className="h-4 w-4" />
            Gates
          </TabsTrigger>
          <TabsTrigger
            value="zones"
            className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            <MapPin className="h-4 w-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="gap-2 data-[state=active]:bg-warning/15 data-[state=active]:text-warning"
          >
            <Zap className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger
            value="sops"
            className="gap-2 data-[state=active]:bg-info/15 data-[state=active]:text-info"
          >
            <ClipboardCheck className="h-4 w-4" />
            SOPs
          </TabsTrigger>
          <TabsTrigger
            value="workforce"
            className="gap-2 data-[state=active]:bg-warning/15 data-[state=active]:text-warning"
          >
            <Users className="h-4 w-4" />
            Workforce
            {pendingWorkforceCount > 0 && (
              <Badge className="bg-warning/20 text-warning border-warning/20 text-[10px] px-1.5 ml-1">
                {pendingWorkforceCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="gap-2 data-[state=active]:bg-info/15 data-[state=active]:text-info"
          >
            <Cpu className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="handoffs"
            className="gap-2 data-[state=active]:bg-success/15 data-[state=active]:text-success"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Handoffs
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4">
          <TabsContent value="overview" className="h-full m-0">
            <ScrollArea className="h-full">
              <VenueOverview
                venue={state.venue}
                mode={mode}
                activeIncidents={activeIncidentCount}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="incidents" className="h-full m-0">
            <IncidentBoard
              incidents={state.incidents}
              zones={state.venue.zones}
              availableStaff={availableStaff.length > 0 ? availableStaff : FALLBACK_STAFF}
              onOpenIncident={handleOpenIncident}
              onAssign={assignIncident}
              onEscalate={escalateIncident}
              onClose={closeIncident}
              onAddNote={addIncidentNote}
            />
          </TabsContent>

          <TabsContent value="gates" className="h-full m-0">
            <ScrollArea className="h-full">
              <GatePerformance
                gates={state.venue.gates}
                onToggleGate={toggleGate}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="zones" className="h-full m-0">
            <ScrollArea className="h-full">
              <ZoneCongestion zones={state.venue.zones} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="services" className="h-full m-0">
            <ScrollArea className="h-full">
              <ServiceQueues services={state.venue.services} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sops" className="h-full m-0">
            <ScrollArea className="h-full">
              <SOPQuickActions
                sops={state.sops}
                onTriggerSop={(id) => triggerSop(id, "Command Center")}
                onCompleteStep={(sopId, stepId) =>
                  completeSopStep(sopId, stepId, "Command Center")
                }
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="workforce" className="h-full m-0">
            <ScrollArea className="h-full">
              <WorkforceQueue
                issues={state.workforceIssues}
                onResolve={resolveWorkforceIssue}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="devices" className="h-full m-0">
            <ScrollArea className="h-full">
              <DeviceHealth
                devices={state.devices}
                onAcknowledge={acknowledgeDevice}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notifications" className="h-full m-0">
            <ScrollArea className="h-full">
              <LocalizedNotifications
                notifications={state.notifications}
                zones={state.venue.zones}
                onSend={(notif) =>
                  sendNotification({
                    ...notif,
                    sentBy: "Command Center",
                  })
                }
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="handoffs" className="h-full m-0">
            <ScrollArea className="h-full">
              <ShiftHandoffLog
                handoffs={state.handoffs}
                onCompleteHandoff={completeHandoff}
              />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Audit History Sidebar */}
      <AuditHistorySidebar
        entries={state.auditLog}
        isOpen={auditSidebarOpen}
        onClose={() => setAuditSidebarOpen(false)}
      />
    </div>
  );
}
