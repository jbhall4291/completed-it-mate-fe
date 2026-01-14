// components/stats/CollectionDashboard.tsx
"use client";

import * as React from "react";
import { PieChart, Pie, Label, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trophy, LibraryBig, Gamepad2, Heart } from "lucide-react";

import type { LibraryItem, LibraryStatus } from "@/lib/api";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

const LABEL: Record<LibraryStatus, string> = {
    completed: "Completed",
    owned: "Owned",
    playing: "In Progress",
    wishlist: "Wishlist",
};
const COLOR: Record<LibraryStatus, string> = {
    completed: "var(--chart-1, #22c55e)",
    owned: "var(--chart-2, #60a5fa)",
    playing: "var(--chart-3, #f59e0b)",
    wishlist: "var(--chart-5, #94a3b8)",
};


// ---- Genre typing helpers (no 'any') ----
type GenreAtom = string | { name?: string; slug?: string } | null | undefined;

const toGenreName = (v: GenreAtom) =>
    typeof v === "string" ? v : v?.name ?? v?.slug ?? "";

// safe prop getter without 'any'
function getProp(obj: unknown, key: string): unknown {
    if (obj && typeof obj === "object" && key in (obj as Record<string, unknown>)) {
        return (obj as Record<string, unknown>)[key];
    }
    return undefined;
}


function readGenresFrom(obj: unknown): GenreAtom[] {
    if (!obj || typeof obj !== "object") return [];
    const maybeArr = (obj as { genres?: unknown }).genres;
    return Array.isArray(maybeArr) ? (maybeArr as GenreAtom[]) : [];
}


function extractGenresFromItem(it: unknown): string[] {
    const raw: GenreAtom[] = [
        ...readGenresFrom(it),
        ...readGenresFrom(getProp(it, "game")),
        ...readGenresFrom(getProp(it, "gameId")),
    ];

    const names = raw.map(toGenreName).filter((s): s is string => Boolean(s));
    return Array.from(new Set(names)); // dedupe
}



function buildGenreBuckets(items: LibraryItem[], topN = 6) {
    const counts = new Map<string, number>();

    for (const it of items) {
        const names = extractGenresFromItem(it);
        for (const name of names) {
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }
    }

    const rows = [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    if (rows.length <= topN) return rows;
    const head = rows.slice(0, topN);
    const tail = rows.slice(topN).reduce((s, r) => s + r.count, 0);

    return [...head, { name: "Other", count: tail }];
}


function useStatusCounts(items: LibraryItem[]) {
    return React.useMemo(() => {
        const counts = { completed: 0, owned: 0, playing: 0, backlog: 0, wishlist: 0 } as Record<
            LibraryStatus,
            number
        >;
        for (const it of items) counts[it.status] = (counts[it.status] ?? 0) + 1;
        //const total = items.length;
        const completed = counts.completed;
        const ownedTotal =
            counts.owned + counts.playing + counts.completed;

        const pct = ownedTotal
            ? Math.round((completed / ownedTotal) * 100)
            : 0;


        const pie = (Object.keys(counts) as LibraryStatus[])
            .map((k) => ({ key: k, label: LABEL[k], value: counts[k], fill: COLOR[k] }))
            .filter((d) => d.value > 0);

        return { counts, ownedTotal, completed, pct, pie };
    }, [items]);
}



const completionChartConfig: ChartConfig = {
    completed: { label: "Completed", color: "var(--chart-5)" },
    remaining: { label: "Remaining", color: "rgba(255,255,255,0.08)" },
    value: { label: "Games" },
};

function CompletionRateDonut({
    completed,
    total,
    pct,
}: {
    completed: number;
    total: number;
    pct: number;
}) {
    const remaining = Math.max(total - completed, 0);
    const data = [
        { key: "completed", value: completed, fill: "var(--chart-5)" },
        { key: "remaining", value: remaining, fill: "rgba(255,255,255,0.08)" },
    ];

    return (
        <ChartContainer config={completionChartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="key"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={5}
                    cornerRadius={6}
                    isAnimationActive
                    animationBegin={150}
                    animationDuration={900}
                    animationEasing="ease-out"
                >
                    {data.map((d) => (
                        <Cell key={d.key} fill={d.fill} />
                    ))}
                    <Label
                        content={({ viewBox }) => {
                            if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                            return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan className="fill-foreground text-3xl font-bold">{pct}%</tspan>
                                    <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-white/70 text-sm "
                                    >
                                        Completed
                                    </tspan>
                                </text>
                            );
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}



export function CollectionStatusDashboard({ items }: { items: LibraryItem[] }) {
    const { ownedTotal, completed, pct, pie } = useStatusCounts(items);
    const [genreActiveIdx, setGenreActiveIdx] = React.useState(0);

    return (
        <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Completion rate */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Completion Rate</CardTitle>
                        <CardDescription>Completed vs Owned</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {ownedTotal === 0 ? (
                            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                                No games owned yet.
                            </div>
                        ) : (
                            <CompletionRateDonut completed={completed} total={ownedTotal} pct={pct} />
                        )}
                    </CardContent>
                </Card>

                {/* Totals */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Totals</CardTitle>
                        <CardDescription>Quick stats</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 pt-4">
                        <Stat
                            icon={<Trophy className="h-10 w-10 text-yellow-400" />}
                            label="Completed"
                            value={completed}
                        />
                        <Stat
                            icon={<Gamepad2 className="h-10 w-10 text-orange-400" />}
                            label="In Progress"
                            value={pie.find((p) => p.key === "playing")?.value ?? 0}
                        />
                        <Stat
                            icon={<LibraryBig className="h-10 w-10 text-blue-400" />}
                            label="Backlog"
                            value={pie.find((p) => p.key === "owned")?.value ?? 0}
                        />
                        <Stat
                            icon={<Heart className="h-10 w-10 text-pink-400" />}
                            label="Wishlist"
                            value={pie.find((p) => p.key === "wishlist")?.value ?? 0}
                        />
                    </CardContent>
                </Card>

                {/* Genres */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">Top Genres</CardTitle>
                        <CardDescription>Your collection’s mix</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {(() => {
                            const data = buildGenreBuckets(items, 6);
                            const total = data.reduce((s, d) => s + d.count, 0);
                            if (!total) {
                                return (
                                    <div className="flex h-[220px] items-center justify-center">
                                        <p className="text-sm text-muted-foreground">No genre data yet.</p>
                                    </div>
                                );
                            }

                            const colors = [
                                "var(--chart-1)",
                                "var(--chart-2)",
                                "var(--chart-3)",
                                "var(--chart-4)",
                                "var(--chart-5)",


                            ];

                            const chartData = data.map((d, i) => ({
                                genre: d.name,
                                count: d.count,
                                fill: colors[i % colors.length],
                            }));

                            const chartConfig = chartData.reduce((acc, d, i) => {
                                acc[d.genre] = { label: d.genre, color: colors[i % colors.length] };
                                acc.count = { label: "Games" };
                                return acc;
                            }, {} as ChartConfig);

                            return (
                                <>
                                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                                        <PieChart>
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Pie
                                                isAnimationActive
                                                animationBegin={200}
                                                animationDuration={800}
                                                animationEasing="ease-out"
                                                data={chartData}
                                                dataKey="count"
                                                nameKey="genre"
                                                innerRadius={20}
                                                outerRadius={80}
                                                strokeWidth={2}
                                                onMouseEnter={(_, i) => setGenreActiveIdx(i)}
                                                activeIndex={genreActiveIdx}
                                            >
                                                {chartData.map((entry) => (
                                                    <Cell key={entry.genre} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>

                                    {/* Chip legend */}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {chartData.map((d, i) => (
                                            <span
                                                key={d.genre}
                                                className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs ${i === genreActiveIdx ? "bg-white/10" : "bg-white/5"
                                                    }`}
                                            >
                                                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
                                                {d.genre}
                                                <span className="opacity-70">· {d.count}</span>
                                            </span>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

function Stat({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3">
            {icon && <div className="shrink-0 opacity-90">{icon}</div>}
            <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-2xl font-semibold leading-none">{value}</div>
            </div>
        </div>
    );
}