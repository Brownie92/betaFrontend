import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RaceUpdate, RoundUpdate, WinnerUpdate, VoteUpdate } from "../types/websocketTypes";

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:4001";

console.debug("[DEBUG] 🔄 Connecting to WebSocket:", SOCKET_URL);

// ✅ Singleton to prevent multiple connections
let socketInstance: Socket | null = null;

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [raceData, setRaceData] = useState<RaceUpdate | null>(null);
  const [roundData, setRoundData] = useState<RoundUpdate | null>(null);
  const [winnerData, setWinnerData] = useState<WinnerUpdate | null>(null);
  const [voteData, setVoteData] = useState<VoteUpdate | null>(null);
  const [latestVote, setLatestVote] = useState<VoteUpdate | null>(null); // ✅ Nieuwe state voor votes

  useEffect(() => {
    if (!socketInstance) {
      console.debug("[DEBUG] 🌐 Creating new WebSocket connection...");
      socketInstance = io(SOCKET_URL, { transports: ["websocket"] });
    }

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => console.log("[SOCKET] ✅ Connected"));
    socketInstance.on("disconnect", () => console.log("[SOCKET] ❌ Disconnected"));

    // ✅ WebSocket events
    socketInstance.on("raceCreated", (update: RaceUpdate) => {
      console.log("[SOCKET] 🏁 New race created:", update);
      setRaceData(update);
    });

    socketInstance.on("raceUpdate", (update: RaceUpdate) => {
      console.log("[SOCKET] 🏁 Race Update:", update);
      setRaceData(update);
    });

    socketInstance.on("roundUpdate", (update: RoundUpdate) => {
      console.log("[SOCKET] 🔄 Round Update:", update);
      setRoundData(update);

      setRaceData((prevRace) =>
        prevRace ? { ...prevRace, currentRound: update.roundNumber } : prevRace
      );
    });

    socketInstance.on("winnerUpdate", (update: WinnerUpdate) => {
      console.log("[SOCKET] 🏆 Winner Update:", update);
      setWinnerData(update);
    });

    // ✅ **Vote updates via WebSocket**
    socketInstance.on("voteUpdate", (update: VoteUpdate) => {
      console.log("[SOCKET] 🗳️ Nieuwe stem binnengekomen:", update);
      setLatestVote(update); // ✅ Zet de laatste vote update in een aparte state
    });

    return () => {
      console.debug("[DEBUG] ❌ Cleaning up WebSocket listeners.");
      socketInstance?.off("raceCreated");
      socketInstance?.off("raceUpdate");
      socketInstance?.off("roundUpdate");
      socketInstance?.off("winnerUpdate");
      socketInstance?.off("voteUpdate");
    };
  }, []);

  // ✅ **Trigger een UI update zodra `latestVote` verandert**
  useEffect(() => {
    if (latestVote) {
      console.log("🔄 [UPDATE] VoteData bijgewerkt in state:", latestVote);
      setVoteData(latestVote);
    }
  }, [latestVote]);

  return { socket: socketRef.current, raceData, roundData, winnerData, voteData };
};