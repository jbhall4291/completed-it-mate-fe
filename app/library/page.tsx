'use client';

import { useEffect, useState } from 'react';
import { getUser, deleteGame, User } from '../../lib/api';
import { useGameContext } from '../../lib/GameContext';

export default function LibraryPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const hardcodedUserId = "687bd767e7f8c28253f33359"; // For now

    const { setGameCount } = useGameContext();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    async function fetchUserDetails() {
        try {
            const userDetails = await getUser(hardcodedUserId);
            setUser(userDetails);
        } catch (err) {
            console.error('Error fetching user:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveGame(gameId: string) {
        if (!user) return;

        try {
            await deleteGame(hardcodedUserId, gameId);
            // Optimistically update UI by filtering the removed game
            setUser({
                ...user,
                gamesOwned: user.gamesOwned.filter((g) => g._id !== gameId),
            });
            setGameCount((count) => count - 1); // update global badge
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
                {user?.gamesOwned.length ? (
                    user.gamesOwned.map((g) => (
                        <div
                            key={g._id}
                            data-testid="game-card"
                            className="border border-gray-300 flex flex-col justify-between w-[300px] h-[400px] rounded-lg p-4 bg-white shadow"
                        >
                            <div>
                                <h2 className="text-lg font-semibold">{g.title}</h2>
                                <p className="text-gray-600">{g.platform}</p>
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
