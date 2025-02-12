import { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  RaceUpdate,
  RoundUpdate,
  WinnerUpdate,
  VoteUpdate,
} from "../types/websocketTypes";

// Define WebSocket context type
interface WebSocketContextType {
  socket: ReturnType<typeof useWebSocket>["socket"];
  raceData: RaceUpdate | null;
  roundData: RoundUpdate | null;
  winnerData: WinnerUpdate | null;
  voteData: VoteUpdate | null;
}

// Create context with default value as undefined
const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

// WebSocketProvider component
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

// Custom hook to access WebSocketContext
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
