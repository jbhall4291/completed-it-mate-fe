'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsers, User } from '../../lib/api';

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
            <main className="p-6 font-sans">
                <h1 className="text-3xl font-bold text-blue-600">Loading Users...</h1>
            </main>
        );
    }

    return (
        <main className="p-6 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">All Users</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-black">
                {users.map((u) => (
                    <Link
                        key={u._id}
                        href={`/users/${u._id}`}
                        className="p-4 bg-white rounded-lg shadow border border-gray-300 hover:shadow-lg transition block"
                    >
                        <h2 className="text-lg font-semibold">{u.username}</h2>
                        <p className="text-gray-500 text-sm">{u.email}</p>
                        <p>DEBUG ID: {u._id}</p>
                        <p className="mt-2 text-gray-600">
                            Games Owned: {u.gameCount}
                        </p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
