"use client";

import { StoreCurrentStock } from "@/types/currentInventoryTypes";
import { useState, useMemo } from "react";

interface InventorySearchProps {
    data: StoreCurrentStock[];
}

export default function InventorySearch({ data }: InventorySearchProps) {
    const [query, setQuery] = useState("");

    const groupedResults = useMemo(() => {
        if (!query) {
            return [];
        }
        const lowerQuery = query.toLowerCase();

        return data
            .map((storeEntry) => {
                const matchedItems = storeEntry.inventory.filter((item) =>
                    item.productName.toLowerCase().includes(lowerQuery)
                );

                if (matchedItems.length === 0) { return null };

                return {
                    storeName: storeEntry.store.storeName,
                    dealerStoreId: storeEntry.store.dealerStoreId,
                    items: matchedItems.map((item) => ({
                        productName: item.productName,
                        quantity: item.currentQuantity,
                    })),
                };
            })
            .filter(Boolean);
    }, [query, data]);

    return (
        <div className="mb-8">
            <input
                type="text"
                placeholder="Search device across all stores..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            {query && groupedResults.length === 0 && (
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    No matching items found.
                </p>
            )}

            {groupedResults.length > 0 && (
                <div className="mt-4 p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm overflow-x-auto space-y-6">
                    {groupedResults.map((group, idx) => {
                        if (!group) { return null; }
                        return (
                            <div key={idx}>
                                <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                                    {group.storeName} ({group.dealerStoreId})
                                </p>
                                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    {group.items.map((item, i) => (
                                        <li key={i}>
                                            • {item.productName} — <span className="font-medium">Qty: {item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
