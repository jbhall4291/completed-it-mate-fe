'use client';

import UsernameSetter from "@/components/user/UsernameSetter";

export default function LibraryPage() {

    return (
        <main className="relative p-6 font-sans  min-h-screen ">

            <h1 className="text-3xl font-bold mb-6">My Profile (Beta)</h1>
            <div className="mb-4">Member since: </div>

            <div className="flex flex-row gap-x-4 items-center">
                <div>Edit username:</div>
                <UsernameSetter />
            </div>

        </main>
    );
}
