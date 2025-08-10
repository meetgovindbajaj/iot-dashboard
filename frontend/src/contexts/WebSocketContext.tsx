"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { SensorReading, SensorUpdate, Alert } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  latestReadings: SensorReading[];
  alerts: Alert[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestReadings, setLatestReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(
      process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001",
      {
        auth: { token },
        transports: ["websocket"],
        upgrade: false,
      }
    );

    newSocket.on("connect", () => {
      console.log("🔌 WebSocket connected");
      setIsConnected(true);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!newSocket.connected) {
          newSocket.connect();
        }
      }, 5000);
    });

    newSocket.on("latestReadings", (readings: SensorReading[]) => {
      setLatestReadings(readings);
    });

    newSocket.on("sensorUpdate", (update: SensorUpdate) => {
      setLatestReadings((prev) =>
        prev.map((reading) => {
          if (reading.sensor.sensorId === update.sensorId) {
            return {
              ...reading,
              data: {
                _id: `${Date.now()}`,
                sensorId: update.sensorId,
                value: update.value,
                timestamp: update.timestamp,
              },
            };
          }
          return reading;
        })
      );
    });

    newSocket.on("alert", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts

      // Show toast notification
      const toastOptions = {
        duration: alert.severity === "error" ? 6000 : 4000,
      };

      switch (alert.severity) {
        case "error":
          toast.error(alert.message, toastOptions);
          break;
        case "warning":
          toast(alert.message, { ...toastOptions, icon: "⚠️" });
          break;
        default:
          toast.success(alert.message, toastOptions);
      }
    });

    newSocket.on("error", (error: { message: string }) => {
      console.error("WebSocket error:", error);
      toast.error(`Connection error: ${error.message}`);
    });

    setSocket(newSocket);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <WebSocketContext.Provider
      value={{ socket, isConnected, latestReadings, alerts }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
