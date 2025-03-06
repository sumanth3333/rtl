"use client";

import { useState, useEffect } from "react";
import { useOwner } from "@/hooks/useOwner";
import { useFetchCashCollection } from "@/hooks/useFetchCashCollection";
import CashCollectionFilter from "@/components/owner/cash-collection/CashCollectionFilter";
import CashCollectionSummary from "@/components/owner/cash-collection/CashCollectionSummary";
import { getStores } from "@/services/owner/ownerService";
import { Store } from "@/schemas/storeSchema";

export default function CashCollectionPage() {
    const { companyName } = useOwner();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState(""); // ✅ Track selected store

    // ✅ Load stores dynamically
    useEffect(() => {
        if (companyName) {
            getStores(companyName).then(setStores).catch(() => setStores([]));
        }
    }, [companyName]);

    // ✅ Fetch cash collection based on selected filters
    const { cashData, isLoading, error } = useFetchCashCollection(companyName, startDate, endDate, selectedStoreId);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">
                💰 Cash Collection
            </h2>

            {/* Cash Collection Filter */}
            <div className="mt-4">
                <CashCollectionFilter
                    storesList={stores}
                    companyName={companyName || ""}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    selectedStoreId={selectedStoreId}
                    setSelectedStoreId={setSelectedStoreId} // ✅ Update selected store
                />
            </div>

            {/* Conditional Rendering */}
            <div className="mt-6">
                {!companyName || !startDate || !endDate ? (
                    <p className="text-gray-500 text-center">Select a store and date range to view cash collection.</p>
                ) : isLoading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <CashCollectionSummary cashData={cashData} />
                )}
            </div>
        </div>
    );
}