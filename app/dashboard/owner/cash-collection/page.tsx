"use client";

import { useState } from "react";
import { useOwner } from "@/hooks/useOwner"; // ✅ Fetch Company Name
import { useFetchCashCollection } from "@/hooks/useFetchCashCollection";
import CashCollectionFilter from "@/components/owner/cash-collection/CashCollectionFilter";
import CashCollectionSummary from "@/components/owner/cash-collection/CashCollectionSummary";

export default function CashCollectionPage() {
    const { companyName } = useOwner(); // ✅ Fetch Company Name
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { cashData, isLoading, error } = useFetchCashCollection(companyName, startDate, endDate);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-200 mb-6">💰 Cash Collection</h2>

            <CashCollectionFilter
                companyName={companyName || ""}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />

            {!companyName || !startDate || !endDate ? (
                <p className="text-gray-500 text-center">Select a company and date range to view cash collection.</p>
            ) : isLoading ? (
                <p className="text-center text-gray-600">Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <CashCollectionSummary cashData={cashData} />
            )}

        </div>
    );
}
