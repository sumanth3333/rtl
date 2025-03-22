"use client";

import { useEffect, useState } from "react";
import { useFetchCompanySoldDevices } from "@/hooks/useFetchCompanySoldDevices";
import CompanyPreviouslySoldDevicesTable from "@/components/upgrades/CompanyPreviouslySoldDevicesTable";
import { useOwner } from "@/hooks/useOwner";

export default function CompanySaleHistoryPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { companyName } = useOwner();

    useEffect(() => {
        if (!companyName) {
            return;
        }
    }, [companyName]);

    const { data, isLoading, error } = useFetchCompanySoldDevices(companyName, startDate, endDate);
    const currentDate = new Date().toISOString().split("T")[0];

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white">
                Sale History
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div>
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={currentDate}
                        className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        max={currentDate}
                        className="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {isLoading && <p className="text-blue-500 text-center mt-4">Loading company sale history...</p>}
            {error && <p className="text-red-500 text-center mt-4">Error: {error}</p>}
            {!isLoading && !error && <CompanyPreviouslySoldDevicesTable data={data} />}
        </div>
    );
}
