// components/game/GameCard.tsx
'use client';

import { memo, useMemo } from 'react';
import AddToLibraryButton from './AddToLibraryButton';
import type { Game, LibraryStatus } from '@/lib/api';

type Props = {
    game: Game;
    isAdded: boolean;
    currentStatus?: LibraryStatus;
    onAdd?: (gameId: string, status: LibraryStatus) => void;   // <- make optional
    onUpdate?: (gameId: string, status: LibraryStatus) => void;
    onRemove?: (gameId: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

function GameCard({
    game, isAdded, currentStatus, onAdd, onUpdate, onRemove, open, onOpenChange,
}: Props) {
    const platforms = useMemo(() => {
        const p = game.parentPlatforms ?? [];
        return p.length ? p.join(', ') : '—';
    }, [game.parentPlatforms]);

    return (
        <div className={`relative rounded-lg shadow-lg group w-[300px] overflow-visible ${open ? 'z-50 isolate' : 'z-0'}`}>
            <div className="h-60 rounded-t-lg overflow-hidden">
                <img
                    src={game.imageUrl ?? '/placeholder.png'}
                    alt={game.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                <div className="flex items-center gap-2 mb-1 text-gray-300 text-sm">
                    <span className="truncate">{platforms}</span>
                </div>

                <h2 className="text-white font-bold leading-tight truncate">{game.title}</h2>

                {game.completedCount > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-0.5 rounded">
                            {game.completedCount} users completed it mate
                        </span>
                    </div>
                )}

                <div className="mt-2">
                    {!isAdded ? (
                        <AddToLibraryButton
                            isAdded={false}
                            onAdd={onAdd ? (status) => onAdd(game._id, status) : undefined} // guard
                            open={open}
                            onOpenChange={onOpenChange}
                        />
                    ) : (
                        <AddToLibraryButton
                            isAdded
                            currentStatus={currentStatus}
                            onUpdate={onUpdate ? (status) => onUpdate(game._id, status) : undefined}
                            onRemove={onRemove ? () => onRemove(game._id) : undefined}
                            open={open}
                            onOpenChange={onOpenChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Memoize — include `open` so the controlled dropdown can update.
export default memo(
    GameCard,
    (prev, next) =>
        prev.game._id === next.game._id &&
        prev.isAdded === next.isAdded &&
        prev.currentStatus === next.currentStatus &&
        prev.open === next.open &&
        prev.game.title === next.game.title &&
        prev.game.imageUrl === next.game.imageUrl &&
        prev.game.completedCount === next.game.completedCount &&
        prev.game.parentPlatforms.join(',') === next.game.parentPlatforms.join(',')
);