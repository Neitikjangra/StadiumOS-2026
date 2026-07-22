"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  CommandCenterFilters as FilterState,
  StadiumHealth,
} from "@/lib/command-center/types";

interface CommandCenterFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  stadiums: StadiumHealth[];
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (val: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label ?? value
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs transition-colors ${
          value
            ? "bg-surface-alt border-border text-text-primary"
            : "bg-surface-alt border-border text-text-muted hover:border-border hover:text-text-secondary"
        }`}
      >
        <span className="text-[10px] text-text-muted uppercase tracking-wider mr-1">
          {label}
        </span>
        {selectedLabel ? (
          <>
            <span className="truncate max-w-[100px]">{selectedLabel}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(null); } }}
              className="ml-0.5 p-0.5 rounded hover:bg-surface-alt text-text-muted hover:text-text-primary cursor-pointer"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : (
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl shadow-black/30 z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value === value ? null : option.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                option.value === value
                  ? "bg-surface-alt text-text-primary"
                  : "text-text-muted hover:bg-surface-alt hover:text-text-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommandCenterFilters({
  filters,
  onFilterChange,
  stadiums,
}: CommandCenterFiltersProps) {
  const stadiumOptions = stadiums.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const severityOptions = [
    { value: "critical", label: "Critical" },
    { value: "warning", label: "Warning" },
    { value: "info", label: "Info" },
  ];

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const activeFilterCount = [
    filters.stadiumId,
    filters.severity,
    filters.status,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 mr-1">
        <Filter className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
          Filters
        </span>
        {activeFilterCount > 0 && (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px] h-4 px-1.5"
          >
            {activeFilterCount}
          </Badge>
        )}
      </div>

      <Dropdown
        label="Stadium"
        value={filters.stadiumId}
        options={stadiumOptions}
        onChange={(val) => onFilterChange({ stadiumId: val })}
      />

      <Dropdown
        label="Severity"
        value={filters.severity}
        options={severityOptions}
        onChange={(val) => onFilterChange({ severity: val })}
      />

      <Dropdown
        label="Status"
        value={filters.status}
        options={statusOptions}
        onChange={(val) => onFilterChange({ status: val })}
      />

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[10px] text-text-muted hover:text-text-primary px-2"
          onClick={() =>
            onFilterChange({
              stadiumId: null,
              severity: null,
              status: null,
            })
          }
        >
          <X className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      )}
    </div>
  );
}
