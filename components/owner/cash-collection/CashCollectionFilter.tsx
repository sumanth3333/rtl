"use client";

import { CalendarIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import FilterInput from "../FilterInput";
import { Store } from "@/schemas/storeSchema";

interface CashCollectionFilterProps {
    storesList: Store[];
    companyName: string;
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    selectedStoreId: string
    setSelectedStoreId: (dealerStoreId: string) => void;
}

export default function CashCollectionFilter({ storesList, companyName, startDate, endDate, setStartDate, setEndDate, selectedStoreId,
    setSelectedStoreId }: CashCollectionFilterProps) {
    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4 text-center sm:text-left">
                Select Date Range
            </h3>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {/* Company Name (Disabled) */}
                <FilterInput
                    label="Company Name"
                    value={companyName}
                    disabled
                    icon={<BuildingOfficeIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />}
                />

                {/* Stores Dropdown */}
                <div className="flex flex-col">
                    <label className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-blue-500 mr-2" />
                        Select A Store
                    </label>
                    <select
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <option value="">All Stores</option>
                        {storesList.map((store) => (
                            <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                {store.storeName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <FilterInput
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    type="date"
                    icon={<CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />}
                />

                {/* End Date */}
                <FilterInput
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    type="date"
                    icon={<CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />}
                />
            </div>
        </div>
    );
}