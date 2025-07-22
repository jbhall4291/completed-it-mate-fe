'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser } from '../lib/api';

export default function Navbar() {
    const [gameCount, setGameCount] = useState<number>(0);
    const hardcodedUserId = '687bd767e7f8c28253f33359'; // same user as before

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await getUser(hardcodedUserId);
                setGameCount(user.gamesOwned.length);
            } catch (err) {
                console.error('Failed to fetch user for navbar badge:', err);
            }
        }

        fetchUser();
    }, []);

    return (
        <nav className="bg-black text-white p-4 shadow">
            <div className="max-w-8xl mx-auto flex items-center justify-between">
                <Link href="/">
                    <img src="/logo-large.jpg" className="h-24" alt="Logo" />
                </Link>

                <ul className="flex space-x-6">
                    <li className="relative">
                        <Link href="/library" className="hover:underline flex items-center space-x-2">
                            <span>My Library</span>
                            {gameCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                    {gameCount}
                                </span>
                            )}
                        </Link>
                    </li>

                    <li>
                        <Link href="/games" className="hover:underline">
                            Browse Games
                        </Link>
                    </li>

                    <li>
                        <Link href="/users" className="hover:underline">
                            View Users
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
