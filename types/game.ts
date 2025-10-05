export type GameCardDTO = {
    _id: string;
    title: string;
    imageUrl: string | null;
    parentPlatforms: string[];
    releaseDate: string | null;
    completedCount: number;
};

export type GameDetailDTO = GameCardDTO & {
    genres?: string[];
    developers?: string[];
    publishers?: string[];
    description?: string;
    screenshots?: string[];
    storeLinks?: { store: string; url: string }[];
    metacritic?: { score: number; url?: string };
    rawgId?: number;
};
