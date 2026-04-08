"use client";

import { useEffect, useState } from "react";
import EmployeeRetentionCard from "@/components/retention/EmployeeRetentionCard";
import { useEmployee } from "@/hooks/useEmployee";
import { fetchStoreRetentions, saveRetentionUpdate } from "@/services/retentionService";
import { RetentionStatus, StoreRetention } from "@/types/retention";

export default function EmployeeRetentionPage() {
    const { store, employee } = useEmployee();
    const [data, setData] = useState<StoreRetention | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = () => {
        if (!store?.dealerStoreId) { return; }
        setLoading(true);
        setError(null);
        fetchStoreRetentions(store.dealerStoreId)
            .then((resp) => setData(resp))
            .catch((err) => setError(err?.message || "Failed to load retention data."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, [store?.dealerStoreId]);

    const handleSave = async (accountNumber: string, update: { amountPaid: number; phones: { phoneNumber: string; status: RetentionStatus }[] }) => {
        if (!store || !employee) { throw new Error("Missing store or employee info"); }
        const payload = {
            dealerStoreId: store.dealerStoreId,
            employeeNtid: employee.employeeNtid,
            accountNumber,
            phones: update.phones,
            amountPaid: update.amountPaid,
            transactionDate: new Date().toISOString().slice(0, 10),
        };
        const updated = await saveRetentionUpdate(payload);

        // Optimistically update just this account in local state to avoid full refresh
        setData((prev) => {
            if (!prev) { return prev; }
            return {
                ...prev,
                retentions: prev.retentions.map((acct) =>
                    acct.accountNumber === accountNumber
                        ? {
                            ...acct,
                            phoneNumbers: update.phones,
                            amountPaid: update.amountPaid,
                        }
                        : acct
                ),
                transactionDate: updated?.transactionDate ?? prev.transactionDate,
            };
        });
    };

    return (
        <div className="p-4 md:p-6 space-y-4">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Employee Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Retention</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update retention statuses for your store.</p>
                </div>
                {store && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        Store: <span className="font-semibold">{store.storeName}</span>
                    </div>
                )}
            </header>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading retention data...</p>}

            {!loading && data && (
                <div className="space-y-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Transaction Date: {data.transactionDate}
                    </div>
                    {data.retentions
                        .slice()
                        .sort((a, b) => {
                            const aHasPending = a.phoneNumbers.some((p) => p.status === "PENDING");
                            const bHasPending = b.phoneNumbers.some((p) => p.status === "PENDING");
                            if (aHasPending === bHasPending) { return 0; }
                            return aHasPending ? -1 : 1;
                        })
                        .map((account) => (
                        <EmployeeRetentionCard
                            key={account.accountNumber}
                            account={account}
                            onSave={(update) => handleSave(account.accountNumber, update)}
                        />
                    ))}
                </div>
            )}

            {!loading && !data && !error && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No retention records found.</p>
            )}
        </div>
    );
}
