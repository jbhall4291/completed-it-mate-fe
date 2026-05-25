// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { UserRound } from 'lucide-react';
import { useUser } from '@/lib/UserContext';

const nav = [
    { label: "My Collection", href: "/user-library" },
    { label: "Browse Library", href: "/game-library" },
    { label: "Community", href: "/users" },
    { label: "News", href: "/updates" },
    { label: "My Profile (Beta)", href: "/profile" },

];

export default function Navbar() {

    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { me } = useUser();

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



    function isActive(pathname: string, href: string) {
        if (href === "/") return pathname === "/";
        // highlight parent on subroutes, ignore query
        return pathname === href || pathname.startsWith(href + "/");
    }

    const hasUsername = Boolean(me?.username);
    const avatarLabel = me?.username?.[0]?.toUpperCase() ?? null;


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
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            aria-label="Completed It Mate - Home"
                            className={cn(
                                "inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand",
                                "hover:opacity-80 transition-opacity duration-300",
                                "focus-visible:outline-none",
                                "focus-visible:ring-2 focus-visible:ring-green-400",
                                "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c1f]"
                            )}
                        >
                            <svg
                                className="text-yellow-500 h-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z" />
                            </svg>
                        </Link>

                        {/* Desktop links */}
                        <ul className="ml-auto hidden md:flex items-center gap-6">
                            {/* primary links... */}
                            {nav.slice(0, -1).map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        aria-current={isActive(pathname, item.href) ? "page" : undefined}
                                        className={cn(
                                            "relative inline-flex items-center rounded-xl px-3 py-2 text-base font-normal transition-colors",
                                            "hover:bg-white/10 hover:text-white",
                                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400",
                                            "focus-visible:outline-offset-0",
                                            isActive(pathname, item.href)
                                                ? "bg-white/10 text-white"
                                                : "text-white/75"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}

                            <li className="h-10 w-10 flex items-center justify-center">
                                <Link
                                    href="/profile"
                                    aria-label="Profile"
                                    className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xl",
                                        "transition-opacity hover:opacity-70",
                                        "focus-visible:outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-green-400",
                                        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c1f]",
                                        hasUsername ? "bg-brand text-white" : "bg-[#3a3b3e] text-white"
                                    )}
                                >
                                    {avatarLabel ? (
                                        <span>{avatarLabel}</span>
                                    ) : (
                                        <UserRound strokeWidth={2.5} aria-hidden="true" />
                                    )}
                                </Link>
                            </li>

                        </ul>


                        <ul className="ml-auto md:hidden flex items-center gap-3 h-9 ">
                            {/* <AnimatedThemeToggler aria-label="Toggle theme" /> */}
                            {/* <div className="rounded-full border-2 border-white p-4 h-6 w-6 flex items-center justify-center">
                                <Link href="/profile" aria-label="profile">
                                    <div className="text-base">JH</div>
                                </Link>
                            </div> */}

                            <li className="h-10 w-10 flex items-center justify-center hover:opacity-70">
                                <Link href="/profile" aria-label="profile" className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xl",
                                    "focus-visible:outline-none",
                                    "focus-visible:ring-2 focus-visible:ring-green-400",
                                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c1f]",
                                    hasUsername ? "bg-brand text-white" : "bg-[#3a3b3e] text-white"
                                )}>
                                    {avatarLabel ? (
                                        <span>{avatarLabel}</span>
                                    ) : (
                                        <UserRound strokeWidth={2.5} />
                                    )}
                                </Link>
                            </li>

                            {/* Mobile toggle control aka burger */}
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setOpen((v) => !v)}
                                    aria-label={open ? "Close menu" : "Open menu"}
                                    aria-expanded={open}
                                    aria-controls="navbar-mobile-content"
                                    className={cn(
                                        "inline-flex h-10 w-10 items-center justify-center rounded-full",
                                        "relative z-10 cursor-pointer transition-colors",
                                        "bg-white/10 hover:bg-white/20",
                                        "focus-visible:outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-green-400",
                                        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1c1f]"
                                    )}
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
                            </li>
                        </ul>
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

                                <ul className="py-2">
                                    {nav.slice(0, -1).map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className={cn(
                                                    "block w-fit rounded-lg px-3 py-3 text-lg font-semibold leading-tight",
                                                    "hover:bg-white/10",
                                                    "focus-visible:outline-none",
                                                    "focus-visible:ring-2 focus-visible:ring-green-400"
                                                )}
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
