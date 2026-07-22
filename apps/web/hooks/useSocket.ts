"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  stadiumId?: string;
  enabled?: boolean;
}

interface SocketState {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
}

export function useSocket({ stadiumId, enabled = true }: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    reconnecting: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    const socket = io(window.location.origin, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setState({ connected: true, reconnecting: false, error: null });
      if (stadiumId) {
        socket.emit("subscribe:stadium", { stadiumId });
      }
    });

    socket.on("disconnect", () => {
      setState((prev) => ({ ...prev, connected: false, reconnecting: true }));
    });

    socket.on("connect_error", (err) => {
      setState((prev) => ({ ...prev, error: err.message }));
    });

    socketRef.current = socket;

    return () => {
      if (stadiumId) {
        socket.emit("unsubscribe:stadium", { stadiumId });
      }
      socket.disconnect();
    };
  }, [stadiumId, enabled]);

  const subscribe = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { ...state, subscribe, emit, socket: socketRef.current };
}
