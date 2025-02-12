import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";
import MemeSelection from "../components/MemeSelection";
import VotingPhase from "../components/VotingPhase";
import WinnerDisplay from "../components/WinnerDisplay";
import { RaceUpdate, WinnerUpdate } from "../types/websocketTypes";

const RaceDetails = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { raceData, socket } = useWebSocketContext();
  const [race, setRace] = useState<RaceUpdate | null>(null);
  const [winner, setWinner] = useState<WinnerUpdate | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  // ✅ **Race ophalen bij eerste render**
  useEffect(() => {
    if (!raceId) return;

    const fetchRace = async () => {
      try {
        const response = await axios.get<RaceUpdate>(
          `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
        );
        setRace(response.data);
        console.log("✅ [API] Race binnengehaald:", response.data);
      } catch (error) {
        console.error("❌ [ERROR] Kan race niet ophalen:", error);
      }
    };

    fetchRace();
  }, [raceId]);

  // ✅ **Luisteren naar 'raceClosed' WebSocket event**
  useEffect(() => {
    if (!socket) return;

    const handleRaceClosed = (update: { raceId: string; status: string }) => {
      if (update.raceId === raceId) {
        console.log("🏁 [WebSocket] Race gesloten, UI status bijwerken...");

        setRace((prevRace) =>
          prevRace ? { ...prevRace, status: "closed" } : prevRace
        );

        // ✅ Vertraging toevoegen voordat de API de winnaar ophaalt (500ms)
        setTimeout(() => fetchWinner(update.raceId), 500);
      }
    };

    socket.on("raceClosed", handleRaceClosed);

    return () => {
      socket.off("raceClosed", handleRaceClosed);
    };
  }, [socket, raceId]);

  // ✅ **Winnaar ophalen via WebSocket**
  const handleWinnerUpdate = useCallback(
    (updatedWinner: WinnerUpdate) => {
      if (updatedWinner.raceId === raceId) {
        console.log("🏆 [WebSocket] Winnaar update ontvangen:", updatedWinner);
        setWinner(updatedWinner);
      }
    },
    [raceId]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("winnerUpdate", handleWinnerUpdate);

    return () => {
      socket.off("winnerUpdate", handleWinnerUpdate);
    };
  }, [socket, handleWinnerUpdate]);

  // ✅ **Winnaar ophalen via API (met controle op WebSocket-update)**
  const fetchWinner = async (raceId: string) => {
    if (winner) return; // ✅ Voorkomt dubbele API-call als WebSocket update sneller is

    try {
      console.log("🏆 [WINNER] Winnaar ophalen via API...");
      const response = await axios.get<WinnerUpdate>(
        `${import.meta.env.VITE_API_BASE_URL}/winners/${raceId}`
      );
      setWinner(response.data);
      console.log("✅ [WINNER] Winnaar ontvangen:", response.data);
    } catch (error) {
      console.error("❌ [ERROR] Kan winnaar niet ophalen:", error);
    }
  };

  // ✅ **Race-updates verwerken via WebSocket**
  useEffect(() => {
    if (!raceData || raceData.raceId !== raceId) return;

    if (raceData.currentRound !== race?.currentRound) {
      console.log(
        `🔄 [WebSocket] Ronde gewijzigd: ${race?.currentRound} → ${raceData.currentRound}`
      );

      setRace((prev) =>
        prev?.currentRound !== raceData.currentRound ? raceData : prev
      );
    }
  }, [raceData, raceId, race?.currentRound]);

  // ✅ **WinnerDisplay optimalisatie**
  const memoizedWinnerDisplay = useMemo(() => {
    return race?.status === "closed" ? <WinnerDisplay winner={winner} /> : null;
  }, [race?.status, winner]);

  // ✅ **Meme kiezen en opslaan**
  const handleMemeSelection = async (memeId: string): Promise<void> => {
    if (!walletAddress) {
      alert("Vul je wallet-adres in om een meme te kiezen!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/participants/`,
        { raceId, walletAddress, memeId }
      );

      console.log("✅ [API] Meme gekozen:", response.data);
      setSelectedMeme(memeId);

      setTimeout(async () => {
        const updatedRace = await axios.get<RaceUpdate>(
          `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
        );
        setRace(updatedRace.data);
        console.log("🔄 [API] Race handmatig vernieuwd na meme selectie.");
      }, 1000);
    } catch (error) {
      console.error("❌ [ERROR] Meme selectie mislukt:", error);
    }
  };

  if (!race) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">🏁 Race Details</h2>
      <p>
        Huidige ronde: <strong>{race.currentRound}</strong>
      </p>

      {memoizedWinnerDisplay ||
        (race.currentRound === 1 ? (
          <MemeSelection
            race={race}
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            selectedMeme={selectedMeme}
            onMemeSelect={handleMemeSelection}
          />
        ) : (
          <VotingPhase race={race} />
        ))}
    </div>
  );
};

export default RaceDetails;
