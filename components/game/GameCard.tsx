// components/game/GameCard.tsx
'use client';

import { memo, useMemo } from 'react';
import AddToLibraryButton from './AddToLibraryButton';
import type { Game, LibraryStatus } from '@/lib/api';
import Link from 'next/link';

function PlatformBadges({ slugs }: { slugs: string[] }) {
    if (!slugs?.length) return null;
    const names = slugs.join(', ');
    return (
        <div className="flex items-center gap-1 text-xs text-gray-200" title={names}>
            {slugs.slice(0, 3).map(s => (
                <span key={s} className="px-1.5 py-0.5 rounded bg-white/10 capitalize">{s}</span>
            ))}
            {slugs.length > 3 && <span className="px-1.5 py-0.5 rounded bg-white/10">+{slugs.length - 3}</span>}
        </div>
    );
}

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

    const platforms = useMemo(() => game.parentPlatforms ?? [], [game]);
    const cc = game.completedCount ?? 0;

    return (
        <div className={`relative rounded-lg shadow-lg group w-full overflow-visible ${open ? 'z-50 isolate' : ''}`}>

            {/* Clickable media/title area */}
            <Link href={`/games/${game._id}`} className="block">
                <div className="h-60 rounded-t-lg overflow-hidden relative">
                    <img
                        src={game.imageUrl ?? "/placeholder.png"}
                        alt={game.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-[1.1] origin-center
               transition-transform duration-300 group-hover:scale-[1.15]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />
                </div>

            </Link>

            {/* footer overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <PlatformBadges slugs={platforms} />
                <Link href={`/games/${game._id}`} className="block">
                    <h2 className=" font-bold leading-tight line-clamp-2">{game.title}</h2>
                </Link>

                {cc > 0 && (
                    <div className="mt-2">
                        <span className="bg-background/60  text-xs font-semibold px-2 py-0.5 rounded">
                            {cc} {cc === 1 ? 'user' : 'users'} completed it mate
                        </span>
                    </div>
                )}

                {/* Actions – stop navigation when interacting */}
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    {!isAdded ? (
                        <AddToLibraryButton
                            isAdded={false}
                            onAdd={onAdd ? (status) => onAdd(game._id, status) : undefined}
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

export default memo(
    GameCard,
    (a, b) =>
        a.game._id === b.game._id &&
        a.isAdded === b.isAdded &&
        a.currentStatus === b.currentStatus &&
        a.open === b.open &&
        a.game.imageUrl === b.game.imageUrl &&
        a.game.title === b.game.title &&
        a.game.completedCount === b.game.completedCount
);