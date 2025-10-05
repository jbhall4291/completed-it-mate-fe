// app/user-library/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
    getUserGames,
    deleteGame,
    updateGameStatus,
    type LibraryItem,
    type LibraryStatus,
} from '@/lib/api';
import { useGameContext } from '@/lib/GameContext';
import GameCard from '@/components/game/GameCard';

export default function LibraryPage() {
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null); // 👈 one-open-at-a-time

    const hardcodedUserId = '6890a2561ffcdd030b19c08c';
    const { refreshGameCount } = useGameContext();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const usersGames = await getUserGames(hardcodedUserId);
                if (!cancelled) setLibrary(usersGames);
                await refreshGameCount(hardcodedUserId);
            } catch (err) {
                console.error('Error fetching users library:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [hardcodedUserId, refreshGameCount]);


    async function handleUpdateGame(userGameId: string, status: LibraryStatus) {
        try {
            const updated = await updateGameStatus(userGameId, status);
            setLibrary(prev =>
                prev.map(i => (i._id === userGameId ? { ...i, status: updated.status } : i))
            );
            setOpenMenuGameId(null); // 👈 close menu after action
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    }

    async function handleRemoveGame(userGameId: string) {
        try {
            await deleteGame(userGameId);
            setLibrary(prev => prev.filter(g => g._id !== userGameId));
            setOpenMenuGameId(null); // 👈 close if it was open
            await refreshGameCount(hardcodedUserId);
        } catch (err) {
            console.error('Failed to remove game:', err);
        }
    }

    if (loading) {
        return (
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold text-blue-600">Loading Your Library...</h1>
            </main>
        );
    }

    return (
        <main className="p-6 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">My Library</h1>

            <div className="flex flex-wrap text-black gap-4">
                {library.length ? (
                    library.map((g) => (
                        <GameCard
                            key={g._id}
                            game={g.gameId}                 // populated game doc
                            isAdded
                            currentStatus={g.status}
                            onUpdate={(_, status) => handleUpdateGame(g._id, status)}
                            onRemove={() => handleRemoveGame(g._id)}
                            // 👇 control the dropdown & lift card z-index when open
                            open={openMenuGameId === g.gameId._id}
                            onOpenChange={(open) => setOpenMenuGameId(open ? g.gameId._id : null)}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No games in your library.</p>
                )}
            </div>
        </main>
    );
}
