import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate, Meme } from "../types/websocketTypes";
import ChooseMeme from "../components/ChooseMeme";
import MemeList from "../components/MemeList";
import WinnerDisplay from "../components/WinnerDisplay";
import VoteSection from "../components/VoteSection";

const RaceDetails = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { raceData } = useWebSocketContext();
  const [race, setRace] = useState<RaceUpdate | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [winner, setWinner] = useState<Meme | null>(null);
  const [winnerError, setWinnerError] = useState(false);
  const [votedRounds, setVotedRounds] = useState<number[]>([]);

  // ✅ Racegegevens ophalen via API
  const fetchRaceDetails = useCallback(async () => {
    if (!raceId) return;

    try {
      console.log("📡 Race opnieuw ophalen...");
      const raceResponse = await axios.get<RaceUpdate>(
        `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
      );

      setRace(raceResponse.data);
      setMemes(raceResponse.data.memes);
    } catch (error) {
      console.error("❌ Fout bij ophalen van race:", error);
    }
  }, [raceId]);

  // ✅ Winnaar ophalen als race is afgesloten
  const fetchWinner = useCallback(async () => {
    if (!raceId || (race && race.status !== "closed")) return;

    try {
      console.log("🏆 Winnaar ophalen...");
      const winnerResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/winners/${raceId}`
      );

      if (winnerResponse.data) {
        setWinner(winnerResponse.data);
      }
    } catch (error) {
      console.error("❌ Fout bij ophalen van winnaar:", error);
      setWinnerError(true);
    }
  }, [raceId, race]);

  // ✅ Initialiseer racegegevens bij eerste render
  useEffect(() => {
    fetchRaceDetails();
  }, [fetchRaceDetails]);

  // ✅ Haal winnaar op als race is afgesloten
  useEffect(() => {
    if (race?.status === "closed") {
      fetchWinner();
    }
  }, [race, fetchWinner]);

  // ✅ WebSocket: update race- en meme-data bij nieuwe race-update
  useEffect(() => {
    if (raceData && raceData.raceId === raceId) {
      console.log("📡 WebSocket Race Update ontvangen:", raceData);
      setRace(raceData);
      setMemes(raceData.memes);
    }
  }, [raceData, raceId]);

  // ✅ Extra: Race opnieuw ophalen als WebSocket-update binnenkomt
  useEffect(() => {
    if (raceData) {
      fetchRaceDetails();
    }
  }, [raceData]);

  if (!race) return <p>Laden...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">🏁 Race Details</h2>

      {/* ✅ Winnaar tonen als race is afgesloten */}
      {race.status === "closed" && (
        <WinnerDisplay winner={winner} winnerError={winnerError} />
      )}

      <p>
        Huidige ronde: <strong>{race.currentRound}</strong>
      </p>

      {/* ✅ Ronde 1: Meme kiezen */}
      {race.currentRound === 1 && <ChooseMeme raceId={raceId!} />}

      {/* ✅ Ronde 2-6: Stemmen */}
      {race.currentRound > 1 && race.currentRound <= 6 && (
        <VoteSection
          raceId={raceId!}
          currentRound={race.currentRound}
          votedRounds={votedRounds}
          setVotedRounds={setVotedRounds}
          memes={memes} // ✅ Nu met juiste meme-lijst
        />
      )}

      {/* ✅ Lijst met memes & voortgangsbalken */}
      <MemeList
        memes={memes}
        maxProgress={Math.max(...memes.map((m) => m.progress || 0)) || 1}
      />
    </div>
  );
};

export default RaceDetails;
