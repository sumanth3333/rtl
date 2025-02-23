"use client";

import { useOwner } from "@/hooks/useOwner";
import { useFetchReorderSummary } from "@/hooks/useFetchReorderSummary";
import ReorderSummaryTable from "@/components/owner/ReorderSummaryTable";
import ReorderSummaryGenerator from "@/components/owner/ReorderSummaryGenerator";

export default function ReorderSummaryPage() {
    const { companyName } = useOwner();
    const { data, isLoading, error } = useFetchReorderSummary(companyName);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-200 mb-6">📦 Reorder Summary</h2>

            {isLoading ? <p>Loading...</p> : error ? <p>{error}</p> : <ReorderSummaryTable data={data} />}
            <ReorderSummaryGenerator data={data} />
        </div>
    );
}
