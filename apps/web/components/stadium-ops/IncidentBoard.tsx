"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
} from "lucide-react";
import type {
  Incident,
  IncidentStatus,
  IncidentSeverity,
  IncidentCategory,
  UserRole,
} from "@/lib/stadium-ops/types";
import {
  INCIDENT_STATUS_COLUMNS,
  SEVERITY_COLORS,
  STATUS_COLORS,
} from "@/lib/stadium-ops/types";
import { COLUMN_BG, STATUS_LABELS, CATEGORY_LABELS } from "./IncidentBoard/types";
import { IncidentCard } from "./IncidentBoard/IncidentCard";
import { IncidentDetailDialog } from "./IncidentBoard/IncidentDetailDialog";

interface IncidentBoardProps {
  incidents: Incident[];
  zones: Array<{ id: string; name: string }>;
  availableStaff: Array<{ id: string; name: string; role: UserRole }>;
  onOpenIncident: (data: {
    title: string;
    description: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    zone: string;
    zoneId: string;
    tags: string[];
  }) => void;
  onAssign: (incidentId: string, assignee: string, role: UserRole) => void;
  onEscalate: (incidentId: string, note?: string) => void;
  onClose: (
    incidentId: string,
    resolutionCode: string,
    note?: string
  ) => void;
  onAddNote: (
    incidentId: string,
    content: string,
    author: string,
    role: UserRole
  ) => void;
}

export function IncidentBoard({
  incidents,
  zones,
  availableStaff,
  onOpenIncident,
  onAssign,
  onEscalate,
  onClose,
  onAddNote,
}: IncidentBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<IncidentCategory>("security");
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>("medium");
  const [newZone, setNewZone] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        debouncedQuery === "" ||
        inc.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || inc.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [incidents, debouncedQuery, severityFilter]);

  const columnIncidents = useMemo(() => {
    const grouped: Record<IncidentStatus, Incident[]> = {
      open: [],
      assigned: [],
      in_progress: [],
      escalated: [],
      resolved: [],
      closed: [],
    };
    for (const inc of filteredIncidents) {
      if (grouped[inc.status]) {
        grouped[inc.status].push(inc);
      }
    }
    return grouped;
  }, [filteredIncidents]);

  const resetNewIncidentForm = useCallback(() => {
    setNewTitle("");
    setNewDescription("");
    setNewCategory("security");
    setNewSeverity("medium");
    setNewZone("");
    setNewTags("");
  }, []);

  const handleCreateIncident = useCallback(() => {
    if (!newTitle.trim() || !newDescription.trim() || !newZone) return;
    const selectedZone = zones.find((z) => z.id === newZone);
    if (!selectedZone) return;
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onOpenIncident({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      severity: newSeverity,
      zone: selectedZone.name,
      zoneId: selectedZone.id,
      tags,
    });
    resetNewIncidentForm();
    setNewIncidentOpen(false);
  }, [
    newTitle,
    newDescription,
    newCategory,
    newSeverity,
    newZone,
    newTags,
    zones,
    onOpenIncident,
    resetNewIncidentForm,
  ]);

  const openDetail = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setSelectedIncident(null);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 px-2 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">Incident Board</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search incidents"
              className="pl-8 w-56 bg-surface border-border text-text-primary placeholder:text-text-muted"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36 bg-surface border-border text-text-primary">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => setNewIncidentOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Incident
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto pb-2">
        {INCIDENT_STATUS_COLUMNS.map((status) => {
          const items = columnIncidents[status] ?? [];
          return (
            <div
              key={status}
              className={`flex flex-col rounded-lg border border-border min-w-[240px] max-w-[320px] flex-1 ${COLUMN_BG[status]}`}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      STATUS_COLORS[status].split(" ")[0]
                    }`}
                  />
                  <span className="text-sm font-semibold text-text-secondary">
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 bg-surface-alt text-text-muted border-0"
                >
                  {items.length}
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex flex-col gap-2">
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                      <AlertTriangle className="h-5 w-5 mb-1 opacity-40" />
                      <span className="text-xs">No incidents</span>
                    </div>
                  )}
                  {items.map((incident) => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onClick={openDetail}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={newIncidentOpen} onOpenChange={setNewIncidentOpen}>
        <DialogContent className="bg-background border-border text-text-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text-primary">New Incident</DialogTitle>
            <DialogDescription className="text-text-muted">
              Report a new incident to the board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Title
              </label>
              <Input
                placeholder="Incident title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-surface border-border text-text-primary placeholder:text-text-muted"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Description
              </label>
              <Textarea
                placeholder="Describe the incident..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-surface border-border text-text-primary placeholder:text-text-muted min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Category
                </label>
                <Select
                  value={newCategory}
                  onValueChange={(v) => setNewCategory(v as IncidentCategory)}
                >
                  <SelectTrigger className="bg-surface border-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Severity
                </label>
                <Select
                  value={newSeverity}
                  onValueChange={(v) => setNewSeverity(v as IncidentSeverity)}
                >
                  <SelectTrigger className="bg-surface border-border text-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Zone</label>
              <Select value={newZone} onValueChange={setNewZone}>
                <SelectTrigger className="bg-surface border-border text-text-primary">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Tags{" "}
                <span className="text-text-muted font-normal">
                  (comma-separated)
                </span>
              </label>
              <Input
                placeholder="e.g. urgent, gate-a, crowd"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="bg-surface border-border text-text-primary placeholder:text-text-muted"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetNewIncidentForm();
                setNewIncidentOpen(false);
              }}
              className="border-border text-text-muted hover:text-text-primary hover:bg-surface-alt"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateIncident}
              disabled={!newTitle.trim() || !newDescription.trim() || !newZone}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IncidentDetailDialog
        selectedIncident={selectedIncident}
        incidents={incidents}
        availableStaff={availableStaff}
        onAssign={onAssign}
        onEscalate={onEscalate}
        onClose={onClose}
        onAddNote={onAddNote}
        onOpenChange={handleDetailOpenChange}
      />
    </div>
  );
}
