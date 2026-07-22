"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { simBusEmit } from "@/lib/simulator-bus";

interface SimulatorConfig {
  stadiumId: string;
  eventsPerSecond: number;
  scenario: "pre_match" | "match_day" | "post_match" | "emergency" | "custom";
  enabled: boolean;
}

interface SimulatorState {
  running: boolean;
  eventsSent: number;
  anomaliesDetected: number;
  errorsCount: number;
  lastEventAt: Date | null;
}

interface SimulatorEvent {
  channel: string;
  payload: any;
}

export function useSimulator() {
  const [config, setConfig] = useState<SimulatorConfig>({
    stadiumId: "metlife",
    eventsPerSecond: 2,
    scenario: "match_day",
    enabled: false,
  });

  const [state, setState] = useState<SimulatorState>({
    running: false,
    eventsSent: 0,
    anomaliesDetected: 0,
    errorsCount: 0,
    lastEventAt: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generateEvent = useCallback(
    (scenario: string): SimulatorEvent => {
      const channels = [
        "crowd_density",
        "gate_throughput",
        "queue_length",
        "weather_feed",
        "device_heartbeat",
      ];

      // Weight channels by scenario
      let weights: number[];
      switch (scenario) {
        case "pre_match":
          weights = [0.3, 0.35, 0.2, 0.05, 0.1];
          break;
        case "match_day":
          weights = [0.25, 0.2, 0.25, 0.1, 0.2];
          break;
        case "post_match":
          weights = [0.3, 0.35, 0.15, 0.05, 0.15];
          break;
        case "emergency":
          weights = [0.4, 0.2, 0.1, 0.2, 0.1];
          break;
        default:
          weights = [0.2, 0.2, 0.2, 0.2, 0.2];
      }

      // Weighted random selection
      const rand = Math.random();
      let cumulative = 0;
      let channelIdx = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          channelIdx = i;
          break;
        }
      }

      const channel = channels[channelIdx];
      const gates = ["North Gate", "South Gate", "East Gate", "West Gate", "VIP North", "VIP South"];
      const zones = ["Lower Tier North", "Lower Tier South", "Upper Tier East", "Concourse", "VIP Lounge"];
      const queueTypes = ["entry_gate", "security_check", "food_beverage", "restroom"];

      const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

      let payload: any;
      switch (channel) {
        case "crowd_density": {
          const count = Math.floor(Math.random() * 5000) + 1000;
          const capacity = 10000;
          payload = {
            zoneId: `zone-${Math.floor(Math.random() * 10)}`,
            sensorId: `sensor-${Math.floor(Math.random() * 20)}`,
            count,
            capacity,
            densityPercent: (count / capacity) * 100,
            trend: pick(["rising", "stable", "falling"]),
            latitude: 40.8135 + (Math.random() - 0.5) * 0.01,
            longitude: -74.0745 + (Math.random() - 0.5) * 0.01,
          };
          break;
        }
        case "gate_throughput": {
          const gateIdx = Math.floor(Math.random() * gates.length);
          payload = {
            gateId: `gate-${gateIdx}`,
            gateName: gates[gateIdx],
            inbound: Math.floor(Math.random() * 200),
            outbound: Math.floor(Math.random() * 100),
            netFlow: Math.floor(Math.random() * 100) - 30,
            throughputPerMin: Math.floor(Math.random() * 150) + 20,
            status: pick(["normal", "normal", "normal", "congested", "critical"]),
          };
          break;
        }
        case "queue_length": {
          payload = {
            queueType: pick(queueTypes),
            locationId: `loc-${Math.floor(Math.random() * 15)}`,
            locationName: pick([...gates, ...zones]),
            length: Math.floor(Math.random() * 80),
            waitTimeMinutes: Math.floor(Math.random() * 30),
            serviceRate: Math.floor(Math.random() * 20) + 5,
            status: pick(["short", "moderate", "long", "very_long"]),
          };
          break;
        }
        case "weather_feed": {
          payload = {
            temperature: 28 + Math.random() * 10,
            humidity: 50 + Math.random() * 40,
            windSpeed: Math.random() * 50,
            conditions: pick(["Clear", "Partly Cloudy", "Overcast", "Light Rain", "Thunderstorms"]),
            alerts: Math.random() > 0.8
              ? [{ type: "wind", severity: "warning", message: "Wind advisory in effect" }]
              : [],
            uvIndex: Math.floor(Math.random() * 11),
          };
          break;
        }
        case "device_heartbeat": {
          payload = {
            deviceId: `device-${Math.floor(Math.random() * 10)}`,
            platform: pick(["ios", "android", "web"]),
            status: pick(["online", "online", "online", "degraded"]),
            batteryLevel: Math.floor(Math.random() * 100),
            signalStrength: Math.random() * 100,
          };
          break;
        }
        default:
          payload = {};
      }

      return { channel, payload };
    },
    []
  );

  const sendEvent = useCallback(
    async (event: SimulatorEvent) => {
      const eventRecord = {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        eventType: "ingested",
        channel: event.channel,
        normalized: event.payload,
        timestamp: new Date().toISOString(),
      };

      simBusEmit("sim:ingested", {
        data: eventRecord,
        anomalies: [],
        timestamp: eventRecord.timestamp,
      });

      if (event.channel === "crowd_density") {
        simBusEmit("sim:crowd_update", { data: event.payload });
      } else if (event.channel === "gate_throughput") {
        simBusEmit("sim:gate_update", { data: event.payload });
      }

      setState((prev) => ({
        ...prev,
        eventsSent: prev.eventsSent + 1,
        lastEventAt: new Date(),
      }));

      try {
        await fetch(
          `/api/ingest/${event.channel.replace("_", "-")}?stadiumId=${config.stadiumId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(event.payload),
          }
        );
      } catch {
        // Best-effort: bus is the primary delivery mechanism
      }
    },
    [config.stadiumId]
  );

  const start = useCallback(() => {
    if (intervalRef.current) return;

    setState((prev) => ({ ...prev, running: true }));
    setConfig((prev) => ({ ...prev, enabled: true }));

    const interval = Math.max(100, 1000 / config.eventsPerSecond);

    intervalRef.current = setInterval(() => {
      const event = generateEvent(config.scenario);
      sendEvent(event);
    }, interval);
  }, [config.eventsPerSecond, config.scenario, generateEvent, sendEvent]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, running: false }));
    setConfig((prev) => ({ ...prev, enabled: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({
      running: false,
      eventsSent: 0,
      anomaliesDetected: 0,
      errorsCount: 0,
      lastEventAt: null,
    });
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    config,
    setConfig,
    state,
    start,
    stop,
    reset,
  };
}
