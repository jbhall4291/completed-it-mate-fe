import { Crown } from "lucide-react";
import { Silkscreen } from "next/font/google";
import { cn } from "@/lib/utils";

const silkscreen = Silkscreen({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
});

interface BrandLogoProps {
    shimmer?: boolean;

}

export default function BrandLogo({ shimmer = true, }: BrandLogoProps) {
    return (
        <div
            className={cn(
                silkscreen.className,
                "relative inline-flex items-center gap-3 w-fit cursor-default select-none",
                "rounded-2xl px-5 pt-2 pb-2.5 bg-green-500 text-white shadow-[0_6px_24px_rgba(16, 185, 129, .25)]",
                shimmer && "shimmer",

            )}
        >
            <Crown strokeWidth={2.5} className="text-[#ffdd00] h-5 w-5 md:h-11 md:w-11" />
            <span className="tracking-tight text-lg md:text-5xl uppercase">
                Completed It Mate
            </span>
        </div >
    );
}
