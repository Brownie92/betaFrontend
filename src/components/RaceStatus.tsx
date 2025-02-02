import { useWebSocketContext } from "../context/WebSocketContext";

const RaceStatus = () => {
  const { raceData, roundData, winnerData } = useWebSocketContext();

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h2 className="text-xl font-bold">Live Race Updates</h2>
      <pre className="text-sm mt-2">
        {JSON.stringify({ raceData, roundData, winnerData }, null, 2)}
      </pre>
    </div>
  );
};

export default RaceStatus;
