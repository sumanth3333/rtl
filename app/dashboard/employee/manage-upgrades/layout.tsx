"use client";

import UpgradesNavBar from "@/components/upgrades/UpgradesNavbar";

export default function UpgradePhonesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <UpgradesNavBar />
            <main className="flex-grow container mx-auto p-6 mt-16 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
