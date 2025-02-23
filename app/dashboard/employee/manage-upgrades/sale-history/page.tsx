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
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">⏳ Sale History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Review past upgrade sales and transactions.</p>

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
            {isLoading && <p className="text-blue-500">Loading sold devices...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!isLoading && !error && <PreviouslySoldDevicesTable soldDevices={soldDevices} />}
        </div>
    );
}
