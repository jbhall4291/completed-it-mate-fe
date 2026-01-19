"use client";

import Link from "next/link";

// TODO: extract updates into data-driven source once cadence increases

export default function DeveloperUpdateCard() {
    return (
        <section
            aria-label="Development update"
            className="relative w-fit overflow-hidden    transition-colors flex flex-col gap-y-4"
        >
            <Link
                href="/updates/"
                className="block px-5 md:px-8 py-5 bg-[#242528] rounded-lg  "
            >
                <div className=" max-w-3xl">


                    <h3 className="text-base md:text-lg font-semibold text-white sm:text-2xl">
                        Completed It Mate is now publicly available
                    </h3>

                    <p className="mt-1 text-sm text-white/80 leading-relaxed max-w-3xl">
                        After several months of development and iteration <strong>Completed It Mate</strong> is now being shared publicly for the first time.
                    </p>


                    <div className="flex flex-row justify-between mt-4 text-sm max-w-3xl">
                        <span className="inline-flex items-center gap-1  font-medium text-green-500 transition-opacity">
                            Read full update →
                        </span>

                        <span>Published Jan 2026</span>

                    </div>
                </div>
            </Link>

            {/* <Link
                href="/updates#Sep_2025"
                className="block p-5  md:p-7 bg-[#242528] rounded-lg"
            >
                <div className="mx-auto  max-w-3xl">


                    <h3 className="mt-3 text-lg font-bold text-white sm:text-2xl">
                        Completed It Mate updated!
                    </h3>

                    <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-3xl">
                        <strong>Completed It Mate v0.9</strong> represents the first complete build of the application. The core experience is implemented end-to-end, allowing users to browse a large game catalogue...
                    </p>

                    <div className="flex flex-row justify-between mt-4 text-sm max-w-3xl">
                        <span className="inline-flex items-center gap-1  font-medium text-green-500 transition-opacity">
                            Read full update →
                        </span>

                        <span>Published Sep 2025</span>

                    </div>
                </div>
            </Link> */}
        </section>
    );
}
