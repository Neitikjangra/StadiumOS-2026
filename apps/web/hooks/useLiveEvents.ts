"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { simBusOn } from "@/lib/simulator-bus";

interface LiveEvent {
  id: string;
  type: string;
  channel: string;
  data: any;
  anomalies: any[];
  timestamp: string;
}

interface UseLiveEventsOptions {
  stadiumId: string;
  channels?: string[];
  maxEvents?: number;
}

export function useLiveEvents({
  stadiumId,
  channels,
  maxEvents = 100,
}: UseLiveEventsOptions) {
  const { connected: socketConnected, subscribe } = useSocket({ stadiumId });
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const eventsRef = useRef<LiveEvent[]>([]);
  const [busConnected, setBusConnected] = useState(false);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      simBusOn("sim:ingested", (payload: any) => {
        setBusConnected(true);
        if (channels && channels.length > 0 && !channels.includes(payload.data.channel)) {
          return;
        }

        const event: LiveEvent = {
          id: payload.data.id,
          type: payload.data.eventType,
          channel: payload.data.channel,
          data: payload.data.normalized,
          anomalies: payload.anomalies ?? [],
          timestamp: payload.timestamp,
        };

        eventsRef.current = [event, ...eventsRef.current].slice(0, maxEvents);
        setEvents([...eventsRef.current]);

        if (event.anomalies.length > 0) {
          setAnomalies((prev) => [...event.anomalies, ...prev].slice(0, 50));
        }
      })
    );

    if (socketConnected) {
      unsubs.push(
        subscribe("event:ingested", (payload: any) => {
          if (channels && channels.length > 0 && !channels.includes(payload.data.channel)) {
            return;
          }

          const event: LiveEvent = {
            id: payload.data.id,
            type: payload.data.eventType,
            channel: payload.data.channel,
            data: payload.data.normalized,
            anomalies: payload.anomalies ?? [],
            timestamp: payload.timestamp,
          };

          eventsRef.current = [event, ...eventsRef.current].slice(0, maxEvents);
          setEvents([...eventsRef.current]);

          if (event.anomalies.length > 0) {
            setAnomalies((prev) => [...event.anomalies, ...prev].slice(0, 50));
          }
        })
      );

      unsubs.push(
        subscribe("event:anomaly", (payload: any) => {
          if (payload.data) {
            setAnomalies((prev) => [...payload.data, ...prev].slice(0, 50));
          }
        })
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [socketConnected, stadiumId, subscribe, maxEvents, channels]);

  const clearEvents = useCallback(() => {
    eventsRef.current = [];
    setEvents([]);
  }, []);

  const clearAnomalies = useCallback(() => {
    setAnomalies([]);
  }, []);

  const acknowledgeAnomaly = useCallback((anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === anomalyId ? { ...a, acknowledged: true } : a
      )
    );
  }, []);

  return {
    events,
    anomalies,
    connected: socketConnected || busConnected,
    clearEvents,
    clearAnomalies,
    acknowledgeAnomaly,
    eventCount: events.length,
  };
}
