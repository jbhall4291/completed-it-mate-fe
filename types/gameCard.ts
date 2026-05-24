import type { LibraryStatus } from '@/lib/api';

export type GameCardViewModel = {
  id: string;
  slug?: string;
  title: string;
  imageUrl: string | null;
  parentPlatforms: string[];
  releaseDate: string | null;
  avgCompletionTime: number;
  completedCount: number;
  isInLibrary: boolean;
  userStatus?: LibraryStatus;
  userGameId?: string;
};