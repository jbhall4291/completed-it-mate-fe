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
            <CommunityTotalsCard snapshot={data.snapshot} />
        </section>
    );
}

function CommunityTotalsCard({ snapshot }: { snapshot: CommunitySnapshot }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">Totals</CardTitle>
                <CardDescription>Quick stats</CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-3 pt-4">
                <Stat
                    icon={<Trophy className="h-10 w-10 text-yellow-400" />}
                    label="Games completed"
                    value={snapshot.totalCompletions}
                />

                <Stat
                    icon={<Users className="h-10 w-10 text-green-400" />}
                    label="Players"
                    value={snapshot.players}
                />

                <Stat
                    icon={<LibraryBig className="h-10 w-10 text-blue-400" />}
                    label="Games tracked"
                    value={snapshot.gamesInLibraries}
                />

                <Stat
                    icon={<Tags className="h-10 w-10 text-purple-400" />}
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
                    className="text-2xl font-semibold leading-tight truncate"
                    title={typeof value === "string" ? value : undefined}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}
