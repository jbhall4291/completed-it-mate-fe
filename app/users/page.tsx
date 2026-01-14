'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsers, User } from '@/lib/api';
import SkeletonUserCard from '@/components/user/SkeletonUserCard';
import { UserRound } from 'lucide-react';

function getAvatarLabel(username: string | null) {
    if (!username) return null;
    return username[0].toUpperCase();
}

function formatJoined(createdAt: string) {
    if (!createdAt) return null;

    const date = new Date(createdAt);
    const now = new Date();

    const diffDays =
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 7) return 'Just joined';

    return `Joined ${date.toLocaleString('en-GB', {
        month: 'short',
        year: 'numeric',
    })}`;
}


export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const userList = await getUsers();
                setUsers(userList);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <main className="p-6 font-sans  min-h-screen">
                <h1 className="text-3xl font-bold mb-6">Recent Players</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-background">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonUserCard key={i} />
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="p-6 font-sans  min-h-screen">
            <h1 className="text-3xl font-bold  mb-6">Recent Players</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-background">
                {users.map((u) => {
                    const avatarLabel = getAvatarLabel(u.username);
                    const hasUsername = Boolean(u.username);


                    return (
                        <div
                            key={u._id}
                            className="px-5 py-4 bg-[#242528] rounded-lg  transition text-[#fafafa]"
                        >
                            <div className="flex items-center gap-x-5">

                                {/* Avatar */}
                                <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-2xl
                                        ${hasUsername ? 'bg-green-500' : 'bg-[#3a3b3e]'}`}
                                >
                                    {avatarLabel ? avatarLabel : (
                                        <span className="text-[#fafafa]">
                                            <UserRound strokeWidth={2.75} />
                                        </span>
                                    )}
                                </div>

                                {/* User info */}
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-semibold">
                                        {u.username ?? 'Anonymous Player'}
                                    </h2>




                                    <p className="text-base">
                                        {u.gameCount > 0
                                            ? `Completed ${u.gameCount} game${u.gameCount > 1 ? 's' : ''}`
                                            : 'No games yet'}
                                    </p>

                                    <p className="text-sm">{formatJoined(u.createdAt)}</p>


                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>
        </main>
    );
}
