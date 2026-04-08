"use client";

import { useEffect, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import { fetchCompanyRetentions } from "@/services/retentionService";
import { StoreRetention } from "@/types/retention";
import OwnerRetentionCard from "@/components/retention/OwnerRetentionCard";

export default function OwnerRetentionPage() {
    const { companyName } = useOwner();
    const [data, setData] = useState<StoreRetention[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) { return; }
        setLoading(true);
        setError(null);
        fetchCompanyRetentions(companyName)
            .then((resp) => setData(Array.isArray(resp) ? resp : []))
            .catch((err) => setError(err?.message || "Failed to load retention data."))
            .finally(() => setLoading(false));
    }, [companyName]);

    // derive days window if available
    const daysWindow = data[0]?.retentions?.[0]?.daysOld;

    return (
        <div className="p-4 md:p-6 space-y-4">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Owner Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Retention {daysWindow ? `(Last ${daysWindow} Days)` : ""}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Accounts approaching the retention window by store.
                    </p>
                </div>
            </header>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading retention data...</p>}

            {!loading && data.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No retention records found.</p>
            )}

            {!loading && data.map((store) => (
                <OwnerRetentionCard key={store.store.dealerStoreId} data={store} />
            ))}
        </div>
    );
}
