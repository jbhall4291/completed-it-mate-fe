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
import { toGameCardViewModel } from '@/lib/gameCard';
import Image from 'next/image';


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
        <section className="relative mx-auto mb-8 flex items-center justify-center min-h-[310px] md:min-h-[360px] text-center">

          {/* Background wrapper */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {/* Background image */}
            <Image
              src="/hero_bg.webp"
              alt=""
              fill
              preload
              sizes="100vw"
              className="object-cover brightness-90 blur-xs md:blur-sm"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/65 md:bg-black/60" />
          </div>


          {/* Content */}
          <div className="relative z-10 flex flex-col items-center translate-y-[2px]">
            <BrandLogo />
            <p className="px-10 mt-3 text-base font-semibold text-white/90 md:text-white/85 md:text-xl w-[350px] md:w-full">
              Keep track of the games you own, play, and complete.
            </p>

            <div className="flex flex-col mt-6 md:mt-10 items-center">
              <div className="w-[300px] md:w-[400px]">
                <GameSearch />
              </div>
              <Link
                href="/game-library"
                className="underline underline-offset-2 hover:text-brand transition duration-300 w-fit text-base mt-2 font-normal"
              >
                or browse the full library
              </Link>
            </div>
          </div>
        </section>



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
            renderItem={(g) => {
              const game = toGameCardViewModel(g, {
                isInLibrary: addedGames.has(g._id),
                userStatus: statusByGameId.get(g._id),
                userGameId: idByGameId.get(g._id),
              });

              return (
                <GameCard
                  game={game}
                  onAdd={handleAdd}
                  onUpdate={game.isInLibrary ? handleUpdate : undefined}
                  onRemove={game.isInLibrary ? handleRemove : undefined}
                  open={openMenuGameId === game.id}
                  onOpenChange={(open) => setOpenMenuGameId(open ? game.id : null)}
                />
              );
            }
            }
          />
        </section>

        <EmblaRow
          options={{ align: "start", containScroll: "trimSnaps", loop: true, dragFree: false }}
          title="Top Rated (All Time)"
          items={topRated}
          loading={loadingTop}
          skeleton={<SkeletonGameCard />}
          basisClass="basis-[16rem] md:basis-[18rem]"
          renderItem={(g) => {
            const game = toGameCardViewModel(g, {
              isInLibrary: addedGames.has(g._id),
              userStatus: statusByGameId.get(g._id),
              userGameId: idByGameId.get(g._id),
            });

            return (
              <GameCard
                game={game}
                onAdd={handleAdd}
                onUpdate={game.isInLibrary ? handleUpdate : undefined}
                onRemove={game.isInLibrary ? handleRemove : undefined}
                open={openMenuGameId === game.id}
                onOpenChange={(open) => setOpenMenuGameId(open ? game.id : null)}
              />
            );
          }
          }
        />
      </main>
    </>
  );
}