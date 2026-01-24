"use client";

import CommunityDashboard from "@/components/community/CommunityDashboard";
import RecentUsers from "@/components/community/RecentUsers";

export default function CommunityPage() {
    return (
        <main className="p-6 font-sans min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Community</h1>
            <CommunityDashboard />
            <RecentUsers />
        </main>
    );
}
