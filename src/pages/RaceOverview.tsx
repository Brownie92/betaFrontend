import { useEffect, useState } from "react";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate } from "../types/websocketTypes";
import { Link } from "react-router-dom";

const RaceOverview = () => {
  const { raceData } = useWebSocketContext(); // WebSocket race updates
  const [races, setRaces] = useState<RaceUpdate[]>([]);
  const [showClosed, setShowClosed] = useState(false); // Toggle for closed races

  // ✅ Fetch races from API on page load
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_BASE_URL + "/races"
        );
        const data: RaceUpdate[] = await response.json();
        setRaces(data);
      } catch (error) {
        console.error("❌ [ERROR] Failed to fetch races:", error);
      }
    };

    fetchRaces();
  }, []);

  // ✅ Handle WebSocket race updates
  useEffect(() => {
    if (raceData) {
      setRaces((prevRaces) => {
        const updatedRaces = prevRaces.map((race) =>
          race.raceId === raceData.raceId ? raceData : race
        );

        // Add race if it does not exist in the list
        const raceExists = prevRaces.some(
          (race) => race.raceId === raceData.raceId
        );
        return raceExists ? updatedRaces : [...prevRaces, raceData];
      });
    }
  }, [raceData]);

  // ✅ Format date to DD-MM-YYYY
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ✅ Filter races based on status
  const filteredRaces = races.filter((race) =>
    showClosed ? race.status === "closed" : race.status === "active"
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🏁 Race Overview</h2>

      {/* ✅ Toggle button for closed races */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowClosed(!showClosed)}
      >
        {showClosed ? "Show active races" : "Show closed races"}
      </button>

      {filteredRaces.length === 0 ? (
        <p>No races found...</p>
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
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RaceOverview;
