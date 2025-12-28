import { Silkscreen } from "next/font/google";
import { cn } from "@/lib/utils";

const silkscreen = Silkscreen({
    subsets: ["latin"],
    weight: "400",
    display: "swap",
});

export default function BrandLogo() {


    return (
        <div
            className={cn(
                silkscreen.className,
                "relative inline-flex items-center transition-all duration-300",
                "rounded-full bg-green-600 text-white",
                "shadow-[0_4px_16px_rgba(16,185,129,.18)]",
                "h-14 md:h-20"


            )}
        >
            <div className="flex h-full aspect-square items-center justify-center rounded-full bg-green-500 ">
                <svg
                    className={cn(
                        "text-yellow-500 h-6 md:h-11 w-6 md:w-11",

                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z" />
                </svg>
            </div>

            <div
                className={cn(
                    "flex flex-col  leading-none uppercase  tracking-wide text-2xl md:text-4xl px-2 md:px-4 pr-6 md:pr-8",

                )}
            >
                Completed It Mate
            </div>
        </div >
    );
}
