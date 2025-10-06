'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchGames, type Game as ApiGame } from '@/lib/api';

// (optional) tiny inline debounce
function useDebounced<T>(value: T, delay = 250): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function PlatformChips({ slugs = [] as string[] }) {
    const uniq = Array.from(new Set(slugs));
    if (!uniq.length) return null;
    return (
        <div className="flex items-center gap-1">
            {uniq.map((p) => (
                <span
                    key={p}
                    className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700"
                    title={p}
                >
                    {p}
                </span>
            ))}
        </div>
    );
}

export default function GameSearch() {
    const [q, setQ] = useState('');
    const debouncedQ = useDebounced(q, 250);
    const [results, setResults] = useState<ApiGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    useEffect(() => {
        const term = debouncedQ.trim();
        if (term.length < 2) {
            setResults([]);
            setLoading(false);
            setErrorText(null);
            return;
        }
        const ctrl = new AbortController();
        setLoading(true);
        setErrorText(null);

        searchGames(term, ctrl.signal)
            .then(setResults)
            .catch(() => setErrorText('Search failed'))
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, [debouncedQ]);

    return (
        <div className="w-full max-w-xl text-black">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type at least 2 letters…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search games"
            />

            {loading && <div className="mt-2 text-sm text-gray-500">Searching…</div>}
            {errorText && <div className="mt-2 text-sm text-red-600">{errorText}</div>}

            {!loading && !errorText && results.length > 0 && (
                <ul className="mt-3 divide-y rounded-md border bg-white" role="listbox" aria-label="Search results">
                    {results.slice(0, 10).map((g) => {
                        const href = `/games/${g.slug ?? g._id}`; // works with idOrSlug backend
                        return (
                            <li key={g._id} role="option">
                                <Link
                                    href={href}
                                    className="p-3 flex gap-3 items-center hover:bg-gray-50 focus:bg-gray-50 focus:outline-none block"
                                >
                                    {g.imageUrl && (
                                        <img
                                            src={g.imageUrl}
                                            alt=""
                                            className="h-10 w-10 rounded object-cover flex-none"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <div className="font-medium truncate">{g.title}</div>
                                        <div className="mt-0.5 text-xs text-gray-500">
                                            <PlatformChips slugs={g.parentPlatforms ?? []} />
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {!loading && !errorText && q.trim().length >= 2 && results.length === 0 && (
                <div className="mt-3 text-sm text-gray-500">No matches.</div>
            )}

        </div>
    );
}
