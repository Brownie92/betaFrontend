export interface Meme {
    memeId: string;
    name: string;
    url: string;
    votes: number;
    progress: number;
  }
  export interface RaceUpdate {
    raceId: string;
    memes: Meme[]; // ✅ Verwijst nu naar de bestaande `Meme` interface
    currentRound: number;
    roundEndTime: string;
    status: "active" | "closed";
    createdAt: string;
  }
  
  export interface RoundUpdate {
    raceId: string;
    roundNumber: number;
    progress: {
      memeId: string;
      progress: number;
      boosted: boolean;
      boostAmount: number;
    }[];
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