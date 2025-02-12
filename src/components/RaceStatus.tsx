import { useWebSocketContext } from "../context/WebSocketContext";

const RaceStatus = () => {
  const { raceData, roundData, winnerData } = useWebSocketContext();

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h2 className="text-xl font-bold mb-2">🏁 Live Race Updates</h2>
      <pre className="text-sm bg-gray-900 p-3 rounded-lg overflow-x-auto">
        {JSON.stringify({ raceData, roundData, winnerData }, null, 2)}
      </pre>
    </div>
  );
};

export default RaceStatus;
