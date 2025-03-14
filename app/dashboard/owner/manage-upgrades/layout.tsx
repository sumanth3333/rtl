"use client";

import UpgradesNavBar from "@/components/upgrades/UpgradesNavbar";

export default function UpgradePhonesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <UpgradesNavBar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-4 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
