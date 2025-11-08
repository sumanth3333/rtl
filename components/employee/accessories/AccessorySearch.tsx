// components/employee/inventory/InventorySearch.tsx
"use client";

import { StoreCurrentStock } from "@/types/currentAccessoryTypes";
import { useState, useMemo } from "react";

interface InventorySearchProps {
    data: StoreCurrentStock[];
}

export default function AccessorySearch({ data }: InventorySearchProps) {
    console.log("data " + data)
    const [query, setQuery] = useState("");

    const groupedResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) { return []; }

        return data
            .map((storeEntry) => {
                // ✅ Ensure storeEntry.inventory is a valid array
                const inventoryItems = Array.isArray(storeEntry.accessory)
                    ? storeEntry.accessory
                    : [];

                const items = inventoryItems.filter((it) =>
                    it.productName?.toLowerCase().includes(q)
                );

                if (items.length === 0) { return null; }

                return {
                    storeName: storeEntry.store?.storeName ?? "Unknown Store",
                    dealerStoreId: storeEntry.store?.dealerStoreId ?? "N/A",
                    items: items.map((it) => ({
                        productName: it.productName ?? "Unnamed Product",
                        caseQuantity: it.caseQuantity ?? 0,
                        glassQuantity: it.glassQuantity ?? 0,
                    })),
                };
            })
            .filter(Boolean) as {
                storeName: string;
                dealerStoreId: string;
                items: {
                    productName: string;
                    caseQuantity: number;
                    glassQuantity: number;
                }[];
            }[];
    }, [query, data]);


    return (
        <div className="mb-10">
            {/* 🔍 Search Box */}
            <input
                type="text"
                placeholder="Search accessories across all stores…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 text-base md:text-lg rounded-2xl border border-sky-400/70 
               focus:border-sky-500 focus:ring-4 focus:ring-sky-300/50 
               placeholder-gray-500 dark:placeholder-gray-400 
               bg-white/90 dark:bg-gray-900/70 backdrop-blur 
               text-gray-900 dark:text-white shadow-sm transition-all duration-300"
            />

            {/* 🕵️ No Results */}
            {query && groupedResults.length === 0 && (
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 italic">
                    No matching items found.
                </p>
            )}

            {/* 📦 Results */}
            {groupedResults.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupedResults.map((group, idx) => (
                        <div
                            key={`${group.dealerStoreId}-${idx}`}
                            className="rounded-2xl border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900 shadow-md hover:shadow-lg 
                     transition-all duration-300 overflow-hidden"
                        >
                            {/* Store Header */}
                            <div className="px-5 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight">
                                    {group.storeName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {group.dealerStoreId}
                                </p>
                            </div>

                            {/* Item List */}
                            <div className="p-4">
                                <ul className="space-y-3">
                                    {group.items.map((item, i) => (
                                        <li
                                            key={i}
                                            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 
                             px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                             bg-gray-50 dark:bg-gray-800"
                                        >
                                            {/* Product Name */}
                                            <span className="text-sm md:text-base text-gray-800 dark:text-gray-100 font-medium leading-snug truncate">
                                                {item.productName}
                                            </span>

                                            {/* Case Quantity */}
                                            <span className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                Case: {item.caseQuantity}
                                            </span>

                                            {/* Glass Quantity */}
                                            <span className="text-xs md:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                Glass: {item.glassQuantity}
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
