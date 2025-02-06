import React, { useEffect, useState } from "react";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";

interface Meme {
  memeId: string;
  name?: string;
  url?: string;
  progress: number;
  votes?: number;
}

interface MemeListProps {
  memes: Meme[];
  maxProgress: number;
  raceId: string;
}

const getSafeImageUrl = (url?: string) =>
  url && url.startsWith("http") ? url : "/fallback-image.png";

const MemeList: React.FC<MemeListProps> = ({ memes, maxProgress, raceId }) => {
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const { voteData } = useWebSocketContext();

  // ✅ 1️⃣ Haal initiële stemmen op via API
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/votes/${raceId}`
        );

        // ✅ Votes omzetten naar { memeId: totalVotes }
        const initialVotes = response.data.reduce(
          (
            acc: { [key: string]: number },
            vote: { _id: string; totalVotes: number }
          ) => {
            acc[vote._id] = vote.totalVotes;
            return acc;
          },
          {}
        );

        setVotes(initialVotes);
      } catch (error) {
        console.error("❌ Failed to fetch votes:", error);
      }
    };

    fetchVotes();
  }, [raceId]);

  // ✅ 2️⃣ Verwerk live WebSocket updates
  useEffect(() => {
    if (voteData && voteData.raceId === raceId) {
      console.log("🔄 [LIVE UPDATE] Vote update ontvangen:", voteData);
      setVotes((prevVotes) => ({
        ...prevVotes,
        [voteData.memeId]: voteData.totalVotes, // ✅ WebSocket update direct toepassen
      }));
    }
  }, [voteData, raceId]);

  return (
    <div className="mt-6 flex justify-center items-end space-x-6 border-l-4 border-gray-700 p-4">
      {memes.map((meme) => (
        <div
          key={meme.memeId}
          className="flex flex-col items-center text-white w-20"
        >
          <p className="font-bold text-sm text-center text-black">
            {meme.name || "Naam ontbreekt"}
          </p>
          {/* ✅ Progress bar */}
          <div className="relative w-full bg-gray-700 rounded-t-lg overflow-hidden h-48">
            <div
              className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500"
              style={{ height: `${(meme.progress / maxProgress) * 100}%` }}
            ></div>
          </div>
          {/* ✅ Meme image */}
          <img
            src={getSafeImageUrl(meme.url)}
            alt={meme.name}
            className="w-16 h-16 object-cover rounded-full mt-2 border border-gray-600"
          />
          {/* ✅ Votes (API + WebSocket updates) */}
          <p className="text-xs text-gray-500 mt-1">
            Progress: {meme.progress} | Votes: {votes[meme.memeId] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MemeList;
