import { describe, expect, it } from 'vitest';
import { toGameCardViewModel } from './gameCard';
import type { GameCardDTO } from '@/types/game';

const game: GameCardDTO = {
    _id: 'resident-evil-2',
    slug: 'resident-evil-2',
    title: 'Resident Evil 2',
    imageUrl:
        'https://media.rawg.io/media/games/053/053fc543bf488349610f1ae2d0c1b51b.jpg',
    parentPlatforms: ['pc', 'playstation', 'xbox'],
    releaseDate: '2019-01-25',
    avgCompletionTime: 8,
    completedCount: 1,
};

describe('toGameCardViewModel', () => {
    it('maps a game that is not in the user library', () => {
        const result = toGameCardViewModel(game);

        expect(result).toEqual({
            id: 'resident-evil-2',
            slug: 'resident-evil-2',
            title: 'Resident Evil 2',
            imageUrl:
                'https://media.rawg.io/media/games/053/053fc543bf488349610f1ae2d0c1b51b.jpg',
            parentPlatforms: ['pc', 'playstation', 'xbox'],
            releaseDate: '2019-01-25',
            avgCompletionTime: 8,
            completedCount: 1,
            isInLibrary: false,
            userStatus: undefined,
            userGameId: undefined,
        });
    });

    it('maps a game with user library state', () => {
        const result = toGameCardViewModel(game, {
            isInLibrary: true,
            userStatus: 'completed',
            userGameId: 'library-item-1',
        });

        expect(result).toMatchObject({
            id: 'resident-evil-2',
            isInLibrary: true,
            userStatus: 'completed',
            userGameId: 'library-item-1',
        });
    });
});