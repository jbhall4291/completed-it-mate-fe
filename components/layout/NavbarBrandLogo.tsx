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
                "relative inline-flex items-center gap-1.5",
                "rounded-2xl px-3 py-0.5 bg-green-500 text-white shadow-[0_6px_24px_rgba(16, 185, 129, .25)]",
                shimmer && "shimmer",

            )}
        >
            <Crown strokeWidth={2.5} className="text-[#ffdd00] h-4 w-4 md:h-5 md:w-5" />
            <span className="tracking-tight text-base md:text-lg uppercase">
                Completed It Mate
            </span>
        </div >
    );
}
