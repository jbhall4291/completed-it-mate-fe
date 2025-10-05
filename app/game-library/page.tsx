// app/game-library/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
    getAllGames,
    getUserGames,
    addGame,
    updateGameStatus,
    deleteGame,
    type Game,
    type UserGameCreated,
    type LibraryStatus,
} from '@/lib/api';
import { useGameContext } from '@/lib/GameContext';
import GameCard from '@/components/game/GameCard';

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [addedGames, setAddedGames] = useState<Set<string>>(new Set());                 // gameId -> in library
    const [idByGameId, setIdByGameId] = useState<Map<string, string>>(new Map());        // gameId -> userGameId
    const [statusByGameId, setStatusByGameId] = useState<Map<string, LibraryStatus>>(    // gameId -> status
        new Map()
    );
    const [loading, setLoading] = useState(true);
    const hardcodedUserId = '6890a2561ffcdd030b19c08c';

    const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);


    const { refreshGameCount } = useGameContext();

    useEffect(() => {
        (async () => {
            try {
                const [gameList, library] = await Promise.all([
                    getAllGames(),
                    getUserGames(hardcodedUserId),
                ] as const);

                setGames(gameList);
                setAddedGames(new Set(library.map(i => i.gameId._id)));
                setIdByGameId(new Map(library.map(i => [i.gameId._id, i._id])));
                setStatusByGameId(new Map(library.map(i => [i.gameId._id, i.status as LibraryStatus])));

                await refreshGameCount(hardcodedUserId);
            } catch (err) {
                console.error('Error loading games/library:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [refreshGameCount]);

    // OPTIMISTIC add or status change
    async function handleAddGame(gameId: string, status: LibraryStatus) {
        if (!addedGames.has(gameId)) {
            // optimistic add
            setAddedGames(prev => new Set(prev).add(gameId));
            setStatusByGameId(prev => new Map(prev).set(gameId, status));

            try {
                const created: UserGameCreated = await addGame(hardcodedUserId, gameId, status);
                setIdByGameId(prev => new Map(prev).set(gameId, created._id));
                await refreshGameCount(hardcodedUserId);
            } catch (err) {
                console.error('Add failed:', err);
                // no rollback by design
            }
            return;
        }

        // already added → optimistic status change
        setStatusByGameId(prev => new Map(prev).set(gameId, status));
        const userGameId = idByGameId.get(gameId);
        if (userGameId) {
            updateGameStatus(userGameId, status).catch(e => console.error('Update failed:', e));
        }
    }

    // OPTIMISTIC status change when already added (called from card)
    async function handleUpdateFromBrowse(gameId: string, status: LibraryStatus) {
        if (openMenuGameId === gameId) setOpenMenuGameId(null);
        setStatusByGameId(prev => new Map(prev).set(gameId, status));
        const userGameId = idByGameId.get(gameId);
        if (!userGameId) return;
        try {
            await updateGameStatus(userGameId, status);
        } catch (err) {
            console.error('Failed to update status from browse:', err);
        }
    }

    // OPTIMISTIC remove
    async function handleRemoveFromBrowse(gameId: string) {
        const userGameId = idByGameId.get(gameId);

        // optimistic state updates
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
        setStatusByGameId(prev => {
            const m = new Map(prev);
            m.delete(gameId);
            return m;
        });

        if (!userGameId) return;

        try {
            await deleteGame(userGameId);
            await refreshGameCount(hardcodedUserId);
        } catch (err) {
            console.error('Failed to remove game:', err);
            // no rollback by design
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
                    const currentStatus = statusByGameId.get(g._id);

                    return (
                        <GameCard
                            key={g._id}
                            game={g}
                            isAdded={isAdded}
                            currentStatus={currentStatus}
                            onAdd={(gameId, status) => handleAddGame(gameId, status)}
                            onUpdate={isAdded ? (gameId, status) => handleUpdateFromBrowse(gameId, status) : undefined}
                            onRemove={isAdded ? (gameId) => handleRemoveFromBrowse(gameId) : undefined}
                            // NEW: control the dropdown
                            open={openMenuGameId === g._id}
                            onOpenChange={(open) => setOpenMenuGameId(open ? g._id : null)}
                        />
                    );
                })}
            </div>
        </main>
    );
}
