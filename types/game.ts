// types/index.ts
import type { LibraryStatus } from '@/lib/api';

export type GameCardDTO = {
  _id: string;
  slug?: string;
  title: string;
  imageUrl: string | null;
  parentPlatforms: string[];
  releaseDate: string | null;
  avgCompletionTime: number;     // ← add this (page uses it)
  completedCount: number;
};

export type GameDetailDTO = GameCardDTO & {
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  description?: string;
  screenshots?: string[];
  storeLinks?: { store: string; url: string }[];
  metacritic?: { score: number; url?: string } | null;
  rawgId?: number;
  // new:
  userStatus?: LibraryStatus;
  userGameId?: string;
};
