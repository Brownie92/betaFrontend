export interface Meme {
  memeId: string;
  name: string;
  url: string;
  votes: number;
  progress: number;
}

export interface RaceUpdate {
  raceId: string;
  memes: Meme[]; // ✅ Links to the `Meme` interface
  currentRound: number;
  roundEndTime: string;
  status: "active" | "closed";
  createdAt: string;
}

export interface RoundProgress {
  memeId: string;
  progress: number;
  boosted: boolean;
  boostAmount: number;
}

export interface RoundUpdate {
  raceId: string;
  roundNumber: number;
  progress: RoundProgress[]; // ✅ Extracted to a separate interface for clarity
  winner?: string;
}

export interface WinnerUpdate {
  raceId: string;
  memeId: string;
  progress: number;
  votes: number;
}

export interface VoteUpdate {
  raceId: string;
  memeId: string;
  totalVotes: number;
}