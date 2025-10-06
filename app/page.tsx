'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getTopRatedGames,
  getLatestReleases,
  getUserGames,
  addGame,
  updateGameStatus,
  deleteGame,
  type Game,
  type LibraryStatus,
  type UserGameCreated,
  type LibraryItem,
} from '@/lib/api';
import GameCard from '@/components/game/GameCard';
import GameSearch from '@/components/game/GameSearch';
import { useGameContext } from '@/lib/GameContext';
import SkeletonGameCard from '@/components/game/SkeletonGameCard';


export default function HomePage() {
  // strips
  const [topRated, setTopRated] = useState<Game[]>([]);
  const [latest, setLatest] = useState<Game[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // library state (so buttons work)
  const [addedGames, setAddedGames] = useState<Set<string>>(new Set());
  const [idByGameId, setIdByGameId] = useState<Map<string, string>>(new Map());
  const [statusByGameId, setStatusByGameId] = useState<Map<string, LibraryStatus>>(new Map());
  const [openMenuGameId, setOpenMenuGameId] = useState<string | null>(null);

  const { refreshGameCount } = useGameContext();

  // fetch strips
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const top = await getTopRatedGames();
        if (!cancelled) setTopRated(top);
      } finally {
        if (!cancelled) setLoadingTop(false);
      }
    })();
    (async () => {
      try {
        const recent = await getLatestReleases();
        if (!cancelled) setLatest(recent);
      } finally {
        if (!cancelled) setLoadingLatest(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // load user library so cards know added/status
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lib: LibraryItem[] = await getUserGames();
        if (cancelled) return;
        setAddedGames(new Set(lib.map(i => i.gameId._id)));
        setIdByGameId(new Map(lib.map(i => [i.gameId._id, i._id])));
        setStatusByGameId(new Map(lib.map(i => [i.gameId._id, i.status as LibraryStatus])));
        await refreshGameCount();
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [refreshGameCount]);

  // handlers (same pattern as your other pages)
  async function handleAdd(gameId: string, status: LibraryStatus) {
    if (!addedGames.has(gameId)) {
      // optimistic add
      setAddedGames(prev => new Set(prev).add(gameId));
      setStatusByGameId(prev => new Map(prev).set(gameId, status));
      try {
        const created: UserGameCreated = await addGame(gameId, status);
        setIdByGameId(prev => new Map(prev).set(gameId, created._id));
        await refreshGameCount();
      } catch {
        // optional rollback
      }
      return;
    }
    // already added -> status change
    setStatusByGameId(prev => new Map(prev).set(gameId, status));
    const userGameId = idByGameId.get(gameId);
    if (userGameId) updateGameStatus(userGameId, status).catch(() => { });
  }

  async function handleUpdate(gameId: string, status: LibraryStatus) {
    if (openMenuGameId === gameId) setOpenMenuGameId(null);
    setStatusByGameId(prev => new Map(prev).set(gameId, status));
    const userGameId = idByGameId.get(gameId);
    if (userGameId) {
      try { await updateGameStatus(userGameId, status); } catch { }
    }
  }

  async function handleRemove(gameId: string) {
    const userGameId = idByGameId.get(gameId);
    // optimistic remove
    setAddedGames(prev => { const s = new Set(prev); s.delete(gameId); return s; });
    setIdByGameId(prev => { const m = new Map(prev); m.delete(gameId); return m; });
    setStatusByGameId(prev => { const m = new Map(prev); m.delete(gameId); return m; });
    if (!userGameId) return;
    try { await deleteGame(userGameId); await refreshGameCount(); } catch { }
  }

  return (
    <main className="p-6 font-sans bg-gray-50 min-h-screen mb-20">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome to Completed It Mate!</h1>
        <p className="text-gray-600 mb-6">Search for a game or browse the full library to get started.</p>
        <div className="flex justify-center mb-6">
          <GameSearch />
        </div>
        <Link
          href="/game-library"
          className="inline-block mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Browse all games
        </Link>
      </section>

      {/* Top Rated Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Top Rated (Metacritic)</h2>
        </div>

        <div className="flex gap-6  pb-2">
          {loadingTop ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 ">
                <SkeletonGameCard />
              </div>
            ))
          ) : (
            topRated.map(g => (
              <div key={g._id} className="flex-shrink-0">
                <GameCard
                  game={g}
                  isAdded={addedGames.has(g._id)}
                  currentStatus={statusByGameId.get(g._id)}
                  onAdd={(id, status) => handleAdd(id, status)}
                  onUpdate={addedGames.has(g._id) ? (id, status) => handleUpdate(id, status) : undefined}
                  onRemove={addedGames.has(g._id) ? id => handleRemove(id) : undefined}
                  open={openMenuGameId === g._id}
                  onOpenChange={open => setOpenMenuGameId(open ? g._id : null)}
                />
              </div>
            ))
          )}
        </div>
      </section>


      {/* Latest Releases Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Latest Releases</h2>
        </div>

        <div className="flex gap-6 pb-2">
          {loadingLatest ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <SkeletonGameCard />
              </div>
            ))
          ) : (
            latest.map(g => (
              <div key={g._id} className="flex-shrink-0">
                <GameCard
                  game={g}
                  isAdded={addedGames.has(g._id)}
                  currentStatus={statusByGameId.get(g._id)}
                  onAdd={(id, status) => handleAdd(id, status)}
                  onUpdate={addedGames.has(g._id) ? (id, status) => handleUpdate(id, status) : undefined}
                  onRemove={addedGames.has(g._id) ? id => handleRemove(id) : undefined}
                  open={openMenuGameId === g._id}
                  onOpenChange={open => setOpenMenuGameId(open ? g._id : null)}
                />
              </div>
            ))
          )}
        </div>
      </section>

    </main>
  );
}
