import { useEffect, useState } from "react";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate } from "../types/websocketTypes";
import { Link } from "react-router-dom";

const RaceOverview = () => {
  const { raceData } = useWebSocketContext(); // WebSocket race updates
  const [races, setRaces] = useState<RaceUpdate[]>([]);
  const [showClosed, setShowClosed] = useState(false); // Toggle voor gesloten races

  // ✅ 1️⃣ API call om races op te halen bij paginalaad
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

  // ✅ 3️⃣ Datum formatteren
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ✅ 4️⃣ Filter races op basis van status
  const filteredRaces = races.filter((race) =>
    showClosed ? race.status === "closed" : race.status === "active"
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🏁 Race Overzicht</h2>

      {/* ✅ Toggle knop voor gesloten races */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowClosed(!showClosed)}
      >
        {showClosed ? "Toon actieve races" : "Toon gesloten races"}
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
                <strong>Meme Race</strong> - {formatDate(race.createdAt)} (
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
