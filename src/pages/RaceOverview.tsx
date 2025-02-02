import { useEffect, useState } from "react";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate } from "../types/websocketTypes";
import { Link } from "react-router-dom";

const RaceOverview = () => {
  const { raceData } = useWebSocketContext();
  const [races, setRaces] = useState<RaceUpdate[]>([]);
  const [showActive, setShowActive] = useState(true); // ✅ Toggle state

  // ✅ API call bij paginalaad
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_BASE_URL + "/races"
        );
        const data: RaceUpdate[] = await response.json();
        setRaces(data);
      } catch (error) {
        console.error("[ERROR] ❌ Fout bij ophalen races:", error);
      }
    };

    fetchRaces();
  }, []);

  // ✅ WebSocket update verwerken
  useEffect(() => {
    if (raceData) {
      setRaces((prevRaces) => {
        const updatedRaces = prevRaces.map((race) =>
          race.raceId === raceData.raceId ? raceData : race
        );

        const raceExists = prevRaces.some(
          (race) => race.raceId === raceData.raceId
        );
        return raceExists ? updatedRaces : [...prevRaces, raceData];
      });
    }
  }, [raceData]);

  // ✅ Toggle functie
  const toggleFilter = () => {
    setShowActive((prev) => !prev);
  };

  // ✅ Gefilterde races op basis van status
  const filteredRaces = races.filter(
    (race) => race.status === (showActive ? "active" : "closed")
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🏁 Race Overzicht</h2>

      {/* ✅ Toggle-knop */}
      <button
        onClick={toggleFilter}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {showActive ? "Toon gesloten races" : "Toon actieve races"}
      </button>

      {filteredRaces.length === 0 ? (
        <p>Geen races gevonden...</p>
      ) : (
        <div className="space-y-2">
          {filteredRaces.map((race) => (
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
