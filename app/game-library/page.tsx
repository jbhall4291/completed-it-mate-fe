'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    getUserGames,
    addGame,
    updateGameStatus,
    deleteGame,
    fetchGamesPaged,         // ⬅️ NEW: paged fetch
    type Game,
    type UserGameCreated,
    type LibraryStatus,
} from '@/lib/api';
import { useGameContext } from '@/lib/GameContext';
import GameCard from '@/components/game/GameCard';
import SkeletonCard from '@/components/game/SkeletonGameCard';

const USER_READY_EVENT = 'clm:user-ready';

export default function GamesPage() {
    // --- games (paged) ---
    const [games, setGames] = useState<Game[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(24);
    const totalPages = useMemo(() => Math.max(Math.ceil(total / pageSize), 1), [total, pageSize]);

    // --- user library state (unchanged) ---
    const [addedGames, setAddedGames] = useState<Set<string>>(new Set());         // gameId -> in library
    const [idByGameId, setIdByGameId] = useState<Map<string, string>>(new Map()); // gameId -> userGameId
    const [statusByGameId, setStatusByGameId] = useState<Map<string, LibraryStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);

    const { refreshGameCount } = useGameContext();

    // 1) Load the games list whenever page/pageSize changes
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchGamesPaged({ page, pageSize });
                if (!cancelled) {
                    setGames(data.items);
                    setTotal(data.total);
                }
            } catch (err) {
                console.error('Error loading games:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [page, pageSize]);

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
            <main className="p-6 font-sans  min-h-screen">
                <h1 className="text-3xl font-bold  mb-6">All Games</h1>
                <div className="flex flex-wrap gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="p-6 font-sans  min-h-screen">
            <div className="flex items-end justify-between mb-6 gap-3">
                <h1 className="text-3xl font-bold ">All Games</h1>

                {/* Page size selector (minimal) */}
                <label className="flex items-center gap-2 text-sm">
                    <span className="">Per page</span>
                    <select
                        className=" bg-white text-background border border-gray-300 rounded-md px-2 py-1"
                        value={pageSize}
                        onChange={e => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
                    >
                        {[12, 24, 36, 48].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </label>
            </div>

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

            {/* Empty state */}
            {games.length === 0 && (
                <div className="text-center  py-10">Nothing found.</div>
            )}

            {/* Pagination (compact, inline) */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                onJump={(p) => setPage(p)}
            />
        </main>
    );
}

/* --- tiny local pagination helper --- */
function Pagination({
    page,
    totalPages,
    onPrev,
    onNext,
    onJump,
}: {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onJump: (p: number) => void;
}) {
    if (totalPages <= 1) return null;
    const range = calcRange(page, totalPages);

    return (
        <nav className="mt-8 flex items-center justify-center gap-1 " aria-label="Pagination">
            <button
                className="px-3 py-1.5 rounded-md bg-white border  border-gray-300 disabled:opacity-50"
                onClick={onPrev}
                disabled={page <= 1}
            >
                Prev
            </button>

            {range.map((item, i) =>
                item === '…' ? (
                    <span key={`e-${i}`} className="px-2 ">…</span>
                ) : (
                    <button
                        key={item}
                        aria-current={item === page ? 'page' : undefined}
                        className={` px-3 py-1.5 rounded-md border ${item === page ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        onClick={() => onJump(item)}
                    >
                        {item}
                    </button>
                )
            )}

            <button
                className="px-3 py-1.5 rounded-md bg-white border  border-gray-300 disabled:opacity-50"
                onClick={onNext}
                disabled={page >= totalPages}
            >
                Next
            </button>
        </nav>
    );
}

function calcRange(page: number, total: number) {
    const show = new Set<number>([1, total, page]);
    for (let d = 1; d <= 2; d++) { show.add(page - d); show.add(page + d); }
    const ordered = [...show].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

    const withEllipses: (number | '…')[] = [];
    for (let i = 0; i < ordered.length; i++) {
        const curr = ordered[i];
        const prev = ordered[i - 1];
        if (i && curr - (prev ?? 0) > 1) withEllipses.push('…');
        withEllipses.push(curr);
    }
    return withEllipses;
}
