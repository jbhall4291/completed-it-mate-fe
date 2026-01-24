"use client";

import { useEffect } from "react";

export default function UpdatePage() {
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const el = document.getElementById(hash.slice(1));
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    return (

        <main className="mx-auto w-full  px-4 py-6 ">
            <h1 className="text-3xl font-bold  mb-4">Latest News</h1>
            <article className="bg-[#242528] w-full mx-auto p-4 py-10 rounded-2xl flex flex-col gap-6">
                <div className=" max-w-prose mx-auto">
                    <h1 className="text-2xl font-semibold text-white">
                        Developer Update: January 2026
                    </h1>
                    <p className="mt-2 text-sm text-white/60">Published Jan 18, 2026</p>

                    <div className="mt-8  text-white/90 leading-relaxed">
                        <p>After of months of part-time development and iteration, I’m sharing <strong>Completed It Mate</strong> publicly for the first time.</p>
                        <br />
                        <p>
                            Completed It Mate is a web app for tracking the games you own, play, and complete. You can browse a large game catalogue, build a personal collection, and track play status — all without creating an account.
                        </p>
                        <br />
                        <p>Each visitor is assigned an anonymous profile tied to their browser, allowing progress and collection state to persist between visits while keeping the experience frictionless — particularly as a portfolio showcase, where visitors can explore the product without sign-up or email confirmation steps.</p>
                        <br />
                        <p>The initial public build (v0.9) was completed in September 2025. Since then, the focus has been on stability, data quality, and ensuring the core experience works reliably end-to-end before making a broader announcement.</p>
                        <br />
                        <p>More recently, background processes have been introduced to keep the game catalogue and supporting data up to date automatically, ensuring the site remains accurate and useful over time without manual intervention.</p>
                        <br />
                        <p>This update marks the formal public introduction of the project — outlining what it offers today and the direction it will continue to evolve.</p>
                        <br />
                        <h2 className="text-xl font-semibold  text-white">Current features</h2>
                        <ul className="list-disc pl-6 space-y-1 text-white/80">
                            <li>Browse the full game library with pagination and platform filters</li>
                            <li>Build a personal collection and update play status (Completed, Playing, Wishlist, etc.)</li>
                            <li>View aggregate completion data from other users</li>
                            <li>Fully responsive interface for desktop and mobile</li>
                        </ul>
                        <br />
                        <h2 className="text-xl font-semibold text-white">Future plans</h2>
                        <ul className="list-disc pl-6 space-y-1 text-white/80">
                            <li>Optional accounts for syncing across devices</li>
                            <li>Social features (compare libraries, follow users, comments)</li>
                            <li>Notifications for wishlisted game sales</li>
                            <li>AI-powered game recommendations</li>
                            <li>Ongoing UI, accessibility, and performance improvements</li>
                        </ul>
                        <br />
                        <p>
                            This version represents the core experience - everything that makes{" "}
                            <strong>Completed It Mate</strong> useful on day one. The next stage is
                            about connection and polish: letting players discover new games,
                            share their progress, and enjoy a smoother, smarter experience as the
                            platform evolves.
                        </p>
                        <br />
                        <p className=" text-white">
                            <div className="font-semibold">Feedback is always welcome.</div> You can follow development updates and other
                            projects at{" "}
                            <a
                                href="https://johnnyhall.dev"
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:opacity-90"
                            >
                                johnnyhall.dev
                            </a>.
                        </p>
                    </div>
                </div>
            </article>

            {/* <article id="Sep_2025" className="bg-[#242528] scroll-mt-24 w-full mx-auto p-4 py-10 rounded-2xl">
                <div className=" max-w-prose mx-auto">
                    <h1 className="text-3xl font-bold text-white">
                        Developer Update: September 2025
                    </h1>
                    <p className="mt-2 text-sm text-white/60">Published Sep 30, 2025</p>

                    <div className="mt-8 space-y-6 text-white/90 leading-relaxed">
                        <p>
                            <strong>Completed It Mate</strong> is now live on the web - version 0.9
                            marks its first public release. The app is fully functional and ready
                            for anyone to try: you can browse and search thousands of games,
                            add them to your own collection, and track what you’ve completed, what
                            you’re playing, and what’s still on your list.
                        </p>

                        <p>
                            Each visitor automatically gets an anonymous profile tied to their
                            browser, meaning your collection and progress persist between visits
                            without the need to sign up or log in. It’s a simple way to jump
                            straight in and start using the app as intended.
                        </p>

                        <h2 className="text-xl font-semibold mt-10 text-white">Current features</h2>
                        <ul className="list-disc pl-6 space-y-1 text-white/80">
                            <li>Browse the full game library with pagination and platform filters</li>
                            <li>Add or remove titles from your personal collection</li>
                            <li>Set a status for each game - Completed, Playing, Wishlist, etc.</li>
                            <li>See completion data from other users</li>
                            <li>Fully responsive interface designed for both desktop and mobile</li>
                        </ul>

                        <h2 className="text-xl font-semibold mt-10 text-white">Future plans</h2>
                        <ul className="list-disc pl-6 space-y-1 text-white/80">
                            <li>Optional account system for syncing across devices</li>
                            <li>Social features - compare libraries, comment, and follow others</li>
                            <li>Notifications when wishlisted titles go on sale</li>
                            <li>AI-powered game suggestions based on what you’ve played</li>
                            <li>Ongoing UI, accessibility, and performance refinements</li>
                        </ul>

                        <p>
                            This version represents the core experience - everything that makes{" "}
                            <strong>Completed It Mate</strong> useful on day one. The next stage is
                            about connection and polish: letting players discover new games,
                            share their progress, and enjoy a smoother, smarter experience as the
                            platform evolves.
                        </p>

                        <p className="pt-4 text-white/70">
                            Feedback is welcome. You can follow development updates and other
                            projects at{" "}
                            <a
                                href="https://johnnyhall.dev"
                                target="_blank"
                                rel="noreferrer"
                                className="underline hover:opacity-90"
                            >
                                johnnyhall.dev
                            </a>.
                        </p>
                    </div>
                </div>
            </article> */}
        </main>
    );
}
