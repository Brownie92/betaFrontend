import { createContext, useContext, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { useWebSocket } from "../hooks/useWebSocket";
import { RaceUpdate, RoundUpdate, WinnerUpdate } from "../types/websocketTypes";

// ✅ Type definitie voor WebSocketContext
interface WebSocketContextType {
  socket: Socket | null;
  raceData: RaceUpdate | null;
  roundData: RoundUpdate | null;
  winnerData: WinnerUpdate | null;
}

// ✅ Correcte default waarde (zonder `any`)
const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { socket, raceData, roundData, winnerData } = useWebSocket();

  return (
    <WebSocketContext.Provider
      value={{ socket, raceData, roundData, winnerData }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// ✅ Custom hook voor het gebruiken van de WebSocketContext
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
