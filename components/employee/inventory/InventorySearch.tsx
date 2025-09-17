// components/employee/inventory/InventorySearch.tsx
"use client";

import { StoreCurrentStock } from "@/types/currentInventoryTypes";
import { useState, useMemo } from "react";

interface InventorySearchProps {
    data: StoreCurrentStock[];
}

export default function InventorySearch({ data }: InventorySearchProps) {
    const [query, setQuery] = useState("");

    const groupedResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) { return [] };
        return data
            .map((storeEntry) => {
                const items = storeEntry.inventory.filter((it) =>
                    it.productName.toLowerCase().includes(q)
                );
                if (items.length === 0) { return null };
                return {
                    storeName: storeEntry.store.storeName,
                    dealerStoreId: storeEntry.store.dealerStoreId,
                    items: items.map((it) => ({
                        productName: it.productName,
                        quantity: it.currentQuantity,
                    })),
                };
            })
            .filter(Boolean) as {
                storeName: string;
                dealerStoreId: string;
                items: { productName: string; quantity: number }[];
            }[];
    }, [query, data]);

    return (
        <div className="mb-8">
            <input
                type="text"
                placeholder="Search devices across all stores…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 text-base md:text-lg rounded-2xl border border-sky-400/70 focus:border-sky-500 focus:ring-4 focus:ring-sky-300/50 placeholder-sky-700 dark:placeholder-sky-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-900 dark:text-white transition"
            />

            {query && groupedResults.length === 0 && (
                <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    No matching items found.
                </p>
            )}

            {groupedResults.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedResults.map((group, idx) => (
                        <div
                            key={`${group.dealerStoreId}-${idx}`}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 shadow-sm backdrop-blur overflow-hidden"
                        >
                            <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800">
                                <p className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
                                    {group.storeName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {group.dealerStoreId}
                                </p>
                            </div>

                            <div className="p-4">
                                <ul className="space-y-2">
                                    {group.items.map((item, i) => (
                                        <li
                                            key={i}
                                            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                        >
                                            <span className="whitespace-normal break-words text-sm md:text-base text-gray-800 dark:text-gray-200">
                                                {item.productName}
                                            </span>
                                            <span className="text-xs md:text-sm font-semibold text-sky-700 dark:text-sky-300">
                                                Qty: {item.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
