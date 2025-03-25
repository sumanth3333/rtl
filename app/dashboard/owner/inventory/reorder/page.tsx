"use client"

import { useOwner } from "@/hooks/useOwner";
import { useFetchReorderSummary } from "@/hooks/useFetchReorderSummary";
import { useState } from "react";
import StoreSelector from "@/components/owner/inventory/StoreSelector";
import ReorderTable from "@/components/owner/inventory/ReorderTable";
import OverallReorderTable from "@/components/owner/inventory/OverallReorderTable"; // New component

export default function ReorderInventoryPage() {
    const { companyName } = useOwner();
    const { data, isLoading, error, overallReorderSummary, overallReorderValue } = useFetchReorderSummary(companyName);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [showOverall, setShowOverall] = useState<boolean>(false);

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
                    showOverall={showOverall}
                    setShowOverall={setShowOverall}
                />
            ) : (
                <p className="text-center text-gray-600 dark:text-gray-400">Loading stores...</p>
            )}

            <div className="mt-6">
                {isLoading ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">Loading reorder inventory...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error loading inventory: {error.message}</p>
                ) : (
                    <>
                        {showOverall && overallReorderSummary && (
                            <OverallReorderTable
                                inventory={overallReorderSummary}
                                totalValue={overallReorderValue}
                            />
                        )}
                        {filteredStores.length > 0 ? (
                            filteredStores.map((store) => (
                                <ReorderTable key={store.store.dealerStoreId} store={store} />
                            ))
                        ) : !showOverall ? (
                            <p className="text-center text-gray-600 dark:text-gray-400">
                                🚨 Please select a store to see the reorder list.
                            </p>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}
