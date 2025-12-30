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

        <main className="mx-auto w-full  px-4 py-10 flex flex-col gap-6">

            <article className="bg-[#242528] w-full mx-auto p-4 py-10 rounded-2xl">
                <div className=" max-w-prose mx-auto">
                    <h1 className="text-3xl font-bold text-white">
                        Developer Update: January 2026
                    </h1>
                    <p className="mt-2 text-sm text-white/60">Published Sep 30, 2025</p>

                    <div className="mt-8 space-y-6 text-white/90 leading-relaxed">
                        <p>
                            After several months of development and iteration, I’m now sharing <strong>Completed It Mate</strong> publicly for the first time.
                        </p>

                        <p>
                            Completed It Mate is a web app for tracking the games you own, play, and complete. Users can browse a large game catalogue, build a personal collection, and track play status without creating an account. Each visitor is assigned an anonymous profile tied to their browser, allowing progress and collection state to persist between visits while keeping the experience frictionless.
                        </p>

                        <p>The initial public build (v0.9) was completed in September 2025. Since then, the focus has been on stability, data quality, and ensuring the core experience works reliably end-to-end before making a broader announcement.</p>

                        <p>More recently, the project has begun introducing automation to keep content current over time. Background processes now handle data updates independently of user activity, helping ensure the site remains useful and accurate without requiring manual intervention.</p>

                        <p>This update marks the formal public introduction of the project — outlining why it was built, what it offers today, and the direction it will continue to evolve in.</p>

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
            </article>

            <article id="Sep_2025" className="bg-[#242528] scroll-mt-24 w-full mx-auto p-4 py-10 rounded-2xl">
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
            </article>
        </main>
    );
}
