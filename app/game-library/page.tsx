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

const USER_READY_EVENT = 'clm:user-ready';

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [addedGames, setAddedGames] = useState<Set<string>>(new Set());         // gameId -> in library
    const [idByGameId, setIdByGameId] = useState<Map<string, string>>(new Map()); // gameId -> userGameId
    const [statusByGameId, setStatusByGameId] = useState<Map<string, LibraryStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);

    const { refreshGameCount } = useGameContext();

    // 1) Load the games list immediately
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const gameList = await getAllGames();
                if (!cancelled) setGames(gameList);
            } catch (err) {
                console.error('Error loading games:', err);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // 2) Load the user's library once the anon user is ready (or immediately if already set)
    useEffect(() => {
        let cancelled = false;

        async function loadLibrary() {
            try {
                const lib = await getUserGames();              // auto injects userId from storage
                if (cancelled) return;
                setAddedGames(new Set(lib.map(i => i.gameId._id)));
                setIdByGameId(new Map(lib.map(i => [i.gameId._id, i._id])));
                setStatusByGameId(new Map(lib.map(i => [i.gameId._id, i.status as LibraryStatus])));
                await refreshGameCount();
            } catch (err) {
                console.error('Error loading user library:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        // if we already have a user this session, load immediately; otherwise wait for bootstrap
        const existing = typeof window !== 'undefined' ? sessionStorage.getItem('clm_user_id') : null;
        if (existing) {
            void loadLibrary();
        } else {
            const onReady = () => void loadLibrary();
            window.addEventListener(USER_READY_EVENT, onReady);
            return () => window.removeEventListener(USER_READY_EVENT, onReady);
        }

        return () => { cancelled = true; };
    }, [refreshGameCount]);


    async function handleAddGame(gameId: string, status: LibraryStatus) {
        if (!addedGames.has(gameId)) {
            // optimistic add
            setAddedGames(prev => new Set(prev).add(gameId));
            setStatusByGameId(prev => new Map(prev).set(gameId, status));
            try {
                const created: UserGameCreated = await addGame(gameId, status); // ← userId auto
                setIdByGameId(prev => new Map(prev).set(gameId, created._id));
                await refreshGameCount();
            } catch (err) {
                console.error('Add failed:', err);
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

    async function handleRemoveFromBrowse(gameId: string) {
        const userGameId = idByGameId.get(gameId);

        // optimistic local updates
        setAddedGames(prev => {
            const s = new Set(prev); s.delete(gameId); return s;
        });
        setIdByGameId(prev => {
            const m = new Map(prev); m.delete(gameId); return m;
        });
        setStatusByGameId(prev => {
            const m = new Map(prev); m.delete(gameId); return m;
        });

        if (!userGameId) return;

        try {
            await deleteGame(userGameId);
            await refreshGameCount();
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
                            open={openMenuGameId === g._id}
                            onOpenChange={(open) => setOpenMenuGameId(open ? g._id : null)}
                        />
                    );
                })}
            </div>
        </main>
    );
}
