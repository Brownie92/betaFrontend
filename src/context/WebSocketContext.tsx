import { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  RaceUpdate,
  RoundUpdate,
  WinnerUpdate,
  VoteUpdate,
} from "../types/websocketTypes";

// ✅ WebSocketContext Type
interface WebSocketContextType {
  socket: ReturnType<typeof useWebSocket>["socket"];
  raceData: RaceUpdate | null;
  roundData: RoundUpdate | null;
  winnerData: WinnerUpdate | null;
  voteData: VoteUpdate | null;
}

// ✅ Context aanmaken (default waarde: undefined)
const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { socket, raceData, roundData, winnerData, voteData } = useWebSocket();

  return (
    <WebSocketContext.Provider
      value={{ socket, raceData, roundData, winnerData, voteData }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// ✅ Custom hook om WebSocketContext te gebruiken
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
