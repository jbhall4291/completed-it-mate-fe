// components/Navbar.tsx
"use client";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-white/10 py-8 text-sm text-white/60">
            <div className="mx-auto max-w-5xl px-4">
                {/* Primary line – personal credit */}
                <div className="flex flex-col  justify-between gap-3 sm:flex-row">

                    <div>
                        <div> © {new Date().getFullYear()} Completed It Mate</div>
                        <div>Built by{" "}<a
                            href="https://www.linkedin.com/in/johnny-hall-dev"
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand hover:text-brand/80 underline-offset-2 hover:underline"
                        >
                            Johnny Hall
                        </a></div>
                        <div><a
                            href="https://johnnyhall.dev"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-brand underline-offset-2 hover:underline"
                        >
                            johnnyhall.dev
                        </a></div>
                    </div>


                    <nav className="flex gap-4 items-center md:items-start">
                        <a href="/about" className="hover:text-brand">About</a>
                        <a
                            href="https://github.com/jbhall4291"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-brand"
                        >
                            GitHub
                        </a>
                    </nav>
                </div>

                <p className="mt-3 text-xs text-white/40 sm:text-left">
                    Some game data and images sourced from third-party providers, including{" "}
                    <a
                        href="https://api.rawg.io/docs/"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-white/50 hover:text-white/70 underline-offset-2 hover:underline"
                    >
                        RAWG
                    </a>{" "}
                    and Metacritic.
                </p>




            </div>
        </footer>
    );
}
