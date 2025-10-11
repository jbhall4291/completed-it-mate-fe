'use client';

export default function SkeletonUserCard() {
    return (
        <div
            className="animate-pulse relative rounded-xl bg-background border border-white/10 overflow-hidden h-[90px] w-[370px]"
        >


            <div className="p-3 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
        </div>
    );
}
