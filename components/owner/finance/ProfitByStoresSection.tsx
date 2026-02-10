"use client";

import React, { useMemo, useState } from "react";
import { money, safeNumber } from "@/lib/format";
import { ProfitLookupResponse } from "@/types/finance";
import { Card } from "@/components/ui/finance/Card";
import { Divider, Row } from "@/components/ui/finance/Row";
import { CollapsibleCard } from "@/components/ui/finance/CollapsibleCard";

export function ProfitByStoresSection({
    profitByStores,
}: {
    profitByStores?: ProfitLookupResponse["profitByStores"];
}) {
    const [openStore, setOpenStore] = useState<Record<string, boolean>>({});
    const [openPay, setOpenPay] = useState<Record<string, boolean>>({}); // ✅ toggles employee table by store

    const stores = useMemo(() => profitByStores ?? [], [profitByStores]);

    if (stores.length === 0) {
        return (
            <Card title="Profit by Stores" subtitle="No store breakdown available">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">No data.</div>
            </Card>
        );
    }

    return (
        <Card title="Profit by Stores" subtitle="Click a store → see details. Click Paycheck → see employees pay.">
            <div className="space-y-3">
                {stores.map((s) => {
                    const id = s.store.dealerStoreId;
                    const isStoreOpen = !!openStore[id];
                    const isPayOpen = !!openPay[id];

                    const totalRevenue = safeNumber(s.storeProfit.storeRevenue.totalRevenue);
                    const totalExpense = safeNumber(s.storeProfit.storeExpense.totalExpense);
                    const net = totalRevenue - totalExpense;
                    const onHand = safeNumber(s.storeProfit.onHandProfit);

                    const payCheck = safeNumber(s.storeProfit.storeExpense.expenses.payCheck);
                    const employees = s.storeProfit.storeExpense.expenses.employeesPay || [];
                    const employeesTotal = employees.reduce((sum, p) => sum + safeNumber(p.earnedForMonth), 0);

                    // ✅ meaningful but subtle tones
                    const toneBorder =
                        onHand > 0
                            ? "border-emerald-200 dark:border-emerald-900"
                            : onHand < 0
                                ? "border-rose-200 dark:border-rose-900"
                                : "border-zinc-200 dark:border-zinc-800";

                    const toneRing =
                        onHand > 0
                            ? "ring-emerald-500/80"
                            : onHand < 0
                                ? "ring-rose-500/65"
                                : "ring-zinc-900/65";

                    return (
                        <div
                            key={id}
                            className={[
                                "rounded-2xl border bg-white p-4 shadow-sm",
                                "dark:bg-zinc-950/20",
                                "ring-1",
                                toneBorder,
                                toneRing,
                            ].join(" ")}
                        >
                            {/* ✅ Store header (click expands store) */}
                            <button
                                type="button"
                                onClick={() => setOpenStore((prev) => ({ ...prev, [id]: !prev[id] }))}
                                className="flex w-full items-start justify-between gap-3 text-left"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {s.store.storeName}
                                    </div>
                                    <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{id}</div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <div className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                                        {money(onHand)}
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">On-hand profit</div>
                                </div>
                            </button>

                            {/* ✅ Mini stats (subtle net color, not loud) */}
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <MiniStat label="Revenue" value={money(totalRevenue)} />
                                <MiniStat label="Expenses" value={money(totalExpense)} />
                                <MiniStat
                                    label="Net (Revenue - Expense)"
                                    value={money(net)}
                                    tone={net > 0 ? "good" : net < 0 ? "bad" : "neutral"}
                                />
                            </div>

                            {/* ✅ Expanded store content */}
                            {isStoreOpen && (
                                <div className="mt-4">
                                    <Divider />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Revenue breakdown */}
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Revenue breakdown
                                            </div>
                                            <Row label="Accessories" value={money(s.storeProfit.storeRevenue.accessories)} />
                                            <Row label="Compensation" value={money(s.storeProfit.storeRevenue.compensation)} />
                                            <Row label="Total Revenue" value={money(totalRevenue)} strong />
                                        </div>

                                        {/* Expense breakdown */}
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Expense breakdown
                                            </div>

                                            <Row label="Business Expense" value={money(s.storeProfit.storeExpense.expenses.businessExpense)} />
                                            <Row label="Dealer Deduction" value={money(s.storeProfit.storeExpense.expenses.dealerDeduction)} />
                                            <Row label="In-Store Expense" value={money(s.storeProfit.storeExpense.expenses.inStoreExpense)} />
                                            <Row label="Other Expense" value={money(s.storeProfit.storeExpense.expenses.otherExpense)} />
                                            <Row label="Legal Expense" value={money(s.storeProfit.storeExpense.expenses.legalExpense)} />
                                            <Row label="Self Activation Invoice" value={money(s.storeProfit.storeExpense.expenses.selfActivationInvoice)} />

                                            {/* ✅ Paycheck row becomes clickable toggle */}
                                            <PaycheckToggleRow
                                                value={money(payCheck)}
                                                isOpen={isPayOpen}
                                                onToggle={() => setOpenPay((prev) => ({ ...prev, [id]: !prev[id] }))}
                                            />

                                            <Row label="Total Expense" value={money(totalExpense)} strong />
                                        </div>
                                    </div>

                                    {/* ✅ Employees table ONLY when paycheck clicked */}
                                    {isPayOpen && employees.length > 0 && (
                                        <div className="mt-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                    Employees pay
                                                </div>
                                                <div className="text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                                                    Total: {money(employeesTotal)}
                                                </div>
                                            </div>

                                            <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-800">
                                                <div className="grid grid-cols-12 gap-2 bg-zinc-50 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-950/40 dark:text-zinc-300">
                                                    <div className="col-span-5">Employee</div>
                                                    <div className="col-span-2 text-right">Hours</div>
                                                    <div className="col-span-2 text-right">Commission</div>
                                                    <div className="col-span-3 text-right">Paid</div>
                                                </div>

                                                <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
                                                    {employees.map((p) => (
                                                        <div
                                                            key={p.employee.employeeNtid}
                                                            className="grid grid-cols-12 gap-2 px-3 py-2 text-sm"
                                                        >
                                                            <div className="col-span-5 min-w-0">
                                                                <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                                                                    {p.employee.employeeName}
                                                                </div>
                                                                <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                                                    {p.employee.employeeNtid}
                                                                </div>
                                                            </div>

                                                            <div className="col-span-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                                                                {safeNumber(p.numberOfHoursWorked).toFixed(2)}
                                                            </div>

                                                            <div className="col-span-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                                                                {safeNumber(p.boxesCommission).toFixed(2)}
                                                            </div>

                                                            <div className="col-span-3 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                                                                {money(p.earnedForMonth)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Optional audit hint if mismatch (kept subtle) */}
                                            {Math.abs(payCheck - employeesTotal) > 0.5 && (
                                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                                    Note: Store paycheck differs from sum of employee earnings by {money(payCheck - employeesTotal)}.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-3 flex justify-end">
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Tap store to {isStoreOpen ? "collapse" : "expand"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function MiniStat({
    label,
    value,
    tone = "neutral",
}: {
    label: string;
    value: string;
    tone?: "neutral" | "good" | "bad";
}) {
    const toneClass =
        tone === "good"
            ? "text-emerald-700 dark:text-emerald-300"
            : tone === "bad"
                ? "text-rose-700 dark:text-rose-300"
                : "text-zinc-900 dark:text-zinc-100";

    return (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{label}</div>
            <div className={`mt-1 text-sm font-semibold tabular-nums ${toneClass}`}>{value}</div>
        </div>
    );
}

function PaycheckToggleRow({
    value,
    isOpen,
    onToggle,
}: {
    value: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={[
                "mt-1 w-full rounded-xl px-2 py-2",
                "transition-colors",
                "hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Paycheck{" "}
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                        (click to {isOpen ? "hide" : "view"} employees)
                    </span>
                </div>
                <div className="text-sm tabular-nums text-zinc-800 dark:text-zinc-200">{value}</div>
            </div>
        </button>
    );
}
