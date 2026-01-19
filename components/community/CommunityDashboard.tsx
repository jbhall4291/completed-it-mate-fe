"use client";

import { useEffect, useState } from "react";
import { getCommunityDashboard, CommunityDashboardResponse } from "@/lib/api";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Trophy, Users, LibraryBig, Tags } from "lucide-react";
import type { CommunitySnapshot } from "@/lib/api";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label, LabelList } from "recharts";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts";
import Link from "next/link";



export default function CommunityDashboard() {
    const [data, setData] = useState<CommunityDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await getCommunityDashboard();
                setData(res);
            } catch (err) {
                console.error("Failed to load community dashboard", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    if (loading) {
        return <div>Loading community stats…</div>;
    }

    if (!data) return null;

    return (
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CommunityCompletionCard snapshot={data.snapshot} />
            <CommunityTotalsCard snapshot={data.snapshot} />
            <MostCompletedGamesCard games={data.mostCompletedGames} />
        </section>
    );
}

function CommunityTotalsCard({ snapshot }: { snapshot: CommunitySnapshot }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Totals</CardTitle>
                <CardDescription>Quick stats for games across all collections</CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-3 pt-4">
                <Stat
                    icon={<Trophy className="h-10 w-10 text-yellow-400" />}
                    label="Completed"
                    value={snapshot.totalCompletions}
                />

                <Stat
                    icon={<Users className="h-10 w-10 text-orange-400" />}
                    label="Players"
                    value={snapshot.players}
                />

                <Stat
                    icon={<LibraryBig className="h-10 w-10 text-blue-400" />}
                    label="Tracked"
                    value={snapshot.gamesInLibraries}
                />

                <Stat
                    icon={<Tags className="h-10 w-10 text-pink-400" />}
                    label="Top genre"
                    value={snapshot.mostPopularGenre?.name ?? "—"}
                />
            </CardContent>
        </Card>
    );
}

function Stat({
    label,
    value,
    icon,
}: {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3 overflow-hidden">
            {icon && <div className="shrink-0 opacity-90">{icon}</div>}
            <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div
                    className="text-lg md:text-2xl font-semibold leading-tight truncate"
                    title={typeof value === "string" ? value : undefined}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

function CommunityCompletionCard({ snapshot }: { snapshot: CommunitySnapshot }) {
    const completed = snapshot.totalCompletions;
    const total = snapshot.gamesInLibraries;
    const pct = snapshot.completionRatePct;

    const remaining = Math.max(total - completed, 0);

    const data = [
        { key: "completed", value: completed, fill: "var(--chart-5)" },
        { key: "remaining", value: remaining, fill: "rgba(255,255,255,0.08)" },
    ];

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Community Completion</CardTitle>
                <CardDescription>Completed games across all users</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                {total === 0 ? (
                    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                        No games tracked yet.
                    </div>
                ) : (
                    <ChartContainer
                        config={{
                            completed: { label: "Completed", color: "var(--chart-5)" },
                            remaining: { label: "Remaining", color: "rgba(255,255,255,0.08)" },
                            value: { label: "Games" },
                        }}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
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
                                {data.map(d => (
                                    <Cell key={d.key} fill={d.fill} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan className="fill-foreground text-3xl font-bold">
                                                    {pct}%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-white/70 text-sm"
                                                >
                                                    Completion
                                                </tspan>
                                            </text>
                                        );
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

function MostCompletedGamesCard({
    games,
}: {
    games: {
        gameId: string;
        title: string;
        completionCount: number;
    }[];
}) {
    if (!games.length) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="pb-0">
                    <CardTitle className="text-base">Most Completed Games</CardTitle>
                    <CardDescription>No completions yet</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Most Completed Games</CardTitle>
                <CardDescription>Across all users</CardDescription>
            </CardHeader>

            <CardContent className="">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                        data={games}
                        layout="vertical"
                        margin={{ left: 12, right: 24 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            type="category"
                            dataKey="title"
                            width={180}
                            tick={({
                                x,
                                y,
                                payload,
                            }: {
                                x?: number
                                y?: number
                                payload?: { value: string }
                            }) => {
                                if (!payload?.value || x == null || y == null) {
                                    return <g />
                                }

                                const game = games.find(g => g.title === payload.value)
                                if (!game) {
                                    return <g />
                                }

                                return (
                                    <foreignObject
                                        x={x - 180}
                                        y={y - 14}
                                        width={170}
                                        height={40}
                                    >
                                        <Link
                                            href={`/games/${game.gameId}`}
                                            title={game.title}
                                            className="block text-sm leading-snug text-white/90 hover:underline line-clamp-2"
                                        >
                                            {game.title}
                                        </Link>
                                    </foreignObject>
                                )
                            }}
                        />

                        <Bar
                            dataKey="completionCount"
                            radius={[6, 6, 6, 6]}
                            fill="var(--chart-5)"
                        >
                            <LabelList
                                dataKey="completionCount"
                                position="right"
                                className="fill-white/70 text-sm"
                            />
                        </Bar>

                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}