"use client";

import InventoryNavbar from "@/components/owner/inventory/InventoryNavbar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
            <InventoryNavbar />
            <main className="max-w-6xl mx-auto p-6">{children}</main>
        </div>
    );
}
