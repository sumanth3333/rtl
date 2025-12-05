"use client";

import { useOwner } from "@/hooks/useOwner";
import { useMemo, useState } from "react";
import { useCompanyPaychecks } from "@/hooks/useCompanyPaychecks";
import PaycheckSummary from "@/components/owner/paycheck/view-paychecks/PaycheckSummary";
import EmployeePaycheckRow from "@/components/owner/paycheck/view-paychecks/EmployeePaycheckRow";

export default function ViewPaychecksPage() {
    const { companyName } = useOwner(); // ✅ hook is now inside component

    // Month input expects "YYYY-MM"
    const [selectedMonth, setSelectedMonth] = useState<string>("2025-10");
    const [search, setSearch] = useState<string>("");

    const { data, loading, error } = useCompanyPaychecks(
        selectedMonth,
        companyName ?? "" // in case companyName is undefined initially
    );

    const filteredData = useMemo(() => {
        if (!data) { return []; }
        if (!search.trim()) { return data; }

        const term = search.toLowerCase();
        return data.filter((emp) => {
            const name = emp.employee.employeeName?.toLowerCase() ?? "";
            const ntid = emp.employee.employeeNtid?.toLowerCase() ?? "";
            return name.includes(term) || ntid.includes(term);
        });
    }, [data, search]);

    const hasAnyPaychecks = useMemo(
        () =>
            (data ?? []).some(
                (emp) => emp.paymentDetails && emp.paymentDetails.length > 0
            ),
        [data]
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100/60 px-3 py-4 md:px-6 md:py-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
                {/* Header */}
                <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
                            Paychecks Overview
                        </h1>
                        <p className="mt-1 text-sm text-zinc-600">
                            View generated paychecks by month for{" "}
                            <span className="font-medium text-zinc-900">
                                {companyName ?? "—"}
                            </span>
                            .
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 shadow-sm">
                            <span className="font-medium text-zinc-700">Company</span>
                            <span className="hidden text-zinc-400 md:inline">•</span>
                            <span className="truncate font-semibold text-zinc-900">
                                {companyName ?? "Not set"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-3 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                        <label className="flex flex-col text-xs font-medium text-zinc-600 md:flex-row md:items-center md:gap-2">
                            <span>Month</span>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-inner outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 md:mt-0 md:w-40"
                            />
                        </label>
                    </div>
                    <div className="flex flex-1 items-center gap-2 md:justify-end">
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search employee or NTID..."
                                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-sm text-zinc-900 shadow-inner outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                            />
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-zinc-400">
                                🔍
                            </span>
                        </div>
                    </div>
                </section>

                {/* Summary */}
                <PaycheckSummary data={data} />

                {/* Content */}
                <section className="mt-2 flex flex-col gap-3">
                    {loading && (
                        <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white/80 p-6 text-sm text-zinc-600 shadow-sm">
                            <span className="mr-2 h-3 w-3 animate-spin rounded-full border border-zinc-300 border-b-zinc-900" />
                            Loading paychecks…
                        </div>
                    )}

                    {error && !loading && (
                        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    {!loading && !error && data && data.length === 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-sm text-zinc-600 shadow-sm">
                            No employees found for this company.
                        </div>
                    )}

                    {!loading && !error && data && data.length > 0 && !hasAnyPaychecks && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800 shadow-sm">
                            No paychecks have been generated for this month yet.
                        </div>
                    )}

                    {!loading && !error && filteredData.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {filteredData.map((record) => (
                                <EmployeePaycheckRow
                                    key={record.employee.employeeNtid}
                                    record={record}
                                />
                            ))}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        data &&
                        data.length > 0 &&
                        filteredData.length === 0 && (
                            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-sm text-zinc-600 shadow-sm">
                                No employees match your search for{" "}
                                <span className="font-semibold">“{search}”</span>.
                            </div>
                        )}
                </section>
            </div>
        </div>
    );
}
