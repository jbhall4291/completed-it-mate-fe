'use client';
import { useEffect, useState, useCallback } from 'react';
import { getUserGames, deleteGame, updateGameStatus, type LibraryItem, type LibraryStatus } from '@/lib/api';
import { useGameContext } from '@/lib/GameContext';
import GameCard from '@/components/game/GameCard';
import SkeletonCard from '@/components/game/SkeletonGameCard';


function useConfirm() {
    const [pending, setPending] = useState<null | {
        message: string;
        resolve: (ok: boolean) => void;
    }>(null);

    const confirm = useCallback((message: string) => {
        return new Promise<boolean>(resolve => setPending({ message, resolve }));
    }, []);

    const close = (ok: boolean) => {
        pending?.resolve(ok);
        setPending(null);
    };

    const ui = !pending ? null : (
        <div
            className="fixed inset-0 z-50 grid place-items-center  p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clm-confirm-title"
            onKeyDown={(e) => {
                if (e.key === 'Escape') close(false);
                if (e.key === 'Enter') close(true);
            }}
        >
            <div className="w-full max-w-md rounded-2xl   border border-white/10 shadow-xl">
                <div className="px-5 py-4 border-b border-white/10">
                    <h2 id="clm-confirm-title" className="text-lg font-semibold">Remove from library?</h2>
                </div>
                <div className="px-5 py-4 text-sm ">
                    {pending.message}
                </div>
                <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                        onClick={() => close(false)}
                        autoFocus
                    >
                        Cancel
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600"
                        onClick={() => close(true)}
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );

    return { confirm, ConfirmUI: ui };
}


export default function LibraryPage() {
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);
    const { refreshGameCount } = useGameContext();
    const { confirm, ConfirmUI } = useConfirm();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const usersGames = await getUserGames();
                if (!cancelled) setLibrary(usersGames);
                await refreshGameCount();
            } catch (err) {
                console.error('Error fetching users library:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [refreshGameCount]);

    async function handleUpdateGame(userGameId: string, status: LibraryStatus) {
        try {
            const updated = await updateGameStatus(userGameId, status);
            setLibrary(prev => prev.map(i => (i._id === userGameId ? { ...i, status: updated.status } : i)));
            setOpenMenuGameId(null);
        } catch (err) { console.error('Failed to update status:', err); }
    }

    async function handleRemoveGame(userGameId: string, title?: string) {
        const ok = await confirm(`Remove “${title ?? 'this game'}” from your library?`);
        if (!ok) return;

        try {
            await deleteGame(userGameId);
            setLibrary(prev => prev.filter(g => g._id !== userGameId));
            setOpenMenuGameId(null);
            await refreshGameCount();
        } catch (err) { console.error('Failed to remove game:', err); }
    }

    if (loading) {
        return (
            <main className="p-6 font-sans  min-h-screen">
                <h1 className="text-3xl font-bold  mb-6">My Library</h1>
                <div className="flex flex-wrap gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </main>
        );
    }



    return (
        <main className="relative p-6 font-sans  min-h-screen">
            <h1 className="text-3xl font-bold  mb-6">My Library</h1>

            <div className="flex flex-wrap  gap-4">
                {library.length ? library.map((g) => (
                    <GameCard
                        key={g._id}
                        game={g.gameId}
                        isAdded
                        currentStatus={g.status}
                        onUpdate={(_, status) => handleUpdateGame(g._id, status)}
                        onRemove={() => handleRemoveGame(g._id, g.gameId.title)}
                        open={openMenuGameId === g.gameId._id}
                        onOpenChange={(open) => setOpenMenuGameId(open ? g.gameId._id : null)}
                    />
                )) : (
                    <p className="">No games in your library.</p>
                )}
            </div>

            {ConfirmUI}
        </main>
    );
}
