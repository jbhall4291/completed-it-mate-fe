'use client';

import { memo, useMemo } from 'react';
import AddToLibraryButton from './AddToLibraryButton';
import type { LibraryStatus } from '@/types/library';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import GameImage from './GameImage';
import { GameCardViewModel } from '@/types/gameCard';

function PlatformBadges({ slugs }: { slugs: string[] }) {
    if (!slugs?.length) return null;
    const names = slugs.join(', ');
    return (
        <div
            className="flex items-center gap-1 text-xs text-gray-200"
            title={names}
        >
            {slugs.slice(0, 3).map(s => (
                <span
                    key={s}
                    className="px-1.5 py-0.5 rounded bg-background/70 backdrop-blur uppercase"
                >
                    {s}
                </span>
            ))}
            {slugs.length > 3 && (
                <span className="px-1.5 py-0.5 rounded bg-background/70 backdrop-blur">
                    +{slugs.length - 3}
                </span>
            )}
        </div>
    );
}

type Props = {
    game: GameCardViewModel;
    onAdd?: (gameId: string, status: LibraryStatus) => void;
    onUpdate?: (gameId: string, status: LibraryStatus) => void;
    onRemove?: (gameId: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hidePlatformChips?: boolean;
};

function GameCard({
    game,
    onAdd,
    onUpdate,
    onRemove,
    open,
    onOpenChange,
    hidePlatformChips = false
}: Props) {
    const platforms = useMemo(() => game.parentPlatforms ?? [], [game]);
    const cc = game.completedCount ?? 0;
    const isAdded = game.isInLibrary;
    const currentStatus = game.userStatus;

    return (
        <div
            className={`relative rounded-lg shadow-lg group w-full overflow-visible cursor-pointer ${open ? 'z-50 isolate' : ''
                }`}
        >
            {/* Full-card clickable layer */}
            <Link
                prefetch={false}
                href={`/games/${game.id}`}
                aria-label={`Open ${game.title}`}
                className="absolute inset-0 z-0"
            />

            {/* Card content */}
            <div className="relative z-10 pointer-events-none">
                {/* Media */}
                <div className="h-60 rounded-lg overflow-hidden relative bg-muted">
                    <GameImage
                        src={game.imageUrl ?? '/placeholder.png'}
                        alt={game.title}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />

                    {cc > 0 && (
                        <div className="absolute top-2 right-2 z-10 pointer-events-none">
                            <span
                                className="bg-background/70 backdrop-blur
                                           text-xs font-medium
                                           px-2 py-0.5 rounded
                                           flex items-center"
                            >
                                <Trophy
                                    strokeWidth={3}
                                    className="-ml-0.5 mr-1.5 h-3.5 w-3.5 text-yellow-500"
                                />
                                {cc} {cc === 1 ? 'COMPLETION' : 'COMPLETIONS'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer overlay */}
                <div className="absolute bottom-0 left-0 right-0 pl-3 pb-3 pr-2 pointer-events-none">
                    <h2 className="font-bold text-xl leading-tight line-clamp-2 mb-1">
                        {game.title}
                    </h2>

                    {!hidePlatformChips && <PlatformBadges slugs={platforms} />}

                    {/* Actions – opt out of card navigation */}
                    <div
                        className="mt-1.5 pointer-events-auto cursor-default w-fit "
                        onClick={(e) => e.stopPropagation()}
                    >

                        {!isAdded ? (
                            <AddToLibraryButton
                                isAdded={false}
                                onAdd={
                                    onAdd
                                        ? status => onAdd(game.id, status)
                                        : undefined
                                }
                                open={open}
                                onOpenChange={onOpenChange}
                            />
                        ) : (
                            <AddToLibraryButton
                                isAdded
                                currentStatus={currentStatus}
                                onUpdate={
                                    onUpdate
                                        ? status => onUpdate(game.id, status)
                                        : undefined
                                }
                                onRemove={
                                    onRemove
                                        ? () => onRemove(game.id)
                                        : undefined
                                }
                                open={open}
                                onOpenChange={onOpenChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default memo(
    GameCard,
    (a, b) =>
        a.game.id === b.game.id &&
        a.game.isInLibrary === b.game.isInLibrary &&
        a.game.userStatus === b.game.userStatus &&
        a.open === b.open &&
        a.hidePlatformChips === b.hidePlatformChips &&
        a.game.imageUrl === b.game.imageUrl &&
        a.game.title === b.game.title &&
        a.game.completedCount === b.game.completedCount &&
        a.game.parentPlatforms?.join('|') === b.game.parentPlatforms?.join('|')
);
