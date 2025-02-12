import { RaceUpdate, Meme } from "../types/websocketTypes";

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
    <div className="p-4 bg-gray-900 text-white rounded-md">
      <h3 className="text-xl font-bold mb-4">🎭 Select Your Meme</h3>

      {/* Wallet Address Input */}
      <input
        type="text"
        placeholder="Enter your wallet address..."
        className="border p-2 rounded w-full mb-4 text-black"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />

      {/* Meme Selection Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {race.memes.map((meme: Meme) => (
          <button
            key={meme.memeId}
            className={`p-3 rounded-lg text-center transition duration-200 ${
              selectedMeme === meme.memeId
                ? "bg-green-500 text-white scale-105"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => onMemeSelect(meme.memeId)}
          >
            {meme.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemeSelection;
