'use client';
import { useEffect, useState } from 'react';
import { getUserGames, deleteGame, updateGameStatus, type LibraryItem, type LibraryStatus } from '@/lib/api';
import { useGameContext } from '@/lib/GameContext';
import GameCard from '@/components/game/GameCard';

export default function LibraryPage() {
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);
    const { refreshGameCount } = useGameContext();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const usersGames = await getUserGames();   // ← no hardcoded id
                if (!cancelled) setLibrary(usersGames);
                await refreshGameCount();                  // ← no param
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

    async function handleRemoveGame(userGameId: string) {
        try {
            await deleteGame(userGameId);
            setLibrary(prev => prev.filter(g => g._id !== userGameId));
            setOpenMenuGameId(null);
            await refreshGameCount();                   // ← no param
        } catch (err) { console.error('Failed to remove game:', err); }
    }

    if (loading) return (
        <main className="p-6 font-sans">
            <h1 className="text-3xl font-bold text-blue-600">Loading Your Library...</h1>
        </main>
    );

    return (
        <main className="p-6 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">My Library</h1>
            <div className="flex flex-wrap text-black gap-4">
                {library.length ? library.map((g) => (
                    <GameCard
                        key={g._id}
                        game={g.gameId}
                        isAdded
                        currentStatus={g.status}
                        onUpdate={(_, status) => handleUpdateGame(g._id, status)}
                        onRemove={() => handleRemoveGame(g._id)}
                        open={openMenuGameId === g.gameId._id}
                        onOpenChange={(open) => setOpenMenuGameId(open ? g.gameId._id : null)}
                    />
                )) : (
                    <p className="text-gray-500">No games in your library.</p>
                )}
            </div>
        </main>
    );
}
