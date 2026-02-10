"use client";

import { useEffect, useState } from "react";
import type { ExpectedPBStore } from "@/types/pb";
import { pbService } from "@/services/pbService";
import ExpectedPbTable from "@/components/pb/ExpectedPbTable";
import PbCommissionCard from "@/components/pb/PbCommissionCard";
import PAndENavBar from "@/components/owner/finance/PAndENavBar";
import { useOwner } from "@/hooks/useOwner";

export default function PbForecastPage() {
    const { companyName } = useOwner();

    const [selectedMonth, setSelectedMonth] = useState("2026-01");

    const [rows, setRows] = useState<ExpectedPBStore[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadExpected() {
        setLoading(true);
        setError(null);
        try {
            const res = await pbService.expectedPerformanceBonus(companyName, selectedMonth);
            setRows(res.data?.expectedPerformanceBonus ?? []);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load expected performance bonus.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadExpected();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName, selectedMonth]);

    return (
        <div className="space-y-5">
            {/* your enterprise navbar */}
            <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

            {error && (
                <div className="rounded-xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-1">
                    <PbCommissionCard companyName={companyName} onSaved={loadExpected} />
                </div>

                <div className="xl:col-span-2">
                    <ExpectedPbTable month={selectedMonth} loading={loading} rows={rows} onRefresh={loadExpected} />
                </div>
            </div>
        </div>
    );
}
