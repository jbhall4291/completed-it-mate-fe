import type { GameCardDTO } from './game';

export type LibraryStatus = 'owned' | 'playing' | 'completed' | 'wishlist';

export type LibraryItemDTO = {
    _id: string;
    userId: string;
    status: LibraryStatus;
    createdAt: string;
    updatedAt: string;
    gameId: GameCardDTO;
};
