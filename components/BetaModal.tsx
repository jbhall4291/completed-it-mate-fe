'use client';

import { useEffect, useState } from 'react';

const LS_KEY = 'clm_seen_beta_v1';
export const BETA_EVENT = 'clm:open-beta';

export default function BetaModal() {
    const [open, setOpen] = useState(false);

    // First run: show once per browser
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(LS_KEY)) setOpen(true);
    }, []);

    // Open on navbar badge click
    useEffect(() => {
        function handleOpen() { setOpen(true); }
        window.addEventListener(BETA_EVENT, handleOpen);
        return () => window.removeEventListener(BETA_EVENT, handleOpen);
    }, []);

    function dismiss(permanent: boolean) {
        if (permanent) localStorage.setItem(LS_KEY, '1');
        setOpen(false);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-background text-white border border-white/10 shadow-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold">Completed It Mate - In Development v0.9</h2>
                    <button
                        className="cursor-pointer rounded-md px-2 py-1 bg-white/10 hover:bg-white/20"
                        onClick={() => dismiss(false)}
                        aria-label="Close"
                    >✕</button>
                </div>

                <div className="px-5 py-4 space-y-4 text-sm text-white/90">
                    <p>
                        This app is under active development and things may change or break.
                        Your data is stored in an <strong>anonymous, per-browser account</strong>.
                    </p>

                    <div>
                        <h3 className="font-medium mb-1">What it does now</h3>
                        <ul className="list-disc pl-5 space-y-1 text-white/80">
                            <li>Browse all games with pagination.</li>
                            <li>Add to your library, set status (e.g., completed, in progress).</li>
                            <li>Data persists locally per browser (no sign-up).</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium mb-1">Likely additions</h3>
                        <ul className="list-disc pl-5 space-y-1 text-white/80">
                            <li>AI-generated suggestions based on your library.</li>
                            <li>Alerts when wishlisted games go on sale in digital marketplaces.</li>
                            <li>Social features with other users (compare, comment, follow, etc.).</li>
                            <li>Sync with your Steam, Epic, Xbox, and other libraries - including achievements.</li>
                            <li>Ongoing UI/UX refinement and performance improvements.</li>
                        </ul>
                    </div>

                    <p className="text-white/70">
                        Feedback welcome. Follow along on my portfolio:
                        {' '}
                        <a
                            href="https://johnnyhall.dev"
                            target="_blank"
                            className="underline hover:opacity-90"
                            rel="noreferrer"
                        >
                            johnnyhall.dev
                        </a>
                    </p>
                </div>

                <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                        className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                        onClick={() => dismiss(false)}
                    >
                        Close
                    </button>
                    <button
                        className="cursor-pointer px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600"
                        onClick={() => dismiss(true)}
                    >
                        Don’t show again
                    </button>
                </div>
            </div>
        </div>
    );
}
