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

  // ✅ Fetch race details on first render
  useEffect(() => {
    if (!raceId) return;

    const fetchRace = async () => {
      try {
        const response = await axios.get<RaceUpdate>(
          `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
        );
        setRace(response.data);
        console.log("✅ [API] Race fetched:", response.data);

        // ✅ If race is closed, fetch winner immediately
        if (response.data.status === "closed") {
          fetchWinner(response.data.raceId);
        }
      } catch (error) {
        console.error("❌ [ERROR] Failed to fetch race:", error);
      }
    };

    fetchRace();
  }, [raceId]);

  // ✅ Listen for 'raceClosed' WebSocket event
  useEffect(() => {
    if (!socket) return;

    const handleRaceClosed = (update: { raceId: string; status: string }) => {
      if (update.raceId === raceId) {
        console.log("🏁 [WebSocket] Race closed, updating UI...");

        setRace((prevRace) =>
          prevRace ? { ...prevRace, status: "closed" } : prevRace
        );

        // ✅ Ensure the database is updated before fetching winner
        setTimeout(() => fetchWinner(update.raceId), 500);
      }
    };

    socket.on("raceClosed", handleRaceClosed);

    return () => {
      socket.off("raceClosed", handleRaceClosed);
    };
  }, [socket, raceId]);

  // ✅ Handle winner updates via WebSocket
  const handleWinnerUpdate = useCallback(
    (updatedWinner: WinnerUpdate) => {
      if (updatedWinner.raceId === raceId) {
        console.log("🏆 [WebSocket] Winner update received:", updatedWinner);
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

  // ✅ Fetch winner via API as a fallback (only if WebSocket is missing)
  const fetchWinner = async (raceId: string) => {
    if (winner) return; // Avoid redundant API calls if WebSocket already updated

    try {
      console.log("🏆 [WINNER] Fetching winner via API...");
      const response = await axios.get<WinnerUpdate>(
        `${import.meta.env.VITE_API_BASE_URL}/winners/${raceId}`
      );
      setWinner(response.data);
      console.log("✅ [WINNER] Winner received via API:", response.data);
    } catch (error) {
      console.error("❌ [ERROR] Failed to fetch winner:", error);
    }
  };

  // ✅ Ensure the winner is fetched when refreshing a closed race
  useEffect(() => {
    if (race?.status === "closed" && !winner) {
      console.log("🏆 [DEBUG] Fetching winner after page refresh...");
      fetchWinner(race.raceId);
    }
  }, [race, winner]);

  // ✅ Handle race updates via WebSocket
  useEffect(() => {
    if (!raceData || raceData.raceId !== raceId) return;

    if (raceData.currentRound !== race?.currentRound) {
      console.log(
        `🔄 [WebSocket] Round changed: ${race?.currentRound} → ${raceData.currentRound}`
      );

      setRace((prev) =>
        prev?.currentRound !== raceData.currentRound ? raceData : prev
      );
    }
  }, [raceData, raceId, race?.currentRound]);

  // ✅ Memoized winner display for performance optimization
  const memoizedWinnerDisplay = useMemo(() => {
    return race?.status === "closed" ? <WinnerDisplay winner={winner} /> : null;
  }, [race?.status, winner]);

  // ✅ Handle meme selection and submission
  const handleMemeSelection = async (memeId: string): Promise<void> => {
    if (!walletAddress) {
      alert("Enter your wallet address to select a meme!");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/participants/`, {
        raceId,
        walletAddress,
        memeId,
      });

      console.log("✅ [API] Meme selected:", memeId);
      setSelectedMeme(memeId);

      // ✅ Refresh race state after selection
      setTimeout(async () => {
        const updatedRace = await axios.get<RaceUpdate>(
          `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
        );
        setRace(updatedRace.data);
        console.log("🔄 [API] Race manually refreshed after meme selection.");
      }, 1000);
    } catch (error) {
      console.error("❌ [ERROR] Meme selection failed:", error);
    }
  };

  if (!race) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">🏁 Race Details</h2>
      <p>
        Current round: <strong>{race.currentRound}</strong>
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
