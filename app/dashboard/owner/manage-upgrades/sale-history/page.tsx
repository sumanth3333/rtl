"use client";

import PreviouslySoldDevicesTable from "@/components/upgrades/PreviouslySoldDevicesTable";
import SaleHistoryFilters from "@/components/upgrades/SaleHistoryFilters";
import { useState } from "react";
import { useFetchSoldDevices } from "@/hooks/useFetchSoldDevices";

export default function SaleHistoryPage() {
    const [selectedStore, setSelectedStore] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const { soldDevices, isLoading, error } = useFetchSoldDevices(selectedStore, startDate, endDate);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 bg-white dark:bg-gray-900 transition-colors duration-300">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
                ⏳ Sale History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
                Review past upgrade sales and transactions.
            </p>

            {/* Filters */}
            <SaleHistoryFilters
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
            />

            {/* Display Sale History */}
            {isLoading && (
                <p className="mt-4 text-center text-blue-500">Loading sold devices...</p>
            )}
            {error && (
                <p className="mt-4 text-center text-red-500">Error: {error}</p>
            )}
            {!isLoading && !error && (
                <PreviouslySoldDevicesTable soldDevices={soldDevices} />
            )}
        </div>
    );
}
