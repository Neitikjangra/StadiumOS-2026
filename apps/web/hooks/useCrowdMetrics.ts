"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { simBusOn } from "@/lib/simulator-bus";

interface CrowdMetrics {
  totalInside: number;
  totalCapacity: number;
  occupancyPercent: number;
  inboundRate: number;
  outboundRate: number;
  netFlow: number;
  gateMetrics: GateMetric[];
  zoneMetrics: ZoneMetric[];
  lastUpdated: Date;
}

interface GateMetric {
  gateId: string;
  gateName: string;
  inbound: number;
  outbound: number;
  throughput: number;
  status: string;
}

interface ZoneMetric {
  zoneId: string;
  zoneName: string;
  currentCount: number;
  capacity: number;
  densityPercent: number;
  trend: string;
}

const EMPTY_METRICS: CrowdMetrics = {
  totalInside: 0,
  totalCapacity: 0,
  occupancyPercent: 0,
  inboundRate: 0,
  outboundRate: 0,
  netFlow: 0,
  gateMetrics: [],
  zoneMetrics: [],
  lastUpdated: new Date(),
};

export function useCrowdMetrics(stadiumId: string) {
  const { connected: socketConnected, subscribe } = useSocket({ stadiumId });
  const [metrics, setMetrics] = useState<CrowdMetrics>(EMPTY_METRICS);
  const [busConnected, setBusConnected] = useState(false);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      simBusOn("sim:crowd_update", (payload: any) => {
        setBusConnected(true);
        const data = payload.data;
        if (!data) return;

        setMetrics((prev) => {
          const zoneIdx = prev.zoneMetrics.findIndex(
            (z) => z.zoneId === data.zoneId
          );
          const newZoneMetrics = [...prev.zoneMetrics];

          if (zoneIdx >= 0) {
            newZoneMetrics[zoneIdx] = {
              ...newZoneMetrics[zoneIdx],
              currentCount: data.count,
              densityPercent: data.densityPercent,
              trend: data.trend,
            };
          } else if (data.zoneId) {
            newZoneMetrics.push({
              zoneId: data.zoneId,
              zoneName: data.zoneId,
              currentCount: data.count,
              capacity: data.capacity,
              densityPercent: data.densityPercent,
              trend: data.trend,
            });
          }

          const totalInside = newZoneMetrics.reduce(
            (sum, z) => sum + z.currentCount,
            0
          );
          const totalCapacity = newZoneMetrics.reduce(
            (sum, z) => sum + z.capacity,
            0
          );

          return {
            ...prev,
            totalInside: totalInside || prev.totalInside,
            totalCapacity: totalCapacity || prev.totalCapacity,
            occupancyPercent: totalCapacity
              ? (totalInside / totalCapacity) * 100
              : prev.occupancyPercent,
            zoneMetrics: newZoneMetrics,
            lastUpdated: new Date(),
          };
        });
      })
    );

    unsubs.push(
      simBusOn("sim:gate_update", (payload: any) => {
        setBusConnected(true);
        const data = payload.data;
        if (!data) return;

        setMetrics((prev) => {
          const gateIdx = prev.gateMetrics.findIndex(
            (g) => g.gateId === data.gateId
          );
          const newGateMetrics = [...prev.gateMetrics];

          const gateMetric: GateMetric = {
            gateId: data.gateId,
            gateName: data.gateName ?? data.gateId,
            inbound: data.inbound,
            outbound: data.outbound,
            throughput: data.throughputPerMin,
            status: data.status,
          };

          if (gateIdx >= 0) {
            newGateMetrics[gateIdx] = gateMetric;
          } else {
            newGateMetrics.push(gateMetric);
          }

          const inboundRate = newGateMetrics.reduce(
            (sum, g) => sum + g.inbound,
            0
          );
          const outboundRate = newGateMetrics.reduce(
            (sum, g) => sum + g.outbound,
            0
          );

          return {
            ...prev,
            gateMetrics: newGateMetrics,
            inboundRate,
            outboundRate,
            netFlow: inboundRate - outboundRate,
            lastUpdated: new Date(),
          };
        });
      })
    );

    if (socketConnected) {
      unsubs.push(
        subscribe("event:crowd_update", (payload: any) => {
          const data = payload.data;
          if (!data) return;

          setMetrics((prev) => {
            const zoneIdx = prev.zoneMetrics.findIndex(
              (z) => z.zoneId === data.zoneId
            );
            const newZoneMetrics = [...prev.zoneMetrics];

            if (zoneIdx >= 0) {
              newZoneMetrics[zoneIdx] = {
                ...newZoneMetrics[zoneIdx],
                currentCount: data.count,
                densityPercent: data.densityPercent,
                trend: data.trend,
              };
            } else if (data.zoneId) {
              newZoneMetrics.push({
                zoneId: data.zoneId,
                zoneName: data.zoneId,
                currentCount: data.count,
                capacity: data.capacity,
                densityPercent: data.densityPercent,
                trend: data.trend,
              });
            }

            const totalInside = newZoneMetrics.reduce(
              (sum, z) => sum + z.currentCount,
              0
            );
            const totalCapacity = newZoneMetrics.reduce(
              (sum, z) => sum + z.capacity,
              0
            );

            return {
              ...prev,
              totalInside: totalInside || prev.totalInside,
              totalCapacity: totalCapacity || prev.totalCapacity,
              occupancyPercent: totalCapacity
                ? (totalInside / totalCapacity) * 100
                : prev.occupancyPercent,
              zoneMetrics: newZoneMetrics,
              lastUpdated: new Date(),
            };
          });
        })
      );

      unsubs.push(
        subscribe("event:gate_update", (payload: any) => {
          const data = payload.data;
          if (!data) return;

          setMetrics((prev) => {
            const gateIdx = prev.gateMetrics.findIndex(
              (g) => g.gateId === data.gateId
            );
            const newGateMetrics = [...prev.gateMetrics];

            const gateMetric: GateMetric = {
              gateId: data.gateId,
              gateName: data.gateName ?? data.gateId,
              inbound: data.inbound,
              outbound: data.outbound,
              throughput: data.throughputPerMin,
              status: data.status,
            };

            if (gateIdx >= 0) {
              newGateMetrics[gateIdx] = gateMetric;
            } else {
              newGateMetrics.push(gateMetric);
            }

            const inboundRate = newGateMetrics.reduce(
              (sum, g) => sum + g.inbound,
              0
            );
            const outboundRate = newGateMetrics.reduce(
              (sum, g) => sum + g.outbound,
              0
            );

            return {
              ...prev,
              gateMetrics: newGateMetrics,
              inboundRate,
              outboundRate,
              netFlow: inboundRate - outboundRate,
              lastUpdated: new Date(),
            };
          });
        })
      );
    }

    return () => unsubs.forEach((u) => u());
  }, [socketConnected, stadiumId, subscribe]);

  return { metrics, connected: socketConnected || busConnected };
}
