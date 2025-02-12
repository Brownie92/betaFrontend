import { WinnerUpdate, Meme } from "../types/websocketTypes";

interface WinnerDisplayProps {
  winner: WinnerUpdate | null;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner }) => {
  if (!winner || !winner.memeId || typeof winner.memeId !== "object") {
    return (
      <div className="p-4 border border-green-500 rounded text-center">
        <h3 className="text-xl font-semibold text-green-500">
          🏆 De winnaar is:
        </h3>
        <p className="text-red-500">Geen winnaar beschikbaar.</p>
      </div>
    );
  }

  const memeDetails = winner.memeId as Meme; // ✅ Meme object direct gebruiken

  return (
    <div className="p-4 border border-green-500 rounded text-center">
      <h3 className="text-xl font-semibold text-green-500">
        🏆 De winnaar is:
      </h3>
      <div>
        <p className="text-2xl font-bold">{memeDetails.name} 🎉</p>
        <img
          src={memeDetails.url}
          alt={memeDetails.name}
          className="mt-2 w-32 h-32 mx-auto rounded-lg"
        />
        <p className="mt-2 text-gray-600">📊 Progress: {winner.progress}</p>
        <p className="text-gray-600">🗳️ Votes: {winner.votes}</p>
      </div>
    </div>
  );
};

export default WinnerDisplay;
