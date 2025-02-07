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

  // ✅ API Call: Stemmen ophalen (debounced)
  const fetchVotes = useCallback(() => {
    console.log(`📡 [API] Fetching votes for round ${race.currentRound}...`);

    const controller = new AbortController(); // ✅ AbortController om race conditions te voorkomen
    const timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/votes/${race.raceId}?round=${race.currentRound}`,
          { signal: controller.signal }
        );

        console.log("✅ [API] Votes binnengehaald:", response.data);
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
          console.log(
            "⚠️ [API] Request geannuleerd (race conditions voorkomen)"
          );
        } else {
          console.error("❌ [ERROR] Fout bij ophalen van stemmen:", error);
        }
      }
    }, 500); // ✅ 500ms debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort(); // ✅ Annuleer oudere API-calls als een nieuwe wordt gestart
    };
  }, [race.raceId, race.currentRound]);

  // ✅ Haal stemmen op bij component mount en rondewijziging
  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // ✅ WebSocket: Live vote updates
  useEffect(() => {
    if (!voteData || voteData.raceId !== race.raceId) return;

    console.log("🔄 [LIVE UPDATE] Nieuwe stem ontvangen:", voteData);

    setVotes((prevVotes) => ({
      ...prevVotes,
      [voteData.memeId]: voteData.totalVotes,
    }));
  }, [voteData, race.raceId]);

  // ✅ Stemfunctie
  const handleVote = async (memeId: string) => {
    if (!walletAddress)
      return alert("⚠️ Vul je wallet-adres in om te stemmen!");
    if (hasVoted) return alert("⚠️ Je hebt al gestemd deze ronde!");

    try {
      console.log(`🗳️ [VOTE] Stem uitbrengen op ${memeId}...`);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/votes/${race.raceId}`,
        {
          walletAddress,
          memeId,
        }
      );

      console.log(`✅ [VOTE] Stem succesvol uitgebracht op ${memeId}`);

      // 🔥 UI direct updaten voordat de API-call klaar is
      setVotes((prevVotes) => ({
        ...prevVotes,
        [memeId]: (prevVotes[memeId] || 0) + 1,
      }));

      // ✅ Voorkomen dat dezelfde gebruiker opnieuw stemt
      setHasVoted(true);

      // ✅ Extra check: Haal stemmen opnieuw op na korte delay
      setTimeout(fetchVotes, 500);
    } catch (error) {
      console.error("❌ [ERROR] Stemmen mislukt:", error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">🗳️ Stemmen</h3>
      <input
        type="text"
        placeholder="Voer je wallet-adres in"
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
            disabled={hasVoted} // ✅ Knop uitschakelen na stem
          >
            Stem op {meme.name} ({votes[meme.memeId] || 0} stemmen)
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingPhase;
