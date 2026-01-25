// app/games/[id]/page.tsx
import { notFound } from "next/navigation";
import { Trophy, CalendarDays, Crown, Hourglass } from "lucide-react";
import MetacriticIcon from "@/components/icons/MetacriticIcon";
import GameActions from "@/components/game/GameActions";
import { getGameDetail } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeRawg } from "@/lib/markdown";
import GameScreenshots from '@/components/game/GameScreenshots';


export const dynamic = 'force-dynamic';

export default async function GameDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params;

    const game = await getGameDetail(id);
    if (!game) notFound();

    const cc = game.completedCount ?? 0;
    const release = game.releaseDate ? new Date(game.releaseDate) : null;
    const playtime = game.avgCompletionTime && game.avgCompletionTime > 0 ? game.avgCompletionTime : null;

    return (
        <>
            {/* Full-page background: image + black fade after ~500px */}
            <section
                className="
                        relative w-screen left-1/2 right-1/2 -mx-[50vw] 
                        h-[clamp(240px,38vh,520px)] xl:h-[min(52vh,680px)] 2xl:h-[min(60vh,760px)]
                        -mt-[60px] lg:-mt-[116px]
                        "
            >
                {/* Background image container with max width */}
                <div className="absolute inset-0 flex justify-center bg-[#1e1e20]" aria-hidden>
                    <div
                        className="w-full h-full max-w-[1326px] bg-top bg-cover bg-no-repeat"
                        style={{
                            backgroundImage: `url(${game.imageUrl ?? "/placeholder.png"})`,
                        }}
                    />
                </div>

                {/* Gradient overlay across full viewport width */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(30,30,32,0) 0%, rgba(30,30,32,0.55) 55%, rgba(30,30,32,0.85) 75%, #1e1e20 92%, #1e1e20 100%)",
                    }}
                    aria-hidden
                />
            </section>

            <main className="px-6 pb-6  max-w-5xl mx-auto">
                {/* Hero (title + chips) */}

                <div className="flex flex-col md:flex-row gap-x-6 gap-y-1 md:gap-y-1.5 md:items-center mb-5">

                    <h1 className="text-3xl md:text-4xl font-extrabold">{game.title}</h1>

                    {/* user actions (same control used on cards) */}
                    <div className=" relative z-10 mt-1.5 md:mt-0 w-[300px]">
                        <GameActions
                            gameId={game._id}
                            initialStatus={game.userStatus}
                            initialUserGameId={game.userGameId}
                        />

                    </div>
                </div>

                <div className="mt-2 flex flex-col gap-2 text-xs ">
                    {!!game.parentPlatforms?.length && (
                        <div className="flex flex-wrap gap-2">
                            {game.parentPlatforms.map((p) => (
                                <Chip key={p} label={p.toUpperCase()} />
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


                {/* Stats */}
                <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Users Completed" value={`${cc}`} icon={Trophy} />
                    {playtime ? (
                        <Stat label="Average Playtime" value={`${playtime} hrs`} icon={Hourglass} />
                    ) : null}
                    {release ? (
                        <Stat
                            label="Released"
                            value={String(release.getFullYear())}
                            icon={CalendarDays}
                        />
                    ) : null}
                    {game.metacritic?.score ? (
                        <Stat
                            label="Metacritic Score"
                            value={String(game.metacritic.score)}
                            icon={MetacriticIcon}
                        />
                    ) : null}
                </section>


                {/* Description */}
                {game.description ? (
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold mb-2">About</h2>

                        <article
                            className="
        prose prose-invert max-w-none
        [&_:where(h3)]:mt-6 [&_:where(h3)]:mb-2 [&_:where(h3)]:font-semibold
        [&_:where(p)]:my-0 [&_:where(p)]:leading-5.5
        [&_:where(p+p)]:mt-2
      "
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {normalizeRawg(game.description)}
                            </ReactMarkdown>
                        </article>
                    </section>
                ) : null}

                {game.screenshots?.length ? <GameScreenshots shots={game.screenshots} /> : null}


                {/* Dev/Publisher */}
                {!!(game.developers?.length || game.publishers?.length) && (

                    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {game.developers?.length ? (
                            <InfoBlock title="Developer">
                                {game.developers.map((d) => (
                                    <span key={d} className="mr-2 ">
                                        {d}
                                    </span>
                                ))}
                            </InfoBlock>
                        ) : null}
                        {game.publishers?.length ? (
                            <InfoBlock title="Publisher">
                                {game.publishers.map((p) => (
                                    <span key={p} className="mr-2 ">
                                        {p}
                                    </span>
                                ))}
                            </InfoBlock>
                        ) : null}
                    </section>
                )}

                {/* Store Links */}
                {/* {game.storeLinks?.length ? (
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
                ) : null} */}

            </main>
        </>
    );
}

/* small presentational helpers */



function Stat({
    label,
    value,
    icon: Icon,
    iconClassName,
}: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    iconClassName?: string;
}) {
    return (
        <div className="rounded-lg bg-white/10 px-3 py-2 flex items-center gap-1 md:gap-2">
            {Icon && <Icon className={`w-7 md:w-8 h-7 md:h-8 shrink-0 mr-1 ${iconClassName ?? "opacity-80"}`} />}
            <div>
                <div className="text-xs">{label}</div>
                <div className="text-lg font-semibold leading-none mt-0.5">{value}</div>
            </div>
        </div>
    );
}




function Chip({ label }: { label: string }) {
    return <span className="px-2 py-0.5 rounded bg-white/10">{label}</span>;
}
function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg bg-white/5 p-4">
            <div className="text-sm  mb-1">{title}</div>
            <div>{children}</div>
        </div>
    );
}
