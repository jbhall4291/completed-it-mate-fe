export default function SeptemberUpdatePage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-3xl font-bold text-white">
                Developer Update: September 2025
            </h1>
            <p className="mt-2 text-sm text-white/60">Published Sep 30, 2025</p>

            <div className="mt-8 space-y-6 text-white/90 leading-relaxed">
                <p>
                    <strong>Completed It Mate</strong> is now live on the web - version 0.9
                    marks its first public release. The app is fully functional and ready
                    for anyone to try: you can browse and search thousands of games,
                    add them to your own library, and track what you’ve completed, what
                    you’re playing, and what’s still on your list.
                </p>

                <p>
                    Each visitor automatically gets an anonymous profile tied to their
                    browser, meaning your library and progress persist between visits
                    without the need to sign up or log in. It’s a simple way to jump
                    straight in and start using the app as intended.
                </p>

                <h2 className="text-xl font-semibold mt-10 text-white">Current features</h2>
                <ul className="list-disc pl-6 space-y-1 text-white/80">
                    <li>Browse the full game library with pagination and platform filters</li>
                    <li>Add or remove titles from your personal library</li>
                    <li>Set a status for each game - Completed, Playing, Wishlist, etc.</li>
                    <li>See completion data from other users</li>
                    <li>Fully responsive interface designed for both desktop and mobile</li>
                </ul>

                <h2 className="text-xl font-semibold mt-10 text-white">What’s next</h2>
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
        </main>
    );
}
