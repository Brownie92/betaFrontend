// src/types/websocketTypes.ts

export interface Meme {
    memeId: string;
    name: string;
    url: string;
    votes: number;
    progress: number;
  }
  
  export interface RaceUpdate {
    raceId: string;
    memes: Meme[];
    currentRound: number;
    roundEndTime: string;
    status: "active" | "closed";
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