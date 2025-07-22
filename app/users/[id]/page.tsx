'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getUser, User } from '../../../lib/api';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // unwrap the params Promise
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getUser(id);
                setUser(userData);
            } catch (err) {
                console.error(`Error fetching user ${id}:`, err);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold text-blue-600">Loading User...</h1>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold text-red-600">User Not Found</h1>
                <Link href="/users" className="text-blue-500 underline mt-4 block">
                    Back to Users
                </Link>
            </main>
        );
    }

    return (
        <main className="p-6 font-sans bg-gray-50 min-h-screen">
            <Link href="/users" className="text-blue-500 underline mb-6 block">
                ← Back to Users
            </Link>

            <h1 className="text-3xl font-bold text-blue-600 mb-4">
                {user.username}&apos;s Details
            </h1>
            <p className="text-gray-600 mb-6">Email: {user.email}</p>

            <h2 className="text-xl font-semibold mb-4">Games Owned</h2>
            {user.gamesOwned.length > 0 ? (
                <ul className="space-y-3">
                    {user.gamesOwned.map((g) => (
                        <li
                            key={g._id}
                            className="p-3 bg-white shadow rounded text-gray-700"
                        >
                            {g.title} <span className="text-gray-500">({g.platform})</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No games found for this user.</p>
            )}
        </main>
    );
}
