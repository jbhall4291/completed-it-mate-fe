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
import BrandLogo from '@/components/layout/BrandLogo';
import DeveloperUpdateCard from '@/components/DeveloperUpdateCard';



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
    <>
      {/* Full-page background: top glow + fade to base, just like detail page */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] pointer-events-none">
        {/* gradients */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
        linear-gradient(
          to bottom,
          rgba(30,30,32,0) 0px,
          rgba(30,30,32,0.55) 320px,
          rgba(30,30,32,0.85) 420px,
          var(--background) 520px,
          var(--background) 100%
        ),
        radial-gradient(
          60% 40% at 50% 0%,
          rgba(90,197,88,0.22) 0px,
          rgba(90,197,88,0.18) 80px,
          rgba(90,197,88,0.12) 160px,
          rgba(90,197,88,0.08) 240px,
          rgba(90,197,88,0.04) 320px,
          rgba(90,197,88,0) 420px
        )
      `,
          }}
        />
        {/* noise (prevents banding) */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
          }}
        />
      </div>







      <main className="p-4 font-sans min-h-screen mb-20">
        {/* Hero */}
        <section className="mx-auto flex flex-col pt-10 pb-10 items-center text-center">
          <div className="mb-4">
            <BrandLogo />
            <p className="px-10 mt-2 text-base text-white/70 md:text-xl">
              Keep track of the games you own, play, and complete.
            </p>
          </div>
        </section>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">
            Search for a game to add, or{" "}
            <Link
              href="/game-library"
              className="underline underline-offset-2 hover:text-green-500 transition"
            >
              browse the full library
            </Link>.
          </h2>

          <div className="mb-12 w-full">
            <GameSearch />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-2">Latest News</h2>
          <DeveloperUpdateCard />
        </div>

        {/* Top Rated */}
        <section className="mb-12">

          {/* Latest Releases */}
          <EmblaRow
            options={{ align: "start", containScroll: "trimSnaps", loop: true, dragFree: false }}
            title="Latest Releases"
            items={latest}
            loading={loadingLatest}
            skeleton={<SkeletonGameCard />}
            basisClass="basis-[16rem] md:basis-[18rem]"
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

        <EmblaRow
          options={{ align: "start", containScroll: "trimSnaps", loop: true, dragFree: false }}
          title="Top Rated"
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
      </main>
    </>
  );
}