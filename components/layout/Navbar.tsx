// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
// import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { cn } from "@/lib/utils";
// import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { getMe } from '@/lib/api';
import { UserRound } from 'lucide-react';

import BrandLogo from "./BrandLogo";


const nav = [
    { label: "My Collection", href: "/user-library" },
    { label: "Browse Library", href: "/game-library" },
    { label: "Community", href: "/users" },
    { label: "Updates", href: "/updates" },
    { label: "My Profile (Beta)", href: "/profile" },

];

export default function Navbar() {

    const [open, setOpen] = useState(false);
    const [me, setMe] = useState<{ userId: string; username?: string } | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onHash = () => setOpen(false);
        window.addEventListener("keydown", onKey);
        window.addEventListener("hashchange", onHash);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("hashchange", onHash);
        };
    }, []);

    const pathname = usePathname();

    function isActive(pathname: string, href: string) {
        if (href === "/") return pathname === "/";
        // highlight parent on subroutes, ignore query
        return pathname === href || pathname.startsWith(href + "/");
    }

    const hasUsername = Boolean(me?.username);
    const avatarLabel = me?.username?.[0]?.toUpperCase() ?? null;

    useEffect(() => {
        let cancelled = false;

        async function fetchMe() {
            try {
                const user = await getMe();
                if (!cancelled) setMe(user);
            } catch {
                if (!cancelled) setMe(null);
            }
        }

        fetchMe();

        const handler = () => fetchMe();
        window.addEventListener('clm:user-ready', handler);

        return () => {
            cancelled = true;
            window.removeEventListener('clm:user-ready', handler);
        };
    }, []);


    return (
        <div className="fixed top-4 md:top-6 inset-x-0 z-50 will-change-transform">
            <div className="mx-auto max-w-[700px] px-4">
                <motion.div
                    initial={false}
                    animate={{}}
                    className="relative rounded-3xl overflow-hidden bg-zinc-700/50 backdrop-blur-sm pl-4 pr-2 md:pl-4 md:pr-4   py-2 "
                >


                    {/* default always visible nav */}
                    <div className="relative z-10 h-12 flex items-center font-semibold ">


                        <Link href="/"
                            onClick={() => setOpen(false)}
                            aria-label="Completed It Mate – Home"
                            className="inline-flex items-center gap-1.5   hover:opacity-80 transition-opacity duration-300  ">

                            <div className="flex h-10 w-10 aspect-square items-center justify-center rounded-full bg-green-600 ">
                                <svg
                                    className={cn(
                                        "text-yellow-500 h-6",

                                    )}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z" />
                                </svg>
                            </div>

                        </Link>


                        {/* Desktop links */}
                        <ul className="ml-auto hidden md:flex items-center gap-6">
                            {/* primary links... */}
                            {nav.slice(0, -1).map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "inline-block  text-base font-normal hover:opacity-70 ",
                                            // reserve space, solid border so it renders even if preflight is off
                                            " border-b-2 border-solid",
                                            isActive(pathname, item.href)
                                                ? "border-b-foreground"
                                                : "border-b-transparent"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>

                            ))}

                            <Link href="/profile" aria-label="profile">
                                <li className="h-10 w-10 flex items-center justify-center hover:opacity-70">
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xl",
                                            hasUsername ? "bg-green-600 text-white" : "bg-[#3a3b3e] text-white"
                                        )}
                                    >
                                        {avatarLabel ? (
                                            <span>{avatarLabel}</span>
                                        ) : (
                                            <UserRound strokeWidth={2.5} />
                                        )}
                                    </div>
                                </li>

                            </Link>

                        </ul>


                        <div className="ml-auto md:hidden flex items-center gap-3 h-9">
                            {/* <AnimatedThemeToggler aria-label="Toggle theme" /> */}
                            {/* <div className="rounded-full border-2 border-white p-4 h-6 w-6 flex items-center justify-center">
                                <Link href="/profile" aria-label="profile">
                                    <div className="text-base">JH</div>
                                </Link>
                            </div> */}

                            <Link href="/profile" aria-label="profile">
                                <li className="h-10 w-10 flex items-center justify-center hover:opacity-70">
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xl",
                                            hasUsername ? "bg-green-600 text-white" : "bg-[#3a3b3e] text-white"
                                        )}
                                    >
                                        {avatarLabel ? (
                                            <span>{avatarLabel}</span>
                                        ) : (
                                            <UserRound strokeWidth={2.5} />
                                        )}
                                    </div>
                                </li>

                            </Link>

                            {/* Mobile toggle control aka burger */}
                            <button
                                onClick={() => setOpen((v) => !v)}
                                aria-label={open ? "Close menu" : "Open menu"}
                                aria-expanded={open}
                                aria-controls="navbar-mobile-content"
                                className="inline-flex h-11 w-11 items-center justify-center relative z-10 cursor-pointer"
                            >
                                <motion.span
                                    initial={false}
                                    animate={open ? "open" : "closed"}
                                    className="relative block h-4 w-5"
                                >
                                    <motion.span
                                        variants={{ closed: { rotate: 0, y: -6 }, open: { rotate: 45, y: 0 } }}
                                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                        className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground"
                                    />
                                    <motion.span
                                        variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground"
                                    />
                                    <motion.span
                                        variants={{ closed: { rotate: 0, y: 6 }, open: { rotate: -45, y: 0 } }}
                                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                        className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground"
                                    />
                                </motion.span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile expanding content (still inside the pill; will push content of navbar, not page) */}
                    <AnimatePresence initial={false}>
                        {open && (
                            <motion.div
                                id="navbar-mobile-content"
                                key="mobile-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                                className="md:hidden relative z-10 "
                            >

                                <ul className="">
                                    {nav.slice(0, -1).map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className="block  w-fit pr-10 py-3 text-lg font-semibold leading-tight"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}

                                </ul>



                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div >
        </div >
    );
}
