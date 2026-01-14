'use client';

import { UserRound } from "lucide-react";

export default function SkeletonUserCard() {

    // animate-pulse
    return (
        <div
            className="px-5 py-4 bg-[#242528] rounded-lg  transition text-[#fafafa] animate-pulse h-[104px] items-center flex"
        >
            <div className="flex items-center gap-x-5">

                {/* Avatar */}
                <div
                    className='w-14 h-14 rounded-full flex items-center justify-center font-semibold text-2xl bg-[#3a3b3e]'
                >
                    <span className="text-[#fafafa]">
                        <UserRound strokeWidth={2.75} />
                    </span>
                </div>

                {/* User info */}
                <div className="flex flex-col gap-y-1">
                    <div className="bg-[#3a3b3e] w-42 h-5 rounded"></div>
                    <div className="bg-[#3a3b3e] w-36 h-4 rounded"></div>
                    <div className="bg-[#3a3b3e] w-10 h-3.5 rounded"></div>
                </div>
            </div>
        </div>
    );
}