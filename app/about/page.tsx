export default function AboutPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 text-white/80">
            <h1 className="text-3xl font-semibold mb-6">About Completed It Mate</h1>

            <p className="mb-4">
                Completed It Mate is a personal project built by{" "}
                <a
                    href="https://www.linkedin.com/in/johnny-hall-dev"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand hover:text-brand/80 underline-offset-2 hover:underline"
                >
                    Johnny Hall
                </a>
                . It’s a full-stack web app for tracking the games you own, play, and complete - designed and developed end-to-end as part of my professional portfolio.
            </p>

            <p className="mb-4">
                The project uses a modern stack (TypeScript, Next.js, Node.js, Express, and MongoDB) and
                integrates with the{" "}
                <a
                    href="https://api.rawg.io/docs/"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-white/60 hover:text-white/80 underline-offset-2 hover:underline"
                >
                    RAWG API
                </a>{" "}
                for game data. The frontend is built with the App Router, ShadCN UI, Tailwind CSS, and
                Framer Motion.
            </p>

            <p className="mb-4">
                Development followed a test-driven approach on the backend using Jest, and end-to-end
                scenarios were validated with Playwright. Continuous integration and deployment run through
                GitHub Actions, with automated code coverage reports to maintain quality before release.
            </p>

        </main>
    );
}
