import { RaceUpdate, Meme } from "../types/websocketTypes"; // ✅ Zorg ervoor dat 'Meme' correct is geïmporteerd

interface MemeSelectionProps {
  race: RaceUpdate;
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
  selectedMeme: string | null;
  onMemeSelect: (memeId: string) => Promise<void>;
}

const MemeSelection: React.FC<MemeSelectionProps> = ({
  race,
  walletAddress,
  setWalletAddress,
  selectedMeme,
  onMemeSelect,
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold">Kies je meme:</h3>
      <input
        type="text"
        placeholder="Voer je wallet-adres in"
        className="border p-2 rounded w-full mb-4"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />
      <div className="flex gap-2">
        {race.memes.map(
          (
            meme: Meme // ✅ 'any' vervangen door 'Meme'
          ) => (
            <button
              key={meme.memeId}
              className={`px-4 py-2 rounded ${
                selectedMeme === meme.memeId
                  ? "bg-green-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => onMemeSelect(meme.memeId)}
            >
              {meme.name}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default MemeSelection;
