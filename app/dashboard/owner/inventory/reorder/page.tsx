"use client";

import { useOwner } from "@/hooks/useOwner";
import { useFetchReorderSummary } from "@/hooks/useFetchReorderSummary";
import { useState } from "react";
import StoreSelector from "@/components/owner/inventory/StoreSelector";
import ReorderTable from "@/components/owner/inventory/ReorderTable";

export default function ReorderInventoryPage() {
    const { companyName } = useOwner();
    const { data, isLoading, error } = useFetchReorderSummary(companyName);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);

    // ✅ Ensure data is available before filtering
    const filteredStores = data && selectedStores.length
        ? data.filter((store) => selectedStores.includes(store.store.dealerStoreId))
        : [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                📦 Reorder Inventory
            </h1>

            {/* ✅ Store Selector */}
            {data ? (
                <StoreSelector
                    stores={data.map((store) => store.store)}
                    selectedStores={selectedStores}
                    setSelectedStores={setSelectedStores}
                />
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-400">Loading stores...</p>
            )}

            {/* ✅ Display Reorder List */}
            <div className="mt-6">
                {isLoading ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">Loading reorder inventory...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error loading inventory: {error.message}</p>
                ) : selectedStores.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        🚨 Please select a store to see the reorder list.
                    </p>
                ) : (
                    filteredStores.map((store) => (
                        <ReorderTable key={store.store.dealerStoreId} store={store} />
                    ))
                )}
            </div>
        </div>
    );
}
