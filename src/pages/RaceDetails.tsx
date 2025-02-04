import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate, Meme } from "../types/websocketTypes";
import ChooseMeme from "../components/ChooseMeme";

const RaceDetails = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const safeRaceId = raceId ?? ""; // ✅ Voorkomt TypeScript-fout als raceId undefined is
  const { raceData, roundData } = useWebSocketContext();
  const [race, setRace] = useState<RaceUpdate | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);

  const getSafeImageUrl = (url?: string) =>
    url?.startsWith("http") ? url : "/fallback-image.png";

  // ✅ Haal racegegevens op (API-call)
  const fetchRaceDetails = useCallback(async () => {
    if (!safeRaceId) return;

    try {
      const raceResponse = await axios.get<RaceUpdate>(
        `${import.meta.env.VITE_API_BASE_URL}/races/${safeRaceId}`
      );

      setRace(raceResponse.data);

      const memeIds = raceResponse.data.memes.map((m) => m.memeId);
      const memesResponse = await axios.post<Meme[]>(
        `${import.meta.env.VITE_API_BASE_URL}/memes/byIds`,
        { memeIds }
      );

      const updatedMemes = memesResponse.data.map((meme) => ({
        ...meme,
        progress:
          raceResponse.data.memes.find((m) => m.memeId === meme.memeId)
            ?.progress || 0,
      }));

      setMemes(updatedMemes);
    } catch (error) {
      console.error("❌ Fout bij ophalen van race of memes:", error);
    }
  }, [safeRaceId]);

  // ✅ Laad racegegevens bij eerste render
  useEffect(() => {
    fetchRaceDetails();
  }, [fetchRaceDetails]);

  // ✅ Werk race en memes bij bij WebSocket updates
  useEffect(() => {
    if (!raceData || raceData.raceId !== safeRaceId) return;

    setRace((prevRace) =>
      prevRace ? { ...prevRace, currentRound: raceData.currentRound } : prevRace
    );

    setMemes((prevMemes) =>
      prevMemes.map((meme) => {
        const updatedMeme = raceData.memes.find(
          (m) => m.memeId === meme.memeId
        );
        return updatedMeme
          ? { ...meme, progress: updatedMeme.progress || meme.progress }
          : meme;
      })
    );
  }, [raceData, safeRaceId]);

  // ✅ Wacht op zowel roundUpdate als raceUpdate voordat race opnieuw wordt opgehaald
  useEffect(() => {
    if (!roundData || !raceData || raceData.raceId !== safeRaceId) return;

    const timeout = setTimeout(() => {
      fetchRaceDetails();
    }, 100);

    return () => clearTimeout(timeout);
  }, [roundData, raceData, safeRaceId]);

  if (!race) return <p className="text-center text-gray-400">Laden...</p>;

  const sortedMemes = [...memes].sort((a, b) => b.progress - a.progress);
  const maxProgress = sortedMemes[0]?.progress || 1;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">🏁 Race Details</h2>
      <p className="text-gray-600">
        Gestart op:{" "}
        <strong>{new Date(race.createdAt).toLocaleDateString()}</strong>
      </p>
      <p>
        Status:{" "}
        <span
          className={
            race.status === "active" ? "text-green-500" : "text-red-500"
          }
        >
          {race.status === "active" ? "Actief" : "Afgesloten"}
        </span>
      </p>
      <p>
        Huidige ronde: <strong>{race.currentRound}</strong>
      </p>

      {/* ✅ Meme kiezen in ronde 1 */}
      {race.currentRound === 1 && <ChooseMeme raceId={safeRaceId} />}

      {/* ✅ Deelnemende memes pas tonen vanaf ronde 2 */}
      {race.currentRound > 1 && (
        <>
          <h3 className="text-xl font-semibold mt-6">📢 Deelnemende Memes</h3>

          <div className="mt-6 flex justify-center items-end space-x-6 border-l-4 border-gray-700 p-4">
            {sortedMemes.map((meme) => (
              <div
                key={meme.memeId}
                className="flex flex-col items-center text-white w-20"
              >
                <p className="font-bold text-sm text-center text-black">
                  {meme.name || "Naam ontbreekt"}
                </p>
                <div className="relative w-full bg-gray-700 rounded-t-lg overflow-hidden h-48">
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500"
                    style={{
                      height: `${(meme.progress / maxProgress) * 100}%`,
                    }}
                  ></div>
                </div>
                <img
                  src={getSafeImageUrl(meme.url)}
                  alt={meme.name}
                  className="w-16 h-16 object-cover rounded-full mt-2 border border-gray-600"
                  onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
                />
                <p className="text-gray-400 text-xs">{meme.progress} punten</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RaceDetails;
