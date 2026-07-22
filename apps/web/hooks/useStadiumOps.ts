"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  StadiumOpsState,
  MatchDayMode,
  Incident,
  IncidentStatus,
  IncidentCategory,
  IncidentSeverity,
  IncidentNote,
  IncidentUpdate,
  SOPChecklist,
  Device,
  HandoffEntry,
  WorkforceIssue,
  WorkforceIssueType,
  WorkforceIssueStatus,
  LocalNotification,
  AuditEntry,
  AuditAction,
  GateStatus,
  Gate,
  Zone,
  ServicePoint,
  StaffDeployment,
  MatchInfo,
  UserRole,
} from "@/lib/stadium-ops/types";
import {
  enqueueAction,
  getOfflineQueue,
  processOfflineQueue,
} from "@/lib/stadium-ops/offline-queue";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function buildInitialState(venueId: string): StadiumOpsState {
  return {
    venue: {
      id: venueId,
      name: "",
      capacity: 0,
      currentOccupancy: 0,
      match: {
        home: "Loading...",
        away: "",
        minute: "0'",
        score: "0 - 0",
        status: "upcoming",
      } as MatchInfo,
      gates: [] as Gate[],
      zones: [] as Zone[],
      staff: [] as StaffDeployment[],
      services: [] as ServicePoint[],
    },
    mode: "in_event",
    incidents: [],
    sops: [],
    handoffs: [],
    workforceIssues: [],
    devices: [],
    notifications: [],
    auditLog: [],
    isOffline: false,
    pendingActions: 0,
  };
}

export function useStadiumOps(venueId: string) {
  const [state, setState] = useState<StadiumOpsState>(() =>
    buildInitialState(venueId)
  );
  const [mode, setModeState] = useState<MatchDayMode>("in_event");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [auditSidebarOpen, setAuditSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [availableStaff, setAvailableStaff] = useState<Array<{ id: string; name: string; role: UserRole }>>([]);
  const processingRef = useRef(false);

  // ─── Fetch real data from DB ─────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function loadRealData() {
      try {
        const res = await fetch(
          `/api/stadium-ops/venue?stadiumId=${encodeURIComponent(venueId)}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        setState((prev) => {
          const dbVenue = data.venue;
          if (!dbVenue) return prev;

          return {
            ...prev,
            venue: {
              id: dbVenue.id ?? venueId,
              name: dbVenue.name ?? prev.venue.name,
              capacity: dbVenue.capacity ?? prev.venue.capacity,
              currentOccupancy: dbVenue.currentOccupancy ?? prev.venue.currentOccupancy,
              match: dbVenue.match?.home !== "TBD" ? dbVenue.match : prev.venue.match,
              gates: dbVenue.gates ?? prev.venue.gates,
              zones: dbVenue.zones ?? prev.venue.zones,
              staff: dbVenue.staff ?? prev.venue.staff,
              services: dbVenue.services ?? prev.venue.services,
            },
          };
        });

        if (Array.isArray(data.incidents)) {
          setState((prev) => ({ ...prev, incidents: data.incidents }));
        }
        if (Array.isArray(data.sops)) {
          setState((prev) => ({ ...prev, sops: data.sops }));
        }
        if (Array.isArray(data.devices)) {
          setState((prev) => ({ ...prev, devices: data.devices }));
        }
        if (Array.isArray(data.handoffs)) {
          setState((prev) => ({ ...prev, handoffs: data.handoffs }));
        }
        if (Array.isArray(data.workforceIssues)) {
          setState((prev) => ({ ...prev, workforceIssues: data.workforceIssues }));
        }
        if (Array.isArray(data.notifications)) {
          setState((prev) => ({ ...prev, notifications: data.notifications }));
        }
        if (Array.isArray(data.auditLog)) {
          setState((prev) => ({ ...prev, auditLog: data.auditLog }));
        }
        if (Array.isArray(data.staff)) {
          setAvailableStaff(data.staff);
        }
      } catch {
        // silent fail — empty state remains
      }
    }
    loadRealData();
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  // ─── Online / Offline listeners ──────────────────────────────

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    setPendingCount(getOfflineQueue().length);
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ─── Pending count sync ──────────────────────────────────────

  useEffect(() => {
    setPendingCount(getOfflineQueue().length);
  }, [state]);

  // ─── Auto-process offline queue when online ──────────────────

  useEffect(() => {
    if (isOffline || processingRef.current) return;

    const interval = setInterval(async () => {
      const queue = getOfflineQueue();
      if (queue.length === 0) return;
      processingRef.current = true;
      try {
        await processOfflineQueue(async () => {
          return true;
        });
        setPendingCount(getOfflineQueue().length);
      } catch {
        // processing failed, will retry next interval
      } finally {
        processingRef.current = false;
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [isOffline]);

  // ─── Helper: add audit entry ─────────────────────────────────

  const addAuditEntry = useCallback(
    (
      action: AuditAction,
      description: string,
      user: string,
      role: UserRole,
      metadata?: Record<string, string>
    ) => {
      const entry: AuditEntry = {
        id: generateId("aud"),
        action,
        description,
        user,
        userRole: role,
        timestamp: now(),
        metadata,
      };
      setState((prev) => ({
        ...prev,
        auditLog: [entry, ...prev.auditLog],
      }));
    },
    []
  );

  // ─── Incidents ───────────────────────────────────────────────

  const openIncident = useCallback(
    (
      data: Omit<
        Incident,
        "id" | "createdAt" | "updatedAt" | "notes" | "history" | "isEscalated"
      >
    ) => {
      try {
        const id = generateId("inc");
        const ts = now();
        const incident: Incident = {
          ...data,
          id,
          createdAt: ts,
          updatedAt: ts,
          notes: [],
          history: [],
          isEscalated: false,
        };

        setState((prev) => ({
          ...prev,
          incidents: [incident, ...prev.incidents],
        }));

        if (isOffline) {
          enqueueAction("open_incident", { ...incident });
        }

        addAuditEntry(
          "incident_opened",
          `Incident opened: ${data.title}`,
          data.reportedBy,
          data.reportedByRole,
          { zone: data.zone, severity: data.severity, category: data.category }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to open incident:", err);
      }
    },
    [isOffline, addAuditEntry]
  );

  const assignIncident = useCallback(
    (id: string, assignee: string, role: UserRole) => {
      try {
        setState((prev) => ({
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  assignedTo: assignee,
                  assignedToRole: role,
                  status: "assigned" as IncidentStatus,
                  updatedAt: now(),
                  history: [
                    ...inc.history,
                    {
                      id: generateId("h"),
                      fromStatus: inc.status,
                      toStatus: "assigned",
                      author: assignee,
                      timestamp: now(),
                    },
                  ],
                }
              : inc
          ),
        }));

        if (isOffline) {
          enqueueAction("assign_incident", { id, assignee, role });
        }

        const inc = state.incidents.find((i) => i.id === id);
        addAuditEntry(
          "incident_assigned",
          `Incident "${inc?.title ?? id}" assigned to ${assignee}`,
          assignee,
          role,
          { incidentId: id }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to assign incident:", err);
      }
    },
    [isOffline, state.incidents, addAuditEntry]
  );

  const escalateIncident = useCallback(
    (id: string, note?: string) => {
      try {
        setState((prev) => ({
          ...prev,
          incidents: prev.incidents.map((inc) => {
            if (inc.id !== id) return inc;
            const newLevel = (inc.escalationLevel ?? 1) + 1;
            const updated: Incident = {
              ...inc,
              status: "escalated",
              isEscalated: true,
              escalationLevel: newLevel,
              updatedAt: now(),
              history: [
                ...inc.history,
                {
                  id: generateId("h"),
                  fromStatus: inc.status,
                  toStatus: "escalated",
                  author: inc.assignedTo ?? "System",
                  timestamp: now(),
                  note,
                },
              ],
            };
            if (note) {
              updated.notes = [
                ...updated.notes,
                {
                  id: generateId("n"),
                  content: note,
                  author: inc.assignedTo ?? "System",
                  authorRole: inc.assignedToRole ?? "stadium_manager",
                  createdAt: now(),
                },
              ];
            }
            return updated;
          }),
        }));

        if (isOffline) {
          enqueueAction("escalate_incident", { id, note });
        }

        const inc = state.incidents.find((i) => i.id === id);
        addAuditEntry(
          "incident_escalated",
          `Incident "${inc?.title ?? id}" escalated`,
          inc?.assignedTo ?? "System",
          inc?.assignedToRole ?? "stadium_manager",
          { incidentId: id, note: note ?? "" }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to escalate incident:", err);
      }
    },
    [isOffline, state.incidents, addAuditEntry]
  );

  const closeIncident = useCallback(
    (id: string, resolutionCode: string, note?: string) => {
      try {
        const ts = now();
        setState((prev) => ({
          ...prev,
          incidents: prev.incidents.map((inc) => {
            if (inc.id !== id) return inc;
            const updated: Incident = {
              ...inc,
              status: "closed",
              resolutionCode,
              closedAt: ts,
              updatedAt: ts,
              history: [
                ...inc.history,
                {
                  id: generateId("h"),
                  fromStatus: inc.status,
                  toStatus: "closed",
                  author: inc.assignedTo ?? "System",
                  timestamp: ts,
                  note: note ?? `Resolved with code: ${resolutionCode}`,
                },
              ],
            };
            if (note) {
              updated.notes = [
                ...updated.notes,
                {
                  id: generateId("n"),
                  content: note,
                  author: inc.assignedTo ?? "System",
                  authorRole: inc.assignedToRole ?? "stadium_manager",
                  createdAt: ts,
                },
              ];
            }
            return updated;
          }),
        }));

        if (isOffline) {
          enqueueAction("close_incident", { id, resolutionCode, note });
        }

        const inc = state.incidents.find((i) => i.id === id);
        addAuditEntry(
          "incident_closed",
          `Incident "${inc?.title ?? id}" closed — ${resolutionCode}`,
          inc?.assignedTo ?? "System",
          inc?.assignedToRole ?? "stadium_manager",
          { incidentId: id, resolutionCode }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to close incident:", err);
      }
    },
    [isOffline, state.incidents, addAuditEntry]
  );

  const addIncidentNote = useCallback(
    (
      id: string,
      content: string,
      author: string,
      role: UserRole,
      mediaUrl?: string
    ) => {
      try {
        const ts = now();
        const note: IncidentNote = {
          id: generateId("n"),
          content,
          author,
          authorRole: role,
          createdAt: ts,
          mediaUrl,
          mediaType: mediaUrl?.match(/\.(mp4|mov)$/i)
            ? "video"
            : mediaUrl?.match(/\.(mp3|wav)$/i)
            ? "audio"
            : "image",
        };

        setState((prev) => ({
          ...prev,
          incidents: prev.incidents.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  notes: [...inc.notes, note],
                  updatedAt: ts,
                }
              : inc
          ),
        }));

        if (isOffline) {
          enqueueAction("add_note", { id, content, author, role, mediaUrl });
        }

        addAuditEntry(
          "incident_note_added",
          `Note added to incident: "${content.slice(0, 60)}${content.length > 60 ? "..." : ""}"`,
          author,
          role,
          { incidentId: id }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to add incident note:", err);
      }
    },
    [isOffline, addAuditEntry]
  );

  // ─── SOPs ────────────────────────────────────────────────────

  const triggerSop = useCallback(
    (id: string, triggeredBy: string) => {
      try {
        const ts = now();
        setState((prev) => ({
          ...prev,
          sops: prev.sops.map((sop) =>
            sop.id === id
              ? {
                  ...sop,
                  status: "in_progress" as const,
                  triggeredBy,
                  startedAt: ts,
                }
              : sop
          ),
        }));

        if (isOffline) {
          enqueueAction("trigger_sop", { id, triggeredBy });
        }

        const sop = state.sops.find((s) => s.id === id);
        addAuditEntry(
          "sop_triggered",
          `SOP triggered: ${sop?.name ?? id}`,
          triggeredBy,
          sop?.assignedRole ?? "stadium_manager",
          { sopId: id }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to trigger SOP:", err);
      }
    },
    [isOffline, state.sops, addAuditEntry]
  );

  const completeSopStep = useCallback(
    (sopId: string, stepId: string, completedBy: string) => {
      try {
        const ts = now();
        setState((prev) => {
          const updatedSops = prev.sops.map((sop) => {
            if (sop.id !== sopId) return sop;
            const updatedSteps = sop.steps.map((step) =>
              step.id === stepId
                ? { ...step, completed: true, completedBy, completedAt: ts }
                : step
            );
            const allDone = updatedSteps.every((s) => s.completed);
            return {
              ...sop,
              steps: updatedSteps,
              status: (allDone ? "completed" : "in_progress") as
                | "completed"
                | "in_progress",
              completedAt: allDone ? ts : undefined,
            };
          });
          return { ...prev, sops: updatedSops };
        });

        if (isOffline) {
          enqueueAction("complete_sop_step", { sopId, stepId, completedBy });
        }

        const sop = state.sops.find((s) => s.id === sopId);
        const step = sop?.steps.find((s) => s.id === stepId);
        addAuditEntry(
          "sop_step_completed",
          `SOP step completed: "${step?.label ?? stepId}" in ${sop?.name ?? sopId}`,
          completedBy,
          sop?.assignedRole ?? "stadium_manager",
          { sopId, stepId }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to complete SOP step:", err);
      }
    },
    [isOffline, state.sops, addAuditEntry]
  );

  // ─── Notifications ───────────────────────────────────────────

  const sendNotification = useCallback(
    (
      notif: Omit<LocalNotification, "id" | "sentAt" | "status">
    ) => {
      try {
        const full: LocalNotification = {
          ...notif,
          id: generateId("notif"),
          sentAt: now(),
          status: "sent",
        };

        setState((prev) => ({
          ...prev,
          notifications: [full, ...prev.notifications],
        }));

        if (isOffline) {
          enqueueAction("send_notification", { ...full });
        }

        addAuditEntry(
          "notification_sent",
          `Notification sent: "${notif.title}" to ${notif.targetAudience}`,
          notif.sentBy,
          "stadium_manager",
          {
            notifId: full.id,
            channels: notif.channels.join(","),
            zones: notif.targetZones.join(","),
          }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to send notification:", err);
      }
    },
    [isOffline, addAuditEntry]
  );

  // ─── Infrastructure ──────────────────────────────────────────

  const markInfrastructure = useCallback(
    (deviceId: string, issue: string) => {
      try {
        setState((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === deviceId
              ? { ...d, status: "offline" as const, errorMessage: issue }
              : d
          ),
        }));

        if (isOffline) {
          enqueueAction("mark_infrastructure", { deviceId, issue });
        }

        const device = state.devices.find((d) => d.id === deviceId);
        addAuditEntry(
          "infrastructure_marked",
          `Device "${device?.name ?? deviceId}" marked offline: ${issue}`,
          "System",
          "stadium_manager",
          { deviceId, issue }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to mark infrastructure:", err);
      }
    },
    [isOffline, state.devices, addAuditEntry]
  );

  // ─── Workforce ───────────────────────────────────────────────

  const reportWorkforceIssue = useCallback(
    (
      issue: Omit<WorkforceIssue, "id" | "createdAt" | "status">
    ) => {
      try {
        const full: WorkforceIssue = {
          ...issue,
          id: generateId("wf"),
          createdAt: now(),
          status: "reported",
        };

        setState((prev) => ({
          ...prev,
          workforceIssues: [full, ...prev.workforceIssues],
        }));

        if (isOffline) {
          enqueueAction("report_workforce_issue", { ...full });
        }

        addAuditEntry(
          "workforce_issue_reported",
          `Workforce issue reported: ${issue.title}`,
          issue.reportedBy,
          "stadium_manager",
          { type: issue.type, zone: issue.zone }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to report workforce issue:", err);
      }
    },
    [isOffline, addAuditEntry]
  );

  const resolveWorkforceIssue = useCallback(
    (id: string) => {
      try {
        setState((prev) => ({
          ...prev,
          workforceIssues: prev.workforceIssues.map((w) =>
            w.id === id
              ? { ...w, status: "resolved" as WorkforceIssueStatus, resolvedAt: now() }
              : w
          ),
        }));

        if (isOffline) {
          enqueueAction("resolve_workforce_issue", { id, status: "resolved" });
        }

        const issue = state.workforceIssues.find((w) => w.id === id);
        addAuditEntry(
          "workforce_issue_resolved",
          `Workforce issue resolved: ${issue?.title ?? id}`,
          "System",
          "stadium_manager",
          { issueId: id, status: "resolved" }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to resolve workforce issue:", err);
      }
    },
    [isOffline, state.workforceIssues, addAuditEntry]
  );

  // ─── Handoff ─────────────────────────────────────────────────

  const completeHandoff = useCallback(
    (id: string, notes: string) => {
      try {
        setState((prev) => ({
          ...prev,
          handoffs: prev.handoffs.map((h) =>
            h.id === id
              ? { ...h, status: "completed" as const, notes }
              : h
          ),
        }));

        if (isOffline) {
          enqueueAction("handoff_shift", { id, notes });
        }

        const ho = state.handoffs.find((h) => h.id === id);
        addAuditEntry(
          "shift_handoff",
          `Shift handoff completed: ${ho?.fromUser ?? "?"} → ${ho?.toUser ?? "?"}`,
          ho?.fromUser ?? "System",
          "stadium_manager",
          { handoffId: id }
        );

        setPendingCount(getOfflineQueue().length);
      } catch (err) {
        console.error("Failed to complete handoff:", err);
      }
    },
    [isOffline, state.handoffs, addAuditEntry]
  );

  // ─── Device ──────────────────────────────────────────────────

  const acknowledgeDevice = useCallback(
    (deviceId: string) => {
      try {
        const ts = now();
        setState((prev) => ({
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === deviceId
              ? {
                  ...d,
                  status: "online" as const,
                  lastHeartbeat: ts,
                  errorMessage: undefined,
                }
              : d
          ),
        }));

        const device = state.devices.find((d) => d.id === deviceId);
        addAuditEntry(
          "infrastructure_marked",
          `Device "${device?.name ?? deviceId}" acknowledged and set online`,
          "System",
          "stadium_manager",
          { deviceId }
        );
      } catch (err) {
        console.error("Failed to acknowledge device:", err);
      }
    },
    [state.devices, addAuditEntry]
  );

  // ─── Gate ────────────────────────────────────────────────────

  const toggleGate = useCallback(
    (gateId: string, newStatus: GateStatus) => {
      try {
        setState((prev) => ({
          ...prev,
          venue: {
            ...prev.venue,
            gates: prev.venue.gates.map((g: Gate) =>
              g.id === gateId ? { ...g, status: newStatus } : g
            ),
          },
        }));

        const gate = state.venue.gates.find((g) => g.id === gateId);
        addAuditEntry(
          "gate_status_changed",
          `Gate "${gate?.name ?? gateId}" changed to ${newStatus}`,
          "System",
          "stadium_manager",
          { gateId, gateName: gate?.name ?? "", newStatus }
        );
      } catch (err) {
        console.error("Failed to toggle gate:", err);
      }
    },
    [state.venue.gates, addAuditEntry]
  );

  // ─── Mode ────────────────────────────────────────────────────

  const setMode = useCallback(
    (newMode: MatchDayMode) => {
      try {
        const oldMode = mode;
        setModeState(newMode);
        setState((prev) => ({ ...prev, mode: newMode }));

        addAuditEntry(
          "mode_changed",
          `Match day mode changed from ${oldMode} to ${newMode}`,
          "System",
          "tournament_ops",
          { from: oldMode, to: newMode }
        );
      } catch (err) {
        console.error("Failed to set mode:", err);
      }
    },
    [mode, addAuditEntry]
  );

  // ─── Process pending ─────────────────────────────────────────

  const processPending = useCallback(async () => {
    if (processingRef.current || isOffline) return;
    processingRef.current = true;
    try {
      await processOfflineQueue(async () => {
        return true;
      });
      setPendingCount(getOfflineQueue().length);
    } catch {
      // will retry
    } finally {
      processingRef.current = false;
    }
  }, [isOffline]);

  return {
    state: { ...state, isOffline, pendingActions: pendingCount },
    mode,
    setMode,

    // Incidents
    openIncident,
    assignIncident,
    escalateIncident,
    closeIncident,
    addIncidentNote,

    // SOPs
    triggerSop,
    completeSopStep,

    // Notifications
    sendNotification,

    // Infrastructure
    markInfrastructure,

    // Workforce
    reportWorkforceIssue,
    resolveWorkforceIssue,

    // Handoff
    completeHandoff,

    // Device
    acknowledgeDevice,

    // Gate
    toggleGate,

    // Audit
    addAuditEntry,

    // Offline
    isOffline,
    pendingCount,
    processPending,

    // UI
    selectedIncident,
    setSelectedIncident,
    auditSidebarOpen,
    setAuditSidebarOpen,

    // Staff
    availableStaff,
  };
}
