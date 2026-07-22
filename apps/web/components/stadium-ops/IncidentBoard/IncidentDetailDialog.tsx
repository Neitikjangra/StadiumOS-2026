import { useState, useMemo, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  ArrowUpRight,
  CheckCircle,
  Paperclip,
  ChevronRight,
  Tag,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type {
  Incident,
  UserRole,
} from "@/lib/stadium-ops/types";
import {
  SEVERITY_COLORS,
  STATUS_COLORS,
  RESOLUTION_CODES,
} from "@/lib/stadium-ops/types";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS, getInitials } from "./types";

interface IncidentDetailDialogProps {
  selectedIncident: Incident | null;
  incidents: Incident[];
  availableStaff: Array<{ id: string; name: string; role: UserRole }>;
  onAssign: (incidentId: string, assignee: string, role: UserRole) => void;
  onEscalate: (incidentId: string, note?: string) => void;
  onClose: (incidentId: string, resolutionCode: string, note?: string) => void;
  onAddNote: (incidentId: string, content: string, author: string, role: UserRole) => void;
  onOpenChange: (open: boolean) => void;
}

export function IncidentDetailDialog({
  selectedIncident,
  incidents,
  availableStaff,
  onAssign,
  onEscalate,
  onClose,
  onAddNote,
  onOpenChange,
}: IncidentDetailDialogProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [resolutionCode, setResolutionCode] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const refreshSelectedIncident = useMemo(() => {
    if (!selectedIncident) return null;
    return incidents.find((i) => i.id === selectedIncident.id) ?? selectedIncident;
  }, [selectedIncident, incidents]);

  const handleAssign = useCallback(() => {
    if (!refreshSelectedIncident || !assignee) return;
    const staff = availableStaff.find((s) => s.id === assignee);
    if (!staff) return;
    onAssign(refreshSelectedIncident.id, assignee, staff.role);
    setAssignOpen(false);
    setAssignee("");
    onOpenChange(false);
  }, [refreshSelectedIncident, assignee, availableStaff, onAssign, onOpenChange]);

  const handleResolve = useCallback(() => {
    if (!refreshSelectedIncident || !resolutionCode) return;
    onClose(
      refreshSelectedIncident.id,
      resolutionCode,
      resolutionNote.trim() || undefined
    );
    setResolutionOpen(false);
    setResolutionCode("");
    setResolutionNote("");
    onOpenChange(false);
  }, [refreshSelectedIncident, resolutionCode, resolutionNote, onClose, onOpenChange]);

  const handleEscalate = useCallback(() => {
    if (!refreshSelectedIncident) return;
    onEscalate(
      refreshSelectedIncident.id,
      escalateNote.trim() || undefined
    );
    setEscalateNote("");
    onOpenChange(false);
  }, [refreshSelectedIncident, escalateNote, onEscalate, onOpenChange]);

  const handleAddNote = useCallback(() => {
    if (!refreshSelectedIncident || !noteContent.trim()) return;
    onAddNote(refreshSelectedIncident.id, noteContent.trim(), "Current User", "stadium_manager");
    setNoteContent("");
  }, [refreshSelectedIncident, noteContent, onAddNote]);

  return (
    <Dialog
      open={!!selectedIncident}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setAssignOpen(false);
          setResolutionOpen(false);
        }
      }}
    >
      <DialogContent className="bg-background border-border text-text-primary max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {refreshSelectedIncident && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-text-primary text-lg leading-tight">
                    {refreshSelectedIncident.title}
                  </DialogTitle>
                  <DialogDescription className="text-text-muted mt-1">
                    {refreshSelectedIncident.description}
                  </DialogDescription>
                </div>
                <Badge
                  className={`shrink-0 border ${STATUS_COLORS[refreshSelectedIncident.status]}`}
                >
                  {STATUS_LABELS[refreshSelectedIncident.status]}
                </Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 min-h-0 pr-2">
              <div className="space-y-5 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-text-muted text-xs">Category</span>
                    <div className="mt-1">
                      <Badge
                        className={`border text-xs ${CATEGORY_COLORS[refreshSelectedIncident.category]}`}
                      >
                        {CATEGORY_LABELS[refreshSelectedIncident.category]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Severity</span>
                    <div className="mt-1">
                      <Badge
                        className={`border text-xs ${SEVERITY_COLORS[refreshSelectedIncident.severity]}`}
                      >
                        {refreshSelectedIncident.severity}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Zone</span>
                    <p className="text-text-primary mt-1">
                      {refreshSelectedIncident.zone}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Reported By</span>
                    <p className="text-text-primary mt-1">
                      {refreshSelectedIncident.reportedBy}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Created</span>
                    <p className="text-text-primary mt-1">
                      {new Date(
                        refreshSelectedIncident.createdAt
                      ).toLocaleString("en-US", { hour12: false })}
                    </p>
                  </div>
                  {refreshSelectedIncident.assignedTo && (
                    <div>
                      <span className="text-text-muted text-xs">
                        Assigned To
                      </span>
                      <p className="text-text-primary mt-1">
                        {refreshSelectedIncident.assignedTo}
                      </p>
                    </div>
                  )}
                  {refreshSelectedIncident.resolutionCode && (
                    <div className="col-span-2">
                      <span className="text-text-muted text-xs">
                        Resolution
                      </span>
                      <p className="text-text-primary mt-1">
                        {RESOLUTION_CODES.find(
                          (r) => r.code === refreshSelectedIncident.resolutionCode
                        )?.label ?? refreshSelectedIncident.resolutionCode}
                      </p>
                    </div>
                  )}
                </div>

                {refreshSelectedIncident.tags.length > 0 && (
                  <div>
                    <span className="text-text-muted text-xs block mb-1.5">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {refreshSelectedIncident.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-surface-alt text-text-muted border-0"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <span className="text-text-muted text-xs font-medium">
                    Actions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(refreshSelectedIncident.status === "open" ||
                      refreshSelectedIncident.status === "escalated") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssignOpen(true);
                          setResolutionOpen(false);
                        }}
                        className="border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        Assign
                      </Button>
                    )}
                    {refreshSelectedIncident.status === "assigned" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            onAssign(
                              refreshSelectedIncident.id,
                              refreshSelectedIncident.assignedTo!,
                              refreshSelectedIncident.assignedToRole!
                            );
                            onOpenChange(false);
                          }}
                          className="bg-info hover:bg-info/90 text-white"
                        >
                          <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
                          Start Work
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEscalate}
                          className="border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                          Escalate
                        </Button>
                      </>
                    )}
                    {refreshSelectedIncident.status === "in_progress" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setResolutionOpen(true);
                            setAssignOpen(false);
                          }}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEscalate}
                          className="border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                          Escalate
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {assignOpen && (
                  <div className="rounded-lg border border-border bg-surface-alt p-3 space-y-3">
                    <span className="text-text-secondary text-xs font-medium">
                      Assign Staff
                    </span>
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger className="bg-surface border-border text-text-primary">
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAssign}
                        disabled={!assignee}
                        className="bg-info hover:bg-info/90 text-white"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAssignOpen(false);
                          setAssignee("");
                        }}
                        className="text-text-muted hover:text-text-primary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {resolutionOpen && (
                  <div className="rounded-lg border border-border bg-surface-alt p-3 space-y-3">
                    <span className="text-text-secondary text-xs font-medium">
                      Resolve Incident
                    </span>
                    <Select
                      value={resolutionCode}
                      onValueChange={setResolutionCode}
                    >
                      <SelectTrigger className="bg-surface border-border text-text-primary">
                        <SelectValue placeholder="Select resolution code" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOLUTION_CODES.map((rc) => (
                          <SelectItem key={rc.code} value={rc.code}>
                            {rc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Optional resolution note..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="bg-surface border-border text-text-primary placeholder:text-text-muted min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleResolve}
                        disabled={!resolutionCode}
                        className="bg-success hover:bg-success/90 text-white"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setResolutionOpen(false);
                          setResolutionCode("");
                          setResolutionNote("");
                        }}
                        className="text-text-muted hover:text-text-primary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <span className="text-text-muted text-xs font-medium">
                    Notes ({refreshSelectedIncident.notes.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {refreshSelectedIncident.notes.length === 0 && (
                      <p className="text-text-muted text-xs py-2">
                        No notes yet.
                      </p>
                    )}
                    {refreshSelectedIncident.notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-md bg-surface-alt border border-border p-2.5 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded-full bg-info/20 border border-info/30 flex items-center justify-center">
                              <span className="text-[7px] font-bold text-info">
                                {getInitials(note.author)}
                              </span>
                            </div>
                            <span className="text-xs text-text-secondary font-medium">
                              {note.author}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted">
                            {relativeTime(note.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-text-primary">{note.content}</p>
                        {note.mediaUrl && (
                          <div className="flex items-center gap-1 text-[10px] text-text-muted">
                            <Paperclip className="h-3 w-3" />
                            {note.mediaType ?? "attachment"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a note..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNote();
                        }
                      }}
                      aria-label="Add a note"
                      className="bg-surface border-border text-text-primary placeholder:text-text-muted text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteContent.trim()}
                      className="bg-surface-alt hover:bg-primary/10 text-text-secondary shrink-0"
                    >
                      Add Note
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <span className="text-text-muted text-xs font-medium">
                    History
                  </span>
                  <div className="space-y-1">
                    {refreshSelectedIncident.history.length === 0 && (
                      <p className="text-text-muted text-xs py-2">
                        No history yet.
                      </p>
                    )}
                    {refreshSelectedIncident.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-2 text-xs"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-text-muted mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-text-muted">
                            <span className="text-text-primary font-medium">
                              {entry.author}
                            </span>{" "}
                            changed status from{" "}
                            <span className="text-text-primary">
                              {STATUS_LABELS[entry.fromStatus]}
                            </span>{" "}
                            to{" "}
                            <span className="text-text-primary">
                              {STATUS_LABELS[entry.toStatus]}
                            </span>
                          </p>
                          {entry.note && (
                            <p className="text-text-muted mt-0.5">
                              &ldquo;{entry.note}&rdquo;
                            </p>
                          )}
                          <p className="text-text-muted mt-0.5">
                            {relativeTime(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
