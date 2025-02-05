import React from "react";

interface WinnerProps {
  winner: { name: string; url?: string; progress: number } | null;
  winnerError: boolean;
}

const getSafeImageUrl = (url?: string) =>
  url && url.startsWith("http") ? url : "/fallback-image.png";

const WinnerDisplay: React.FC<WinnerProps> = ({ winner, winnerError }) => {
  return (
    <div className="mb-6 p-4 bg-yellow-300 text-black text-center rounded-lg">
      <h3 className="text-2xl font-bold">🏆 Winnaar!</h3>
      {winner ? (
        <>
          <img
            src={getSafeImageUrl(winner.url)}
            alt={winner.name}
            className="w-24 h-24 object-cover mx-auto rounded-full border border-gray-600"
          />
          <p className="text-lg font-semibold mt-2">{winner.name}</p>
          <p>Progress: {winner.progress}</p>
        </>
      ) : winnerError ? (
        <p className="text-red-500">⚠️ Kon geen winnaar ophalen.</p>
      ) : (
        <p>Winnaar wordt geladen...</p>
      )}
    </div>
  );
};

export default WinnerDisplay;
