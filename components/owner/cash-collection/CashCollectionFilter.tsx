"use client";

import { CalendarIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import FilterInput from "../FilterInput";

interface CashCollectionFilterProps {
    companyName: string;
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
}

export default function CashCollectionFilter({ companyName, startDate, endDate, setStartDate, setEndDate }: CashCollectionFilterProps) {
    const currentDate = new Date().toISOString().split("T")[0];

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Please select the date range</h3>

            {/* Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Company Name (Disabled) */}
                <FilterInput label="Company Name" value={companyName} disabled icon={<BuildingOfficeIcon className="w-5 h-5 text-blue-500" />} />

                {/* Start Date */}
                <FilterInput label="Start Date" value={startDate} onChange={setStartDate} type="date" icon={<CalendarIcon className="w-5 h-5 text-green-500" />} />

                {/* End Date */}
                <FilterInput label="End Date" value={endDate} onChange={setEndDate} type="date" icon={<CalendarIcon className="w-5 h-5 text-red-500" />} />
            </div>
        </div>
    );
}
