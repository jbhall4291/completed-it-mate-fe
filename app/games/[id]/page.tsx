// app/games/[id]/page.tsx
import { notFound } from 'next/navigation';
import { CalendarDays, Hourglass } from 'lucide-react';
import GameActions from '@/components/game/GameActions';
import { getGameDetail } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeRawg } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

export default async function GameDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const hardcodedUserId = '6890a2561ffcdd030b19c08c';
    const game = await getGameDetail(id, hardcodedUserId);
    if (!game) notFound();

    const cc = game.completedCount ?? 0;
    const release = game.releaseDate ? new Date(game.releaseDate) : null;
    const playtime = game.avgCompletionTime && game.avgCompletionTime > 0 ? game.avgCompletionTime : null;

    return (
        <>
            {/* Full-page background: image + black fade after ~500px */}
            <div
                aria-hidden
                className="fixed inset-0 -z-10 bg-top bg-cover bg-no-repeat pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0) 0px,
              rgba(0,0,0,0.55) 320px,
              rgba(0,0,0,0.85) 420px,
              #000 520px,
              #000 100%
            ),
            url(${game.imageUrl ?? '/placeholder.png'})
          `,
                }}
            />

            <main className="p-6 max-w-5xl mx-auto text-white">
                {/* top meta row (release + playtime) */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-200">
                    {release && (
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 opacity-80" />
                            <div>
                                {release.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>
                    )}
                    {playtime && (
                        <div className="flex items-center gap-2">
                            <Hourglass className="w-4 h-4 opacity-80" />
                            <div>{playtime}h avg</div>
                        </div>
                    )}
                </div>

                {/* user actions (same control used on cards) */}
                <div className="mt-4 relative z-10 w-[300px]">
                    <GameActions
                        gameId={game._id}
                        initialStatus={game.userStatus}
                        initialUserGameId={game.userGameId}
                    />

                </div>

                {/* Hero (title + chips) */}
                <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mt-4">
                    <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold">{game.title}</h1>
                        <div className="mt-2 flex flex-col gap-2 text-xs text-gray-300">
                            {!!game.parentPlatforms?.length && (
                                <div className="flex flex-wrap gap-2">
                                    {game.parentPlatforms.map((p) => (
                                        <Chip key={p} label={p} />
                                    ))}
                                </div>
                            )}
                            {!!game.genres?.length && (
                                <div className="flex flex-wrap gap-2">
                                    {game.genres.map((g) => (
                                        <Chip key={g} label={g} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Completed" value={`${cc}`} />
                    {playtime ? <Stat label="Avg Completion" value={`${playtime}h`} /> : null}
                    {release ? <Stat label="Released" value={String(release.getFullYear())} /> : null}
                    {game.metacritic?.score ? <Stat label="Metacritic" value={String(game.metacritic.score)} /> : null}
                </section>

                {/* Description */}
                {game.description ? (
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">About</h2>

                        <article
                            className="
        prose prose-invert max-w-none
        [&_:where(h3)]:mt-6 [&_:where(h3)]:mb-2 [&_:where(h3)]:font-semibold
        [&_:where(p)]:my-0 [&_:where(p)]:leading-7
        [&_:where(p+p)]:mt-2
      "
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {normalizeRawg(game.description)}
                            </ReactMarkdown>
                        </article>
                    </section>
                ) : null}

                {/* Screenshots */}
                {game.screenshots?.length ? (
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-3">Screenshots</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {game.screenshots.map((src, i) => (
                                <img
                                    key={`${src}-${i}`}
                                    src={src}
                                    alt={`${game.title} screenshot ${i + 1}`}
                                    className="h-40 w-auto rounded-lg object-cover flex-none"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ))}
                        </div>
                    </section>
                ) : null}

                {/* Dev/Publisher */}
                {(game.developers?.length || game.publishers?.length) && (
                    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {game.developers?.length ? (
                            <InfoBlock title="Developer">
                                {game.developers.map((d) => (
                                    <span key={d} className="mr-2 text-gray-200">
                                        {d}
                                    </span>
                                ))}
                            </InfoBlock>
                        ) : null}
                        {game.publishers?.length ? (
                            <InfoBlock title="Publisher">
                                {game.publishers.map((p) => (
                                    <span key={p} className="mr-2 text-gray-200">
                                        {p}
                                    </span>
                                ))}
                            </InfoBlock>
                        ) : null}
                    </section>
                )}

                {/* Store Links */}
                {game.storeLinks?.length ? (
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">Where to get it</h2>
                        <ul className="list-disc list-inside text-blue-300">
                            {game.storeLinks.map((link) => (
                                <li key={link.url}>
                                    <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline">
                                        {link.store}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </main>
        </>
    );
}

/* small presentational helpers */
function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-white/10 px-3 py-2">
            <div className="text-xs text-gray-300">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
        </div>
    );
}
function Chip({ label }: { label: string }) {
    return <span className="px-2 py-0.5 rounded bg-white/10">{label}</span>;
}
function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg bg-white/5 p-4">
            <div className="text-sm text-gray-400 mb-1">{title}</div>
            <div>{children}</div>
        </div>
    );
}
