'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import ErrorImg from "@/public/500.png";
import Image from "next/image";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // optional: log the error
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
            <Image
                src={ErrorImg}
                alt="404 Not Found"
                width={1600}
                height={800}
                className="mb-6 select-none"
                priority
            />
            <p className="mt-2 text-white/70">Something went wrong with the server - maybe it got hit by a blue shell?</p>

            <Link
                href="/"
                className="mt-6 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
                Back to home
            </Link>
        </main>
    );
}
