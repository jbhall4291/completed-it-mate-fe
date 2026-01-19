"use client";

import { useEffect, useState } from "react";
import { getUsers, User } from "@/lib/api";
import SkeletonUserCard from "@/components/user/SkeletonUserCard";
import { Trophy, UserRound } from "lucide-react";
import { useUser } from "@/lib/UserContext";

function getAvatarLabel(username: string | null) {
    if (!username) return null;
    return username[0].toUpperCase();
}

function formatJoined(createdAt: string) {
    if (!createdAt) return null;

    const date = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 7) return "Just joined";

    return `Joined ${date.toLocaleString("en-GB", {
        month: "short",
        year: "numeric",
    })}`;
}

export default function RecentUsers() {
    const { me } = useUser();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const userList = await getUsers();

                const filtered = userList.filter(u =>
                    u.completedCount > 0 ||
                    (u.username && u.username !== "Anonymous Player")
                );

                setUsers(filtered);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <section>
                <h2 className="text-2xl font-bold mb-4">Recent Users</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonUserCard key={i} />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Recent Users</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 md:gap-y-3">
                {users.map((u) => {
                    const isMe =
                        Boolean(me?.username) &&
                        Boolean(u.username) &&
                        me?.username === u.username &&
                        me?.username !== "Anonymous Player";

                    const avatarLabel = getAvatarLabel(u.username);
                    const hasUsername = Boolean(u.username);

                    return (
                        <div
                            key={u.username ?? `anon-${u.createdAt}`}
                            className={`px-5 py-4 bg-[#242528] rounded-lg transition text-[#fafafa]
                                ${isMe && "ring-2 ring-green-600/80"}
                            `}
                        >
                            <div className="flex items-center gap-x-5">
                                {/* Avatar */}
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-2xl
                                        ${hasUsername ? "bg-brand" : "bg-[#3a3b3e]"}
                                    `}
                                >
                                    {avatarLabel ? (
                                        avatarLabel
                                    ) : (
                                        <span className="text-[#fafafa]">
                                            <UserRound strokeWidth={2.75} />
                                        </span>
                                    )}
                                </div>

                                {/* User info */}
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-semibold flex items-baseline gap-x-1.5">
                                        {u.username ?? "Anonymous Player"}
                                        {isMe && (
                                            <span className="text-sm text-brand">(You)</span>
                                        )}
                                    </h3>

                                    <div className="text-base">
                                        {u.completedCount > 0 ? (
                                            <div className="flex gap-x-1 items-center">
                                                <Trophy className="h-4 w-4 text-yellow-500/90" />
                                                <p>
                                                    Completed {u.completedCount} game
                                                    {u.completedCount > 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        ) : (
                                            <p>No completions yet</p>
                                        )}
                                    </div>

                                    <p className="text-sm">{formatJoined(u.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
