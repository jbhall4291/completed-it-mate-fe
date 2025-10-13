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
    getGameFacets,
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

    const [q, setQ] = useState("");              // search
    const [platform, setPlatform] = useState(""); // single-select today
    const [genre, setGenre] = useState("");

    const [sort, setSort] = useState<'metacritic-desc' | 'released-desc' | 'title-asc' | 'title-desc'>('metacritic-desc');

    const [facets, setFacets] = useState<{ platforms: any[], genres: any[], yearMin: number, yearMax: number } | null>(null);

    useEffect(() => { getGameFacets().then(setFacets).catch(console.error); }, []);

    type YearPreset = "any" | "last-1" | "last-3" | "last-5" | "last-10" | "1990s" | "2000s" | "2010s" | "2020s";
    const [yearPreset, setYearPreset] = useState<YearPreset>("last-10");
    const [yearMin, setYearMin] = useState<string>(""); // keep for API call
    const [yearMax, setYearMax] = useState<string>("");

    const { refreshGameCount } = useGameContext();

    const INITIALS = {
        q: "",
        platform: "",
        genre: "",
        yearPreset: "last-10" as YearPreset,
        yearMin: "",
        yearMax: "",
        sort: "metacritic-desc" as const,
    };

    function clearAll() {
        setQ(INITIALS.q);
        setPlatform(INITIALS.platform);
        setGenre(INITIALS.genre);
        setSort(INITIALS.sort);
        setYearPreset(INITIALS.yearPreset);
        setYearMin(INITIALS.yearMin);
        setYearMax(INITIALS.yearMax);
        setPage(1);
    }

    const isDirty =
        q !== INITIALS.q ||
        platform !== INITIALS.platform ||
        genre !== INITIALS.genre ||
        sort !== INITIALS.sort ||
        yearMin !== INITIALS.yearMin ||
        yearMax !== INITIALS.yearMax;

    function applyPreset(p: YearPreset) {
        const now = new Date().getFullYear();
        const setRange = (min?: number, max?: number) => {
            setYearMin(min ? String(min) : "");
            setYearMax(max ? String(max) : "");
            setPage(1);
        };
        setYearPreset(p);
        if (p === "any") return setRange();
        if (p === "last-1") return setRange(now - 1, now);
        if (p === "last-3") return setRange(now - 3, now);
        if (p === "last-5") return setRange(now - 5, now);
        if (p === "last-10") return setRange(now - 10, now);
        if (p === "1990s") return setRange(1990, 1999);
        if (p === "2000s") return setRange(2000, 2009);
        if (p === "2010s") return setRange(2010, 2019);
        if (p === "2020s") return setRange(2020, now);
    }

    // load when page/pageSize or filters change
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchGamesPaged({
                    page,
                    pageSize,
                    // prefer q, but keep titleQuery populated if you want legacy parity
                    q: q || undefined,
                    // map to arrays only if non-empty
                    platforms: platform ? [platform] : undefined,
                    genres: genre ? [genre] : undefined,
                    // simple range (skip discrete years for now)
                    yearMin: yearMin ? parseInt(yearMin, 10) : undefined,
                    yearMax: yearMax ? parseInt(yearMax, 10) : undefined,
                    sort, // defaults to metacritic-desc
                });
                if (!cancelled) {
                    setGames(data.items);
                    setTotal(data.total);
                }
            } catch (err) {
                console.error('Error loading games:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [page, pageSize, q, platform, genre, yearMin, yearMax, sort]);

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
                <h1 className="text-3xl font-bold  mb-6">Browse Library</h1>
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
            <h1 className="text-3xl font-bold">Browse Library <span className="text-sm opacity-70">{total.toLocaleString()} results</span></h1>


            {/* Sticky filter bar */}
            <section className=" z-10  bg-background/80 backdrop-blur mb-4 ">
                <div className=" w-full  py-3 grid  space-y-3.5">

                    {/* Row 1: Search */}
                    <div className="flex items-center gap-2">
                        {/* your search input */}
                        <input
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            placeholder="Search titles..."
                            className="h-9 w-full md:max-w-[580px] rounded-md border border-white/10 bg-transparent px-3 text-sm"
                        />

                    </div>

                    {/* Row 2: Filters */}
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ">
                        {/* Platform */}
                        <select className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm "
                            value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }}>
                            <option value="">Any platform</option>
                            {facets?.platforms?.map(p => <option key={p.value} value={p.value}>{p.value}</option>)}
                        </select>

                        {/* Genre */}
                        <select className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm"
                            value={genre} onChange={e => { setGenre(e.target.value); setPage(1); }}>
                            <option value="">Any Genre</option>
                            {facets?.genres?.map(g => <option key={g.value} value={g.value}>{g.value}</option>)}
                        </select>

                        {/* Year preset (your new single control) */}
                        <select className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm"
                            value={yearPreset} onChange={e => applyPreset(e.target.value as any)}>
                            <option value="any">Any time</option>
                            <option value="last-1">Last 12 months</option>
                            <option value="last-3">Last 3 years</option>
                            <option value="last-5">Last 5 years</option>
                            <option value="last-10">Last 10 years</option>
                            <option value="1990s">1990s</option>
                            <option value="2000s">2000s</option>
                            <option value="2010s">2010s</option>
                            <option value="2020s">2020s</option>
                        </select>

                        {/* (Optional) another quick filter slot or leave empty */}
                        <div className="hidden lg:block" />
                    </div>

                    {/* Row 3: Sort + Per page (+ result count) */}
                    <div className="flex flex-wrap items-center justify-start gap-4">


                        <select className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm"
                            value={sort} onChange={e => { setSort(e.target.value as any); setPage(1); }}>
                            <option value="metacritic-desc">Highest Rated</option>
                            <option value="released-desc">Newest releases</option>
                            <option value="title-asc">Title A–Z</option>
                            <option value="title-desc">Title Z–A</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                            <span>Per Page</span>
                            <select className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-sm"
                                value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
                                {[12, 24, 36, 48].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </label>

                    </div>

                    <div className="flex flex-wrap items-center justify-start gap-4">



                        {/* Clear filters (active/inactive already wired) */}
                        <button
                            className="h-9 rounded-md border border-white/10 px-3 text-sm disabled:opacity-20 bg-red-400"
                            onClick={clearAll}
                            disabled={!isDirty}
                        >
                            Clear filters
                        </button>
                    </div>

                </div>
            </section>









            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
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
