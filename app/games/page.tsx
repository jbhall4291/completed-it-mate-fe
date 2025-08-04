'use client';

import { useEffect, useState } from 'react';
import { getAllGames, getUser, addGame, deleteGame, Game, User } from '../../lib/api';
import { useGameContext } from '../../lib/GameContext';


export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [addedGames, setAddedGames] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const hardcodedUserId = '6890a2561ffcdd030b19c08c'; // for now

    const { setGameCount } = useGameContext();


    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all games
                const gameList = await getAllGames();
                setGames(gameList);

                // Fetch user to see which games they already own
                const user: User = await getUser(hardcodedUserId);
                const owned = new Set(user.gamesOwned.map((g) => g._id)); // Prepopulate
                setAddedGames(owned);
            } catch (err) {
                console.error('Error loading games or user data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    async function handleAddGame(gameId: string) {
        try {
            await addGame(hardcodedUserId, gameId);
            setAddedGames((prev) => new Set(prev).add(gameId));
            setGameCount((count) => count + 1); // update global badge
        } catch (err) {
            console.error('Failed to add game:', err);
        }
    }

    async function handleRemoveGame(gameId: string) {
        try {
            await deleteGame(hardcodedUserId, gameId);
            setAddedGames((prev) => {
                const updated = new Set(prev);
                updated.delete(gameId);
                return updated;
            });
            setGameCount((count) => Math.max(0, count - 1)); // update global badge
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
                {games.map((g) => {
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
