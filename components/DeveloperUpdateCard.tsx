"use client";

import Link from "next/link";

// TODO: extract updates into data-driven source once cadence increases

export default function DeveloperUpdateCard() {
    return (
        <section
            aria-label="Development update"
            className="relative w-full overflow-hidden    transition-colors flex flex-col gap-y-4"
        >
            <Link
                href="/updates/"
                className="block p-5 sm:p-6 md:p-7 bg-[#242528] rounded-2xl  "
            >
                <div className="mx-auto  max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500 bg-green-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        PUBLIC LAUNCH
                    </span>

                    <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                        Completed It Mate is now publicly available
                    </h3>

                    <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-3xl">
                        After several months of development and iteration <strong>Completed It Mate v0.91</strong> is now being shared publicly for the first time. The core functionality is implemented end-to-end, allowing users to browse and search thousands of games, add them to a personal collection, and track play status.

                        This post introduces the project, explains why it was built, and highlights what’s been added since the initial build.
                    </p>


                    <div className="flex flex-row justify-between mt-4 text-sm max-w-3xl">
                        <span className="inline-flex items-center gap-1  font-medium text-green-500 transition-opacity">
                            Read full update →
                        </span>

                        <span>Published Jan 2026</span>

                    </div>
                </div>
            </Link>

            <Link
                href="/updates#Sep_2025"
                className="block p-5 sm:p-6 md:p-7 bg-[#242528] rounded-2xl"
            >
                <div className="mx-auto  max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500 bg-green-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Version 0.9 - Initial Public Build
                    </span>

                    <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                        Completed It Mate — Project Status (v0.9)
                    </h3>

                    <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-3xl">
                        <strong>Completed It Mate v0.9</strong> represents the first complete public build of the application. The core experience is implemented end-to-end, allowing users to browse a large game catalogue, build a personal collection, and track play status — all without requiring an account.

                        This update outlines the current feature set and the direction of future development as the project continues to evolve.
                    </p>


                    <div className="flex flex-row justify-between mt-4 text-sm max-w-3xl">
                        <span className="inline-flex items-center gap-1  font-medium text-green-500 transition-opacity">
                            Read full update →
                        </span>

                        <span>Published Sep 2025</span>

                    </div>
                </div>
            </Link>
        </section>
    );
}
