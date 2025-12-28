// app/games/[id]/error.tsx
'use client';

export default function Error({
    error,
    reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="p-6 max-w-5xl mx-auto text-red-200">
            <h2 className="text-xl font-semibold">Something went wrong.</h2>
            <p className="mt-2 text-sm opacity-80">{error.message}</p>
            <button
                onClick={() => reset()}
                className="mt-4 rounded bg-red-600 px-3 py-1 "
            >
                Try again
            </button>
        </div>
    );
}
