export type LibraryStatus = 'owned' | 'playing' | 'completed' | 'wishlist';

export type LibraryItemDTO = {
    _id: string;         // userGameId
    userId: string;
    status: LibraryStatus;
    createdAt: string;
    updatedAt: string;
    gameId: import('./game').GameCardDTO; // populated
};
