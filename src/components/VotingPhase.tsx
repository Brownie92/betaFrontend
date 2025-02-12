import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useWebSocketContext } from "../context/WebSocketContext";
import { RaceUpdate } from "../types/websocketTypes";

interface VotingPhaseProps {
  race: RaceUpdate;
}

const VotingPhase: React.FC<VotingPhaseProps> = ({ race }) => {
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const { voteData } = useWebSocketContext();

  // ✅ Fetch votes from API with debounce
  const fetchVotes = useCallback(() => {
    const controller = new AbortController(); // Prevent race conditions
    const timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/votes/${race.raceId}?round=${race.currentRound}`,
          { signal: controller.signal }
        );

        const voteData = response.data.reduce(
          (
            acc: { [key: string]: number },
            vote: { _id: string; totalVotes: number }
          ) => {
            acc[vote._id] = vote.totalVotes;
            return acc;
          },
          {}
        );

        setVotes(voteData);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.warn("[API] Request canceled (avoiding race conditions)");
        } else {
          console.error("[ERROR] Failed to fetch votes:", error);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [race.raceId, race.currentRound]);

  // ✅ Fetch votes on mount and round change
  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // ✅ WebSocket: Live vote updates
  useEffect(() => {
    if (!voteData || voteData.raceId !== race.raceId) return;

    setVotes((prevVotes) => ({
      ...prevVotes,
      [voteData.memeId]: voteData.totalVotes,
    }));
  }, [voteData, race.raceId]);

  // ✅ Handle voting action
  const handleVote = async (memeId: string) => {
    if (!walletAddress) return alert("⚠️ Enter your wallet address to vote!");
    if (hasVoted) return alert("⚠️ You have already voted this round!");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/votes/${race.raceId}`,
        {
          walletAddress,
          memeId,
        }
      );

      // Update UI instantly before API response
      setVotes((prevVotes) => ({
        ...prevVotes,
        [memeId]: (prevVotes[memeId] || 0) + 1,
      }));

      // Prevent duplicate votes
      setHasVoted(true);

      // Fetch updated votes after a short delay
      setTimeout(fetchVotes, 500);
    } catch (error) {
      console.error("[ERROR] Voting failed:", error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">🗳️ Voting</h3>
      <input
        type="text"
        placeholder="Enter your wallet address"
        className="border p-2 rounded w-full mb-4"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {race.memes.map((meme) => (
          <button
            key={meme.memeId}
            className={`px-4 py-2 rounded ${hasVoted ? "bg-gray-400" : "bg-blue-500 text-white"}`}
            onClick={() => handleVote(meme.memeId)}
            disabled={hasVoted} // Disable button after voting
          >
            Vote for {meme.name} ({votes[meme.memeId] || 0} votes)
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingPhase;
