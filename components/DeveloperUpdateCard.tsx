"use client";

import Link from "next/link";

export default function DeveloperUpdateCard() {
    return (
        <section
            aria-label="Development update"
            className="relative w-full overflow-hidden rounded-2xl  bg-[#242528]  transition-colors"
        >
            <Link
                href="/updates/"
                className="block p-5 sm:p-6 md:p-7"
            >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500 bg-green-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Version 0.9 · Now Live
                </span>

                <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                    Developer Update: September 2025
                </h3>

                <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-3xl">
                    <strong>Completed It Mate</strong> is now live on the web (v0.9).
                    You can browse and search thousands of games, add them to your library,
                    and track what you’ve played or completed - no sign-up required.
                    The app’s in active development, with new features on the way.
                </p>

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-500 transition-opacity">
                    Read full update →
                </span>



            </Link>
        </section>
    );
}
