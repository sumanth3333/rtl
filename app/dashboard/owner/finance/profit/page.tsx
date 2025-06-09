"use client";

import { useEffect, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import apiClient from "@/services/api/apiClient";
import { format } from "date-fns";
import { RevenueSection } from "@/components/owner/finance/RevenueSection";
import { ExpensesSection } from "@/components/owner/finance/ExpensesSection";
import { ProfitSection } from "@/components/owner/finance/ProfitSection";
import PAndENavBar from "@/components/owner/finance/PAndENavBar";

export default function ProfitLookupPage() {
    const { companyName } = useOwner();
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) { return };

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiClient.get("/company/profitLookup", {
                    params: { companyName, month: selectedMonth },
                });
                setData(res.data);
            } catch (err: any) {
                setError(err?.response?.data?.message || "❌ Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [companyName, selectedMonth]);

    return (
        <div className="mx-auto px-6 py-10 space-y-6">
            <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
                📊 Profit Summary
            </h1>

            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {data && (
                <div className="grid md:grid-cols-2 gap-6">
                    <RevenueSection revenue={data.revenue} />
                    <ExpensesSection expenses={data.expenses} />
                    <ProfitSection profit={data.profit} />
                </div>
            )}
        </div>
    );
}
