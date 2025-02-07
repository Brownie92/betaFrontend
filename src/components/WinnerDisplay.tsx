import { useEffect, useState } from "react";
import axios from "axios";

interface Winner {
  memeId: {
    memeId: string;
    name: string;
    url: string;
  };
  progress: number;
  votes: number;
}

interface WinnerDisplayProps {
  raceId: string;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ raceId }) => {
  const [winner, setWinner] = useState<Winner | null>(null);

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        console.log("🏆 [API] Winnaar ophalen...");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/winners/${raceId}`
        );

        if (response.data) {
          setWinner(response.data);
        } else {
          console.warn("⚠️ Geen winnaar gevonden voor deze race.");
        }
      } catch (error) {
        console.error("❌ [ERROR] Kan winnaar niet ophalen:", error);
      }
    };

    fetchWinner();
  }, [raceId]);

  return (
    <div className="p-4 border border-green-500 rounded text-center">
      <h3 className="text-xl font-semibold text-green-500">
        🏆 De winnaar is:
      </h3>
      {winner ? (
        <div>
          <p className="text-2xl font-bold">{winner.memeId.name} 🎉</p>
          <img
            src={winner.memeId.url}
            alt={winner.memeId.name}
            className="mt-2 w-32 h-32 mx-auto rounded-lg"
          />
          <p className="mt-2 text-gray-600">📊 Progress: {winner.progress}</p>
          <p className="text-gray-600">🗳️ Votes: {winner.votes}</p>
        </div>
      ) : (
        <p className="text-red-500">Geen winnaar beschikbaar.</p>
      )}
    </div>
  );
};

export default WinnerDisplay;
