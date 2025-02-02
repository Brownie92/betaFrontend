import { useEffect, useState } from "react";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate } from "../types/websocketTypes";
import { Link } from "react-router-dom";

const RaceOverview = () => {
  const { raceData } = useWebSocketContext(); // WebSocket race updates
  const [races, setRaces] = useState<RaceUpdate[]>([]);
  const API_URL = import.meta.env.VITE_API_BASE_URL + "/races";

  // ✅ 1️⃣ API call om races op te halen bij paginalaad
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        console.log("[DEBUG] 🔗 Ophalen races van:", API_URL);
        const response = await fetch(API_URL);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data: RaceUpdate[] = await response.json();
        setRaces(data);
      } catch (error) {
        console.error("[ERROR] ❌ Fout bij ophalen races:", error);
      }
    };

    fetchRaces();
  }, [API_URL]);

  // ✅ 2️⃣ WebSocket update verwerken
  useEffect(() => {
    if (raceData) {
      setRaces((prevRaces) => {
        const updatedRaces = prevRaces.map((race) =>
          race.raceId === raceData.raceId ? raceData : race
        );

        // Voeg race toe als deze nog niet in de lijst staat
        const raceExists = prevRaces.some(
          (race) => race.raceId === raceData.raceId
        );
        return raceExists ? updatedRaces : [...prevRaces, raceData];
      });
    }
  }, [raceData]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🏁 Race Overzicht</h2>
      {races.length === 0 ? (
        <p>Geen races gevonden...</p>
      ) : (
        <div className="space-y-2">
          {races.map((race) => (
            <div
              key={race.raceId}
              className="bg-gray-800 text-white p-4 rounded flex justify-between"
            >
              <span>
                {race.memes.length > 0 ? race.memes[0].name : "Race"} (
                {race.status})
              </span>
              <Link to={`/race/${race.raceId}`} className="text-blue-400">
                Bekijk details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RaceOverview;
