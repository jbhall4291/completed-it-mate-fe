'use client';

import Link from 'next/link';
import { useGameContext } from '@/lib/GameContext';
import { BETA_EVENT } from '@/components/BetaModal';

// optional: import { useEffect } from 'react';

export default function Navbar() {
    const { gameCount } = useGameContext();

    return (
        <nav className="bg-[#1d1d1f] text-white p-4 shadow">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/">
                    <img src="/logo.png" className="h-24" alt="Logo" />
                </Link>


                <button onClick={() => window.dispatchEvent(new CustomEvent(BETA_EVENT))}
                    className="cursor-pointer bg-white text-red-600 border-2 font-bold border-red-600 px-3 py-1 rounded-full">
                    BETA • In Development
                </button>

                <ul className="flex space-x-6">
                    <li className="relative">
                        <Link href="/user-library" className="hover:underline flex items-center space-x-2">
                            <span>My Library</span>
                            {gameCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                    {gameCount}
                                </span>
                            )}
                        </Link>
                    </li>

                    <li>
                        <Link href="/game-library" className="hover:underline">
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
