import React from "react";

interface Meme {
  memeId: string;
  name?: string;
  url?: string;
  progress: number;
  votes: number;
}

interface MemeListProps {
  memes: Meme[];
  maxProgress: number;
}

const getSafeImageUrl = (url?: string) =>
  url && url.startsWith("http") ? url : "/fallback-image.png";

const MemeList: React.FC<MemeListProps> = ({ memes, maxProgress }) => {
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
          <div className="relative w-full bg-gray-700 rounded-t-lg overflow-hidden h-48">
            <div
              className="absolute bottom-0 w-full bg-blue-500 transition-all duration-500"
              style={{ height: `${(meme.progress / maxProgress) * 100}%` }}
            ></div>
          </div>
          <img
            src={getSafeImageUrl(meme.url)}
            alt={meme.name}
            className="w-16 h-16 object-cover rounded-full mt-2 border border-gray-600"
          />
        </div>
      ))}
    </div>
  );
};

export default MemeList;
