"use client";

import { useFetchAuthorizedStores } from "@/hooks/useFetchAuthorizedStores";

interface SaleHistoryFiltersProps {
    selectedStore: string;
    setSelectedStore: (storeId: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
}

export default function SaleHistoryFilters({
    selectedStore,
    setSelectedStore,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}: SaleHistoryFiltersProps) {
    const { stores, isLoading, error } = useFetchAuthorizedStores();
    const currentDate = new Date().toISOString().split("T")[0];

    return (
        <div className="flex flex-wrap gap-4 my-4">
            {/* Store Selection */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Select Store</label>
                <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                    disabled={isLoading}
                >
                    <option value="">-- Select a Store --</option>
                    {stores?.length > 0 ? (
                        stores.map((store) => (
                            <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                {store.storeName}
                            </option>
                        ))
                    ) : (
                        <option value="" disabled>
                            {isLoading ? "Loading..." : "No Stores Available"}
                        </option>
                    )}
                </select>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Start Date */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={currentDate}
                    className="border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
            </div>

            {/* End Date */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={currentDate}
                    className="border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
            </div>
        </div>
    );
}
