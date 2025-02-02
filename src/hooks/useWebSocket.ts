import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RaceUpdate, RoundUpdate, WinnerUpdate } from "../types/websocketTypes";

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:4001";

console.debug("[DEBUG] 🔄 Verbinden met WebSocket URL:", SOCKET_URL);

// ✅ Singleton instance om dubbele connecties te voorkomen
let socketInstance: Socket | null = null;

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [raceData, setRaceData] = useState<RaceUpdate | null>(null);
  const [roundData, setRoundData] = useState<RoundUpdate | null>(null);
  const [winnerData, setWinnerData] = useState<WinnerUpdate | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      console.debug("[DEBUG] 🌐 Nieuwe WebSocket-verbinding maken...");
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket"],
      });
    }

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => console.log("[SOCKET] ✅ Verbonden met WebSocket"));
    socketInstance.on("disconnect", () => console.log("[SOCKET] ❌ WebSocket verbinding verbroken"));

    // ✅ Event listeners
    socketInstance.on("raceCreated", (update: RaceUpdate) => {
      console.log("[SOCKET] 🏁 Nieuw race gecreëerd:", update);
      setRaceData(update);
    });

    socketInstance.on("raceUpdate", (update: RaceUpdate) => {
      console.log("[SOCKET] 🏁 Race Update:", update);
      setRaceData(update);
    });

    socketInstance.on("roundUpdate", (update: RoundUpdate) => {
      console.log("[SOCKET] 🔄 Round Update:", update);
      setRoundData(update);
    });

    socketInstance.on("winnerUpdate", (update: WinnerUpdate) => {
      console.log("[SOCKET] 🏆 Winner Update:", update);
      setWinnerData(update);
    });

    return () => {
      console.debug("[DEBUG] ❌ WebSocket blijft actief, wordt niet afgesloten.");
    };
  }, []);

  return { socket: socketRef.current, raceData, roundData, winnerData };
};