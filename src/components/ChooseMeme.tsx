import { useEffect, useState } from "react";
import axios from "axios";

interface Meme {
  memeId: string;
  name: string;
  url: string;
}

interface Props {
  raceId: string;
}

const ChooseMeme = ({ raceId }: Props) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [chosenMeme, setChosenMeme] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ 1️⃣ Haal alle beschikbare memes op bij het laden van de component
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await axios.get<Meme[]>(
          `${import.meta.env.VITE_API_BASE_URL}/memes`
        );
        setMemes(response.data);
      } catch (error) {
        console.error("❌ Fout bij ophalen van memes:", error);
      }
    };

    fetchMemes();
  }, []);

  // ✅ 2️⃣ Check of gebruiker al een meme heeft gekozen (nadat wallet is ingevoerd)
  useEffect(() => {
    if (!walletAddress) return;

    const fetchParticipant = async () => {
      try {
        const response = await axios.get<{
          participants: { walletAddress: string; memeId: string }[];
        }>(`${import.meta.env.VITE_API_BASE_URL}/participants/${raceId}`);

        const participant = response.data.participants.find(
          (p) => p.walletAddress === walletAddress
        );
        if (participant) {
          setChosenMeme(participant.memeId);
        }
      } catch (error) {
        console.error("❌ Fout bij ophalen van deelnemer:", error);
      }
    };

    fetchParticipant();
  }, [raceId, walletAddress]);

  // ✅ 3️⃣ Functie om een meme te kiezen
  const handleChooseMeme = async (memeId: string) => {
    if (!walletAddress) {
      alert("Voer eerst je wallet-adres in.");
      return;
    }

    if (chosenMeme) return; // Kan niet opnieuw kiezen

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/participants/`, {
        raceId,
        walletAddress,
        memeId,
      });

      setChosenMeme(memeId); // ✅ Update de UI zodat keuze vaststaat
    } catch (error) {
      console.error("❌ Fout bij kiezen van meme:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        🖼️ Kies je Meme voor deze race
      </h2>

      {/* ✅ Wallet-adres invoeren */}
      <input
        type="text"
        placeholder="Voer je wallet-adres in"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        disabled={!!chosenMeme} // Wallet kan niet meer worden gewijzigd na keuze
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {memes.map((meme) => (
          <button
            key={meme.memeId}
            className={`border-2 p-2 rounded-lg text-center transition ${
              chosenMeme === meme.memeId
                ? "border-green-500 bg-green-100"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => handleChooseMeme(meme.memeId)}
            disabled={!!chosenMeme || loading} // ✅ Knop uitschakelen na keuze
          >
            <img
              src={meme.url}
              alt={meme.name}
              className="w-full h-32 object-cover rounded"
            />
            <p className="mt-2 text-sm font-semibold">{meme.name}</p>
          </button>
        ))}
      </div>

      {chosenMeme && (
        <p className="mt-4 text-green-600 font-semibold">
          ✅ Je hebt je meme gekozen!
        </p>
      )}
    </div>
  );
};

export default ChooseMeme;
