'use client';

import { useEffect, useRef, useState } from 'react';
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
    const uniq = Array.from(new Set(slugs)); // remove duplicates
    if (!uniq.length) return null;

    const visible = uniq.slice(0, 5);
    const remaining = uniq.length - visible.length;

    return (
        <div className="flex items-center gap-1 text-foreground" title={uniq.join(', ')}>
            {visible.map((p) => (
                <span
                    key={p}
                    className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-white/10 capitalize"
                >
                    {p}
                </span>
            ))}
            {remaining > 0 && (
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-white/10">
                    +{remaining}
                </span>
            )}
        </div>
    );
}

export default function GameSearch() {
    const [q, setQ] = useState('');
    const debouncedQ = useDebounced(q, 250);
    const [results, setResults] = useState<ApiGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const showOverlay = open && q.trim().length >= 2; // render overlay for all states once typing

    return (
        <div ref={containerRef} className="relative w-full max-w-[640px]">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder="Type at least 2 letters…"
                className="w-full rounded-md border px-3 py-3 shadow-sm outline-none focus:border-green-400/60 focus:ring-2 focus:ring-green-400/60"
                aria-label="Search games"
                aria-expanded={showOverlay}
                aria-controls="game-search-results"
            />

            {showOverlay && (
                <ul
                    id="game-search-results"
                    role="listbox"
                    aria-label="Search results"
                    className="
            absolute left-0 right-0 top-full mt-2 z-50
            max-h-96 overflow-auto
            rounded-md border bg-background/95 backdrop-blur
            shadow-xl divide-y
          "
                >
                    {loading && (
                        <li className="p-3 text-sm text-white/70 select-none">Searching…</li>
                    )}
                    {!loading && errorText && (
                        <li className="p-3 text-sm text-red-500 select-none">{errorText}</li>
                    )}
                    {!loading && !errorText && results.length === 0 && (
                        <li className="p-3 text-sm text-white/70 italic select-none">No matches</li>
                    )}
                    {!loading && !errorText && results.length > 0 &&
                        results.map((g) => {
                            const href = `/games/${g.slug ?? g._id}`;
                            return (
                                <li key={g._id} role="option">
                                    <Link
                                        href={href}
                                        onClick={() => setOpen(false)}
                                        className="p-3 flex gap-3 items-center hover:bg-green-500/70 focus:bg-green-500/70 focus:outline-none"
                                    >
                                        {g.imageUrl && (
                                            <img src={g.imageUrl} alt="" className="h-10 w-10 rounded object-cover flex-none" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{g.title}</div>
                                            <div className="mt-0.5 text-xs">
                                                <PlatformChips slugs={g.parentPlatforms ?? []} />
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            )}
        </div>
    );
}
