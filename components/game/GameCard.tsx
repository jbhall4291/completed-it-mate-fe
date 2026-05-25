'use client';

import { memo, useMemo } from 'react';
import AddToLibraryButton from './AddToLibraryButton';
import type { LibraryStatus } from '@/types/library';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import GameImage from './GameImage';
import { GameCardViewModel } from '@/types/gameCard';
import { cn } from '@/lib/utils';

function PlatformBadges({ slugs }: { slugs: string[] }) {
    if (!slugs?.length) return null;

    const names = slugs.join(', ');

    return (
        <div
            className="flex items-center gap-1 text-xs text-gray-200"
            title={names}
        >
            {slugs.slice(0, 3).map((s) => (
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
    hidePlatformChips = false,
}: Props) {
    const platforms = useMemo(() => game.parentPlatforms ?? [], [game]);
    const cc = game.completedCount ?? 0;
    const isAdded = game.isInLibrary;
    const currentStatus = game.userStatus;

    return (
        <div
            className={cn(
                'relative w-full rounded-lg shadow-lg group overflow-visible',
                open ? 'z-50 isolate' : ''
            )}
        >
            <Link
                href={`/games/${game.id}`}
                aria-label={`View details for ${game.title}`}
                className={cn(
                    'block rounded-lg focus-visible:outline-none',
                    'focus-visible:ring-4 focus-visible:ring-green-400',
                    'focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c1f]'
                )}
            >
                <div className="relative overflow-hidden rounded-lg bg-muted">
                    <div className="relative h-60">
                        <GameImage
                            src={game.imageUrl ?? '/placeholder.webp'}
                            alt=""
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />

                        {cc > 0 && (
                            <div className="absolute top-2 right-2 z-10 pointer-events-none">
                                <span className="bg-background/70 backdrop-blur text-xs font-medium px-2 py-0.5 rounded flex items-center">
                                    <Trophy
                                        strokeWidth={3}
                                        className="-ml-0.5 mr-1.5 h-3.5 w-3.5 text-yellow-500"
                                        aria-hidden="true"
                                    />
                                    {cc} {cc === 1 ? 'COMPLETION' : 'COMPLETIONS'}
                                </span>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 pl-3 pb-16 pr-2">
                            <h2 className="font-bold text-xl leading-tight line-clamp-2 mb-1">
                                {game.title}
                            </h2>

                            {!hidePlatformChips && <PlatformBadges slugs={platforms} />}
                        </div>
                    </div>
                </div>
            </Link>

            <div className="absolute bottom-3 left-3 right-3 z-20">
                {!isAdded ? (
                    <AddToLibraryButton
                        isAdded={false}
                        onAdd={onAdd ? (status) => onAdd(game.id, status) : undefined}
                        open={open}
                        onOpenChange={onOpenChange}
                    />
                ) : (
                    <AddToLibraryButton
                        isAdded
                        currentStatus={currentStatus}
                        onUpdate={onUpdate ? (status) => onUpdate(game.id, status) : undefined}
                        onRemove={onRemove ? () => onRemove(game.id) : undefined}
                        open={open}
                        onOpenChange={onOpenChange}
                    />
                )}
            </div>
        </div>
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