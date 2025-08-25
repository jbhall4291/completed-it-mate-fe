'use client';

import { useEffect, useState } from 'react';
import {
    getAllGames,
    getUserGames,
    addGame,
    deleteGame,
    type Game,
    type UserGameCreated,
} from '../../lib/api';
import { useGameContext } from '../../lib/GameContext';

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [addedGames, setAddedGames] = useState<Set<string>>(new Set());         // gameIds the user owns
    const [idByGameId, setIdByGameId] = useState<Map<string, string>>(new Map()); // gameId -> userGameId
    const [loading, setLoading] = useState(true);
    const hardcodedUserId = '6890a2561ffcdd030b19c08c';

    const { refreshGameCount } = useGameContext();

    useEffect(() => {
        (async () => {
            try {
                const [gameList, library] = await Promise.all([
                    getAllGames(),
                    getUserGames(hardcodedUserId),
                ] as const);

                setGames(gameList);

                // Build owned set + map
                setAddedGames(new Set(library.map(i => i.gameId._id)));
                setIdByGameId(new Map(library.map(i => [i.gameId._id, i._id])));

                // Sync global badge from backend truth
                await refreshGameCount(hardcodedUserId);
            } catch (err) {
                console.error('Error loading games/library:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [refreshGameCount]);

    async function handleAddGame(gameId: string) {
        try {
            // Avoid duplicate POSTs if already added
            if (addedGames.has(gameId)) return;

            const created: UserGameCreated = await addGame(hardcodedUserId, gameId, 'owned');

            // Update local sets/maps using the real userGameId
            setAddedGames(prev => new Set(prev).add(gameId));
            setIdByGameId(prev => {
                const m = new Map(prev);
                m.set(gameId, created._id);
                return m;
            });

            await refreshGameCount(hardcodedUserId);
        } catch (err: any) {
            // If backend returns 409 for duplicates, treat as already-added
            if (err?.response?.status === 409) {
                setAddedGames(prev => new Set(prev).add(gameId));
                await refreshGameCount(hardcodedUserId);
                return;
            }
            console.error('Failed to add game:', err);
        }
    }

    async function handleRemoveGame(gameId: string) {
        try {
            const userGameId = idByGameId.get(gameId);
            if (!userGameId) {
                console.warn('No userGameId for', gameId);
                return;
            }

            await deleteGame(userGameId); // DELETE /library/:userGameId

            setAddedGames(prev => {
                const s = new Set(prev);
                s.delete(gameId);
                return s;
            });
            setIdByGameId(prev => {
                const m = new Map(prev);
                m.delete(gameId);
                return m;
            });

            await refreshGameCount(hardcodedUserId);
        } catch (err) {
            console.error('Failed to remove game:', err);
        }
    }

    if (loading) {
        return (
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold text-blue-600">Loading Games...</h1>
            </main>
        );
    }

    return (
        <main className="p-6 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">All Games</h1>

            <div className="flex flex-wrap gap-4">
                {games.map(g => {
                    const isAdded = addedGames.has(g._id);
                    return (
                        <div
                            key={g._id}
                            data-testid="game-card"
                            className="text-black border border-gray-300 p-4 flex flex-col justify-between w-[300px] h-[400px] rounded-lg bg-white shadow"
                        >
                            <div>
                                <h2 className="text-lg font-semibold">{g.title}</h2>
                                <p className="text-gray-500">{g.platform}</p>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => handleAddGame(g._id)}
                                    disabled={isAdded}
                                    className={`py-2 px-4 rounded font-semibold transition ${isAdded ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    {isAdded ? 'Game Added' : 'Add to Library'}
                                </button>

                                {isAdded && (
                                    <button
                                        onClick={() => handleRemoveGame(g._id)}
                                        className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
