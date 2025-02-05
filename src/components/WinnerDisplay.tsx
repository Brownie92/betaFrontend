import { useEffect, useState } from "react";
import axios from "axios";
import { Meme } from "../types/websocketTypes";

interface WinnerDisplayProps {
  winner: { memeId: string | { _id: string }; progress: number } | null;
  memes: Meme[];
  winnerError: boolean;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
  winner,
  memes,
  winnerError,
}) => {
  const [winnerMeme, setWinnerMeme] = useState<Meme | null>(null);

  useEffect(() => {
    if (!winner) return;

    // Ensure memeId is extracted correctly as a string
    const winnerId =
      typeof winner.memeId === "string"
        ? winner.memeId
        : typeof winner.memeId === "object" && "_id" in winner.memeId
          ? winner.memeId._id
          : "";

    if (!winnerId) return;

    // Check if the winner is already in the local memes list
    const foundMeme = memes.find((m) => m.memeId === winnerId);
    if (foundMeme) {
      setWinnerMeme(foundMeme);
      return;
    }

    // Fetch the winner meme from the API if not found locally
    axios
      .post<Meme[]>(`${import.meta.env.VITE_API_BASE_URL}/memes/byIds`, {
        memeIds: [winnerId],
      })
      .then((response) => {
        if (response.data.length > 0) {
          setWinnerMeme(response.data[0]);
        }
      })
      .catch(() => {
        console.error("Failed to fetch winner meme.");
      });
  }, [winner, memes]);

  if (!winner) return null;

  return (
    <div className="mb-6 p-4 bg-yellow-300 text-black text-center rounded-lg">
      <h3 className="text-2xl font-bold">🏆 Winner!</h3>
      {winnerMeme ? (
        <>
          <img
            src={winnerMeme.url}
            alt={winnerMeme.name}
            className="w-24 h-24 object-cover mx-auto rounded-full border border-gray-600"
          />
          <p className="text-lg font-semibold mt-2">{winnerMeme.name}</p>
          <p>Progress: {winner.progress}</p>
        </>
      ) : winnerError ? (
        <p className="text-red-500">⚠️ Could not retrieve the winner.</p>
      ) : (
        <p>Loading winner...</p>
      )}
    </div>
  );
};

export default WinnerDisplay;
