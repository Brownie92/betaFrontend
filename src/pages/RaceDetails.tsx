import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";
import MemeSelection from "../components/MemeSelection";
import VotingPhase from "../components/VotingPhase";
import WinnerDisplay from "../components/WinnerDisplay";
import { RaceUpdate } from "../types/websocketTypes";

const RaceDetails = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { raceData } = useWebSocketContext();
  const [race, setRace] = useState<RaceUpdate | null>(null);
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
      } catch (error) {
        console.error("❌ [ERROR] Kan race niet ophalen:", error);
      }
    };

    fetchRace();
  }, [raceId]);

  // ✅ **WebSocket updates verwerken**
  useEffect(() => {
    if (!raceData || raceData.raceId !== raceId) return;

    if (raceData.currentRound !== race?.currentRound) {
      setRace(raceData);
    }
  }, [raceData, raceId, race?.currentRound]);

  // ✅ **Meme kiezen en opslaan**
  const handleMemeSelection = async (memeId: string) => {
    if (!walletAddress) {
      alert("Vul je wallet-adres in om een meme te kiezen!");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/participants/`, {
        raceId,
        walletAddress,
        memeId,
      });

      setSelectedMeme(memeId);

      setTimeout(async () => {
        const updatedRace = await axios.get<RaceUpdate>(
          `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
        );
        setRace(updatedRace.data);
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

      {/* ✅ **Race is afgelopen → Toon winnaar** */}
      {race.status === "closed" ? (
        <WinnerDisplay raceId={race.raceId} />
      ) : race.currentRound === 1 ? (
        <MemeSelection
          race={race}
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          selectedMeme={selectedMeme}
          onMemeSelect={handleMemeSelection}
        />
      ) : (
        <VotingPhase race={race} />
      )}
    </div>
  );
};

export default RaceDetails;
