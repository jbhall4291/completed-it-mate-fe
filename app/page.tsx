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
import EmblaRow from '@/components/EmblaRow';



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
    <main className="p-6 font-sans  min-h-screen mb-20">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl font-bold ">Welcome to Completed It Mate!</h1>
        <p className=" mb-6">Search for a game or browse the full library to get started.</p>
        <div className="flex justify-center mb-6">
          <GameSearch />
        </div>
        <Link
          href="/game-library"
          className="inline-block mt-4 px-6 py-2 bg-green-500 rounded-lg shadow hover:bg-green-700 transition"
        >
          Browse all games
        </Link>
      </section>

      {/* Top Rated Section */}
      <section className="mb-12">

        <EmblaRow
          options={{ align: "start", containScroll: "trimSnaps", loop: true, dragFree: false }}

          title="Top Rated (Metacritic)"
          items={topRated}
          loading={loadingTop}
          skeleton={<SkeletonGameCard />}
          renderItem={(g) => (
            <GameCard
              game={g}
              isAdded={addedGames.has(g._id)}
              currentStatus={statusByGameId.get(g._id)}
              onAdd={(id, status) => handleAdd(id, status)}
              onUpdate={addedGames.has(g._id) ? (id, s) => handleUpdate(id, s) : undefined}
              onRemove={addedGames.has(g._id) ? (id) => handleRemove(id) : undefined}
              open={openMenuGameId === g._id}
              onOpenChange={(open) => setOpenMenuGameId(open ? g._id : null)}
            />
          )}
        />
      </section>


      {/* Latest Releases Section */}
      <EmblaRow
        options={{ align: "start", containScroll: "trimSnaps", loop: true, dragFree: false }}
        title="Latest Releases"
        items={latest}
        loading={loadingLatest}
        skeleton={<SkeletonGameCard />}
        basisClass="basis-[16rem] md:basis-[18rem]" // a bit narrower if you want
        renderItem={(g) => (
          <GameCard
            game={g}
            isAdded={addedGames.has(g._id)}
            currentStatus={statusByGameId.get(g._id)}
            onAdd={(id, status) => handleAdd(id, status)}
            onUpdate={addedGames.has(g._id) ? (id, s) => handleUpdate(id, s) : undefined}
            onRemove={addedGames.has(g._id) ? (id) => handleRemove(id) : undefined}
            open={openMenuGameId === g._id}
            onOpenChange={(open) => setOpenMenuGameId(open ? g._id : null)}
          />
        )}
      />

    </main>
  );
}
