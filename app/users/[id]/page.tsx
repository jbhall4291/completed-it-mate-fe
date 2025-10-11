'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getUser, getUserGames, type User, type LibraryItem } from '@/lib/api';

export default function UserDetailPage() {
    // ✅ type the route params instead of casting later
    const { id } = useParams<{ id: string }>();

    // ✅ if the API sometimes omits gameCount, reflect that in the local state type
    type UserMaybeCount = Omit<User, 'gameCount'> & { gameCount?: number };
    const [user, setUser] = useState<UserMaybeCount | null>(null);

    const [library, setLibrary] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const [u, lib] = await Promise.all([getUser(id), getUserGames(id)]);
                setUser(u);       // ok even if gameCount is missing at runtime
                setLibrary(lib);
            } catch (err) {
                console.error(`Error fetching user ${id}:`, err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold ">Loading User...</h1>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold text-red-600">User Not Found</h1>
                <Link href="/users" className=" underline mt-4 block">
                    Back to Users
                </Link>
            </main>
        );
    }

    // ✅ no `any`; simple fallback if API didn’t send gameCount
    const gameCount = user.gameCount ?? library.length;

    return (
        <main className="p-6 font-sans bg-gray-50 min-h-screen">
            <Link href="/users" className=" underline mb-6 block">
                ← Back to Users
            </Link>

            <h1 className="text-3xl font-bold text-blue-600 mb-2">
                {user.username}&apos;s Details
            </h1>

            <h2 className="text-xl font-semibold mb-2">Games Owned ({gameCount})</h2>
            {library.length ? (
                <ul className="space-y-3">
                    {library.map(item => (
                        <li key={item._id} className="p-3 bg-white shadow rounded text-gray-700">
                            {item.gameId.title}{' '}
                            <span className="text-gray-500">
                                ({item.gameId.parentPlatforms?.join(', ') || '—'})
                            </span>
                            <span className="ml-2 text-sm text-gray-500">Status: {item.status}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No games found for this user.</p>
            )}
        </main>
    );
}
