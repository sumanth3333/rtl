"use client";

import { useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import StoreSelector from "@/components/owner/inventory/StoreSelector";
import { useFetchCurrentInventory } from "@/hooks/useFetchCurrentInventory";
import CurrentInvTable from "@/components/owner/inventory/CurrentInvTable";

export default function CurrentInventoryPage() {
    const { companyName } = useOwner();
    const { data, isLoading, error } = useFetchCurrentInventory(companyName);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);

    // ✅ Filter inventory based on selected stores
    const filteredStores = selectedStores.length
        ? data.filter((store) => selectedStores.includes(store.store.dealerStoreId))
        : [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                📦 Current Inventory
            </h1>

            {/* ✅ Store Selector */}
            <StoreSelector
                stores={data.map((store) => store.store)}
                selectedStores={selectedStores}
                setSelectedStores={setSelectedStores}
            />

            {/* ✅ Inventory Table */}
            <div className="mt-6">
                {isLoading ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">Loading inventory...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : filteredStores.length > 0 ? (
                    filteredStores.map((store) => (
                        <CurrentInvTable key={store.store.dealerStoreId} store={store} />
                    ))
                ) : (
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        Please select a store to view inventory.
                    </p>
                )}
            </div>
        </div>
    );
}
