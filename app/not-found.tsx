import NotFoundImg from "@/public/404.png";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
            <Image
                src={NotFoundImg}
                alt="404 Not Found"
                width={1600}
                height={800}
                className="mb-6 select-none"
                priority
            />
            <p className="mt-2 ">
                The page you’re looking for doesn’t exist - or maybe it’s in another castle.
            </p>
            <Link
                href="/"
                className="mt-6 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
                Back to home
            </Link>
        </main>
    );
}
