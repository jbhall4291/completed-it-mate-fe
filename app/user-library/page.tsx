'use client';

import { useEffect, useState } from 'react';
import { getUserGames, deleteGame } from '../../lib/api';
import type { LibraryItem } from '../../lib/api';
import { useGameContext } from '../../lib/GameContext';

export default function LibraryPage() {
    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const hardcodedUserId = '6890a2561ffcdd030b19c08c';

    const { refreshGameCount } = useGameContext();

    useEffect(() => {
        void fetchLibrary();
    }, []);

    async function fetchLibrary() {
        try {
            const usersGames = await getUserGames(hardcodedUserId);
            setLibrary(usersGames);
            await refreshGameCount(hardcodedUserId); // keep badge in sync
        } catch (err) {
            console.error('Error fetching users library:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveGame(userGameId: string) {
        try {
            await deleteGame(userGameId);
            setLibrary(prev => prev.filter(g => g._id !== userGameId));
            await refreshGameCount(hardcodedUserId); // single source of truth
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
                        <div
                            key={g._id}
                            data-testid="game-card"
                            className="border border-gray-300 flex flex-col justify-between w-[300px] h-[400px] rounded-lg p-4 bg-white shadow"
                        >
                            <div>
                                <h2 className="text-lg font-semibold">{g.gameId.title}</h2>
                                <p className="text-gray-600">{g.gameId.platform}</p>
                                <p className="text-sm text-gray-500">Status: {g.status}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveGame(g._id)}
                                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                            >
                                Remove from Library
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No games in your library.</p>
                )}
            </div>
        </main>
    );
}
