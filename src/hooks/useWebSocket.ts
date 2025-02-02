import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RaceUpdate, RoundUpdate, WinnerUpdate } from "../types/websocketTypes";

const SOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL;

  console.log("[DEBUG] 🔄 Verbinden met WebSocket URL:", SOCKET_URL);

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [raceData, setRaceData] = useState<RaceUpdate | null>(null);
  const [roundData, setRoundData] = useState<RoundUpdate | null>(null);
  const [winnerData, setWinnerData] = useState<WinnerUpdate | null>(null);

  useEffect(() => {
    const newSocket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
    }) as Socket; // ✅ TypeScript laten weten dat dit een Socket instance is

    newSocket.on("connect", () => console.log("[SOCKET] ✅ Verbonden met WebSocket"));
    newSocket.on("disconnect", () => console.log("[SOCKET] ❌ WebSocket verbinding verbroken"));

    // Event listeners
    newSocket.on("raceUpdate", (update: RaceUpdate) => {
      console.log("[SOCKET] 🏁 Race Update:", update);
      setRaceData(update);
    });

    newSocket.on("roundUpdate", (update: RoundUpdate) => {
      console.log("[SOCKET] 🔄 Round Update:", update);
      setRoundData(update);
    });

    newSocket.on("winnerUpdate", (update: WinnerUpdate) => {
      console.log("[SOCKET] 🏆 Winner Update:", update);
      setWinnerData(update);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, raceData, roundData, winnerData };
};