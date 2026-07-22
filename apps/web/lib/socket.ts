import type { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;
let redisSub: any = null;
const subscribedStadiums = new Set<string>();

export function getSocketServer(): SocketIOServer | null {
  return io;
}

function getRedisSub() {
  if (redisSub) return redisSub;
  try {
    const IORedis = require("ioredis");
    redisSub = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      enableOfflineQueue: false,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    return redisSub;
  } catch {
    return null;
  }
}

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  try {
    const { Server: SocketIOServer } = require("socket.io");
    const server = new SocketIOServer(httpServer, {
      path: "/api/socketio",
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    server.on("connection", (socket: any) => {
      socket.on("subscribe:stadium", ({ stadiumId }: { stadiumId: string }) => {
        socket.join(`stadium:${stadiumId}`);
        socket.join(`stadium:${stadiumId}:anomalies`);
        socket.join(`stadium:${stadiumId}:metrics`);
      });
      socket.on("unsubscribe:stadium", ({ stadiumId }: { stadiumId: string }) => {
        socket.leave(`stadium:${stadiumId}`);
        socket.leave(`stadium:${stadiumId}:anomalies`);
        socket.leave(`stadium:${stadiumId}:metrics`);
      });
      socket.on("subscribe:zone", ({ stadiumId, zoneId }: { stadiumId: string; zoneId: string }) => {
        socket.join(`stadium:${stadiumId}:zone:${zoneId}`);
      });
    });

    const sub = getRedisSub();
    if (sub) {
      sub.on("message", (channel: string, message: string) => {
        const parts = channel.split(":");
        if (parts[0] !== "stadium") return;
        const stadiumId = parts[1];
        try {
          const data = JSON.parse(message);
          server.to(`stadium:${stadiumId}`).emit(data.type, data);
          if (parts[2] === "anomalies") {
            server.to(`stadium:${stadiumId}:anomalies`).emit(data.type, data);
          } else if (parts[2] === "metrics") {
            server.to(`stadium:${stadiumId}:metrics`).emit(data.type, data);
          }
        } catch {}
      });
    }
    io = server;
  } catch {}

  return io!;
}

export function ensureStadiumSubscription(stadiumId: string): void {
  if (subscribedStadiums.has(stadiumId)) return;
  const sub = getRedisSub();
  if (!sub) return;
  const channels = [
    `stadium:${stadiumId}:events`,
    `stadium:${stadiumId}:anomalies`,
    `stadium:${stadiumId}:metrics`,
    `stadium:${stadiumId}:crowd_density`,
    `stadium:${stadiumId}:gate_throughput`,
    `stadium:${stadiumId}:queue_length`,
    `stadium:${stadiumId}:incident_report`,
    `stadium:${stadiumId}:transit_feed`,
    `stadium:${stadiumId}:weather_feed`,
    `stadium:${stadiumId}:device_heartbeat`,
    `stadium:${stadiumId}:manual_update`,
    `stadium:${stadiumId}:fan_help_request`,
  ];
  for (const ch of channels) {
    sub.subscribe(ch);
  }
  subscribedStadiums.add(stadiumId);
}
