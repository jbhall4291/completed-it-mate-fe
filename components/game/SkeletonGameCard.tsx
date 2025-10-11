'use client';

export default function SkeletonCard() {
    return (
        <div
            className="animate-pulse relative rounded-xl bg-background border border-white/10 overflow-hidden w-[300px] h-[240px]"
        >
            {/* fake image area */}
            <div className="h-3/4 bg-white/10" />
            {/* fake text area */}
            <div className="p-3 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
        </div>
    );
}
