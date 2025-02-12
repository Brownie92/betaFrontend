import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RaceUpdate, RoundUpdate, WinnerUpdate, VoteUpdate } from "../types/websocketTypes";

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:4001";

// Singleton instance to prevent multiple WebSocket connections
let socketInstance: Socket | null = null;

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [raceData, setRaceData] = useState<RaceUpdate | null>(null);
  const [roundData, setRoundData] = useState<RoundUpdate | null>(null);
  const [winnerData, setWinnerData] = useState<WinnerUpdate | null>(null);
  const [voteData, setVoteData] = useState<VoteUpdate | null>(null);
  const [latestVote, setLatestVote] = useState<VoteUpdate | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, { transports: ["websocket"] });
    }

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => console.log("[SOCKET] ✅ Connected"));
    socketInstance.on("disconnect", () => console.log("[SOCKET] ❌ Disconnected"));

    // WebSocket event listeners
    socketInstance.on("raceCreated", (update: RaceUpdate) => setRaceData(update));
    socketInstance.on("raceUpdate", (update: RaceUpdate) => setRaceData(update));

    socketInstance.on("roundUpdate", (update: RoundUpdate) => {
      setRoundData(update);
      setRaceData((prevRace) =>
        prevRace ? { ...prevRace, currentRound: update.roundNumber } : prevRace
      );
    });

    socketInstance.on("raceClosed", (update: RaceUpdate) => setRaceData(update));
    socketInstance.on("winnerUpdate", (update: WinnerUpdate) => setWinnerData(update));

    socketInstance.on("voteUpdate", (update: VoteUpdate) => setLatestVote(update));

    return () => {
      socketInstance?.off("raceCreated");
      socketInstance?.off("raceUpdate");
      socketInstance?.off("roundUpdate");
      socketInstance?.off("winnerUpdate");
      socketInstance?.off("voteUpdate");
    };
  }, []);

  // Update state when a new vote is received
  useEffect(() => {
    if (latestVote) {
      setVoteData(latestVote);
    }
  }, [latestVote]);

  return { socket: socketRef.current, raceData, roundData, winnerData, voteData };
};