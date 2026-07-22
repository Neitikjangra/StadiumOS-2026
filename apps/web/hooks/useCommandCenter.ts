"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import type { CommandCenterState, CommandCenterFilters } from "@/lib/command-center/types";

export function useCommandCenter(initialData: CommandCenterState) {
  const [data, setData] = useState<CommandCenterState>(initialData);
  const [filters, setFilters] = useState<CommandCenterFilters>(initialData.filters);
  const [isLoading, setIsLoading] = useState(false);
  const { connected, subscribe } = useSocket({ stadiumId: filters.stadiumId ?? undefined });
  const dataRef = useRef(data);
  dataRef.current = data;

  // Subscribe to real-time events
  useEffect(() => {
    if (!connected) return;

    const unsubs: (() => void)[] = [];

    // Anomaly events update risk signals and recommendations
    unsubs.push(
      subscribe("event:anomaly", (payload: any) => {
        if (!payload?.data) return;
        setData((prev) => {
          const newRisks = [...payload.data, ...prev.risks].slice(0, 30);
          return { ...prev, risks: newRisks, lastUpdated: new Date().toISOString() };
        });
      })
    );

    // Ingested events update live feed
    unsubs.push(
      subscribe("event:ingested", (payload: any) => {
        if (!payload?.data) return;
        const event = payload.data;

        // Update congestion data on crowd events
        if (event.channel === "crowd_density" && event.normalized) {
          setData((prev) => {
            const normalized = event.normalized;
            const zoneIdx = prev.congestion.findIndex((z) => z.zoneId === normalized.zoneId);
            const newCongestion = [...prev.congestion];
            if (zoneIdx >= 0) {
              newCongestion[zoneIdx] = {
                ...newCongestion[zoneIdx],
                currentCount: normalized.count,
                densityPercent: normalized.densityPercent,
                trend: normalized.trend,
                status: normalized.densityPercent > 90 ? "critical" : normalized.densityPercent > 75 ? "congested" : normalized.densityPercent > 50 ? "elevated" : "normal",
                lastUpdated: new Date().toISOString(),
              };
            }
            return { ...prev, congestion: newCongestion, lastUpdated: new Date().toISOString() };
          });
        }

        // Update queues on queue events
        if (event.channel === "queue_length" && event.normalized) {
          setData((prev) => {
            const n = event.normalized;
            const queueIdx = prev.queues.findIndex((q) => q.id === n.id);
            const newQueues = [...prev.queues];
            if (queueIdx >= 0) {
              newQueues[queueIdx] = {
                ...newQueues[queueIdx],
                length: n.length,
                waitTime: n.waitTimeMinutes,
                status: n.status,
                lastUpdated: new Date().toISOString(),
              };
            }
            return { ...prev, queues: newQueues, lastUpdated: new Date().toISOString() };
          });
        }

        // Update stadiums on gate events
        if (event.channel === "gate_throughput" && event.normalized) {
          setData((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
        }
      })
    );

    // Metric updates
    unsubs.push(
      subscribe("metrics:update", () => {
        setData((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [connected, subscribe]);

  // Refresh data from server
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/command-center?" + new URLSearchParams(filters as any), { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Apply filters
  const updateFilters = useCallback((newFilters: Partial<CommandCenterFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Acknowledge an incident
  const acknowledgeIncident = useCallback(async (incidentId: string) => {
    try {
      await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "acknowledged", updateNote: "Acknowledged from Command Center" }),
      });
      setData((prev) => ({
        ...prev,
        incidents: prev.incidents.map((i) =>
          i.id === incidentId ? { ...i, status: "acknowledged" } : i
        ),
        lastUpdated: new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Failed to acknowledge incident:", err);
    }
  }, []);

  // Acknowledge a risk signal
  const acknowledgeRisk = useCallback(async (riskId: string) => {
    try {
      await fetch(`/api/anomalies/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: riskId }),
      });
      setData((prev) => ({
        ...prev,
        risks: prev.risks.map((r) => r.id === riskId ? { ...r, acknowledged: true } : r),
        lastUpdated: new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Failed to acknowledge risk:", err);
    }
  }, []);

  return {
    data,
    filters,
    connected,
    isLoading,
    refresh,
    updateFilters,
    acknowledgeIncident,
    acknowledgeRisk,
  };
}
