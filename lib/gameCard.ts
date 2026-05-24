import type { GameCardDTO } from '@/types/game';
import { GameCardViewModel } from '@/types/gameCard';
import type { GameCardLibraryState } from '@/types/library';

export function toGameCardViewModel(
    game: GameCardDTO,
    libraryState?: GameCardLibraryState
): GameCardViewModel {
    return {
        id: game._id,
        slug: game.slug,
        title: game.title,
        imageUrl: game.imageUrl,
        parentPlatforms: game.parentPlatforms,
        releaseDate: game.releaseDate,
        avgCompletionTime: game.avgCompletionTime,
        completedCount: game.completedCount,
        isInLibrary: libraryState?.isInLibrary ?? false,
        userStatus: libraryState?.userStatus,
        userGameId: libraryState?.userGameId,
    };
}