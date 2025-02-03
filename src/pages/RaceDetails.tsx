import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate, Meme } from "../types/websocketTypes";

const RaceDetails = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const { raceData } = useWebSocketContext();
  const [race, setRace] = useState<RaceUpdate | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);

  // ✅ 1️⃣ API-call voor racegegevens
  useEffect(() => {
    if (!raceId) return;

    const fetchRaceDetails = async () => {
      try {
        const response = await axios.get<RaceUpdate>(
          `${import.meta.env.VITE_API_BASE_URL}/races/${raceId}`
        );

        console.log("📡 API Response:", response.data);

        setRace(response.data);
        setMemes(response.data.memes || []); // 🛠️ Zorgt ervoor dat het geen undefined wordt

        console.log("✅ Opgeslagen memes in state:", response.data.memes);
      } catch (error) {
        console.error("[ERROR] ❌ Kan race details niet ophalen:", error);
      }
    };

    fetchRaceDetails();
  }, [raceId]);

  // ✅ 2️⃣ WebSocket verwerkt alleen voortgang (progress + votes)
  useEffect(() => {
    if (raceData && raceData.raceId === raceId) {
      console.log("📡 WebSocket update:", raceData);

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
    }
  }, [raceData, raceId]);

  if (!race) return <p className="text-center text-gray-400">Laden...</p>;

  // ✅ Sorteer memes op punten (hoog naar laag)
  const sortedMemes = [...memes].sort((a, b) => b.progress - a.progress);

  // ✅ Functie om veilige afbeelding-URL's te krijgen
  const getSafeImageUrl = (url?: string) => {
    if (!url) return "/fallback-image.png"; // Fallback als URL ontbreekt
    return url.startsWith("http") ? url : `https://example.com/${url}`;
  };

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

      <h3 className="text-xl font-semibold mt-6">📢 Deelnemende Memes</h3>

      {/* ✅ Verbeterde layout */}
      <div className="mt-6 flex justify-center items-end space-x-6 border-l-4 border-gray-700 p-4">
        {sortedMemes.map((meme, index) => {
          console.log(`🔍 Meme #${index + 1}:`, meme.name, meme.url); // Debugging

          return (
            <div
              key={meme.memeId}
              className="flex flex-col items-center text-white w-20"
            >
              {/* ✅ Meme naam correct weergeven */}
              <p className="font-bold text-sm text-center text-black">
                {meme.name || "Naam ontbreekt"}
              </p>

              {/* ✅ Progressie-balk verticaal */}
              <div className="relative w-full bg-gray-700 rounded-t-lg overflow-hidden h-48">
                <div
                  className="absolute bottom-0 w-full bg-blue-500"
                  style={{
                    height: `${(meme.progress / sortedMemes[0].progress) * 100}%`,
                  }}
                ></div>
              </div>

              {/* ✅ Meme afbeelding (met fallback als hij niet laadt) */}
              <img
                src={getSafeImageUrl(meme.url)}
                alt={meme.name}
                className="w-16 h-16 object-cover rounded-full mt-2 border border-gray-600"
                onError={(e) => {
                  console.warn("⚠️ Afbeelding niet geladen:", meme.url);
                  e.currentTarget.src = "/fallback-image.png";
                }}
              />

              {/* ✅ Meme punten */}
              <p className="text-gray-400 text-xs">{meme.progress} punten</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RaceDetails;
