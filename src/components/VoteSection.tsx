import { useState } from "react";
import axios from "axios";

interface VoteSectionProps {
  raceId: string;
  currentRound: number;
  votedRounds: number[];
  setVotedRounds: (rounds: number[]) => void;
  memes: { memeId: string; name?: string }[];
}

const VoteSection: React.FC<VoteSectionProps> = ({
  raceId,
  currentRound,
  votedRounds,
  setVotedRounds,
  memes,
}) => {
  const [walletAddress, setWalletAddress] = useState<string>("");

  const handleVote = async (memeId: string) => {
    if (!walletAddress) {
      alert("Vul je wallet-adres in om te stemmen.");
      return;
    }

    if (votedRounds.includes(currentRound)) {
      alert("Je hebt al gestemd in deze ronde.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/votes/${raceId}`, {
        walletAddress,
        memeId,
      });

      setVotedRounds([...votedRounds, currentRound]);
      alert("✅ Stem succesvol uitgebracht!");
    } catch (error) {
      console.error("❌ Fout bij stemmen:", error);
      alert("Er is een fout opgetreden bij het stemmen.");
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold">🗳️ Stemmen</h3>
      <input
        type="text"
        placeholder="Voer je wallet-adres in"
        className="border p-2 rounded w-full mb-4"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {memes.map((meme) => (
          <button
            key={meme.memeId}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleVote(meme.memeId)}
          >
            Stem op {meme.name || "Meme"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoteSection;
