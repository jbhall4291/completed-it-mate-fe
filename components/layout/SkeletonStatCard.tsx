'use client';

export default function SkeletonStatCard() {
    return (
        <div
            className="animate-pulse relative rounded-xl bg-background border border-white/10 overflow-hidden w-full md:w-[410px] h-[360px] md:h-[476px]"
        >
            <div className="p-3 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>

            <div className="h-3/4 bg-white/10" />

        </div>
    );
}
