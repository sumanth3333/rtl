"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import apiClient from "@/services/api/apiClient";

interface SaleExpense {
    id: number;
    reason: string;
    amount: number;
    paymentType: string;
    expenseType: string;
    deleteExpense: boolean;
}

interface SaleSummary {
    saleId: number;
    dealerStoreId: string;
    employeeName: string;
    boxesSold: number;
    systemAccessories: number;
    accessories: number;
    upgrade: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    migrations: number;
    systemCash: number;
    systemCard: number;
    creditCard: number;
    debitCard: number;
    actualCash: number;
    actualCard: number;
    cashExpense: number;
    expenseReason: string | null;
    saleDate: string;
    lastTransactionTime: string;
    expenses: SaleExpense[];
    saleVerifiedWithRtpos: boolean;
    saleVerified: boolean;
    envelopeMissing: boolean;
}

interface SalesResponseTotals {
    totalActivations: number;
    totalHsi: number;
    totalBts: number;
    totalAccessories: number;
    totalUpgrades: number;
    totalMigrations: number;
    totalFreeLines: number;
}

interface Props {
    date: string;
    companyName: string;
}

// Fixed categorical order (validated: dataviz skill reference palette) - colors follow
// employee identity across tabs, never re-assigned by rank, and are never cycled past slot 8.
const BAR_COLORS: { bar: string; onFillLight: "white" | "ink" }[] = [
    { bar: "bg-[#2a78d6] dark:bg-[#3987e5]", onFillLight: "white" }, // blue
    { bar: "bg-[#eb6834] dark:bg-[#d95926]", onFillLight: "white" }, // orange
    { bar: "bg-[#1baf7a] dark:bg-[#199e70]", onFillLight: "white" }, // aqua
    { bar: "bg-[#eda100] dark:bg-[#c98500]", onFillLight: "ink" },   // yellow
    { bar: "bg-[#e87ba4] dark:bg-[#d55181]", onFillLight: "ink" },   // magenta
    { bar: "bg-[#008300] dark:bg-[#008300]", onFillLight: "white" }, // green
    { bar: "bg-[#4a3aa7] dark:bg-[#9085e9]", onFillLight: "white" }, // violet
    { bar: "bg-[#e34948] dark:bg-[#e66767]", onFillLight: "white" }, // red
];
const OVERFLOW_BAR_COLOR = { bar: "bg-gray-400 dark:bg-gray-600", onFillLight: "white" as const };

type BreakdownTab = "accessories" | "boxes" | "actualCash";

const BREAKDOWN_TABS: { key: BreakdownTab; label: string; isCurrency: boolean; groupBy: "employee" | "store" }[] = [
    { key: "accessories", label: "Accessories ($)", isCurrency: true, groupBy: "employee" },
    { key: "boxes", label: "Boxes Sold", isCurrency: false, groupBy: "employee" },
    // Actual cash is counted once per store (a shared till) - every employee at that store reports
    // the same figure for the day, so grouping by employee would double-count it.
    { key: "actualCash", label: "Actual Cash ($)", isCurrency: true, groupBy: "store" },
];

type SortKey =
    | "saleId" | "dealerStoreId" | "employeeName" | "boxesSold" | "upgrade"
    | "accessories" | "actualCash" | "cashExpense" | "saleVerified";
type SortDirection = "asc" | "desc";

const money = (value: number) => `$${value.toFixed(2)}`;

const formatSaleDateTime = (date: string, time: string) => {
    const d = new Date(`${date}T${time}`);
    if (Number.isNaN(d.getTime())) { return `${date} ${time}`; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function EodSummaryByDate({ date, companyName }: Props) {
    const [sales, setSales] = useState<SaleSummary[]>([]);
    const [totals, setTotals] = useState<SalesResponseTotals | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeBreakdownTab, setActiveBreakdownTab] = useState<BreakdownTab>("accessories");
    const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
    const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: "saleId", direction: "desc" });

    useEffect(() => {
        if (!companyName || !date) { return };

        setLoading(true);
        apiClient
            .get("/sale/fetchSubmittedSalesByDate", {
                params: {
                    companyName,
                    // API expects a date range; for single day we send `<date>`
                    date: `${date}`,
                },
            })
            .then((res) => {
                const data = res.data || {};
                setTotals({
                    totalActivations: data.totalActivations ?? 0,
                    totalHsi: data.totalHsi ?? 0,
                    totalBts: data.totalBts ?? 0,
                    totalAccessories: data.totalAccessories ?? 0,
                    totalUpgrades: data.totalUpgrades ?? 0,
                    totalMigrations: data.totalMigrations ?? 0,
                    totalFreeLines: data.totalFreeLines ?? 0,
                });
                setSales(data.salesByStore ?? []);
            })
            .catch(() => {
                setTotals(null);
                setSales([]);
            })
            .finally(() => setLoading(false));
    }, [date, companyName]);

    // Stable color assignment (by first appearance in the API's own order), keyed separately
    // per grouping so switching tabs re-sorts bars without repainting an entity's color.
    const colorByEmployeeKey = useMemo(() => {
        const map = new Map<string, { bar: string; onFillLight: "white" | "ink" }>();
        sales.forEach((s) => {
            const key = `${s.employeeName}__${s.dealerStoreId}`;
            if (!map.has(key)) {
                map.set(key, BAR_COLORS[map.size] ?? OVERFLOW_BAR_COLOR);
            }
        });
        return map;
    }, [sales]);

    const colorByStoreKey = useMemo(() => {
        const map = new Map<string, { bar: string; onFillLight: "white" | "ink" }>();
        sales.forEach((s) => {
            if (!map.has(s.dealerStoreId)) {
                map.set(s.dealerStoreId, BAR_COLORS[map.size] ?? OVERFLOW_BAR_COLOR);
            }
        });
        return map;
    }, [sales]);

    const activeTabMeta = BREAKDOWN_TABS.find((t) => t.key === activeBreakdownTab)!;

    const breakdownRows = useMemo(() => {
        if (activeTabMeta.groupBy === "store") {
            // One bar per store - take the first reported actualCash for that store, not a sum,
            // since every employee working that store reports the same till total.
            const byStore = new Map<string, { label: string; sublabel?: string; value: number }>();
            sales.forEach((s) => {
                if (!byStore.has(s.dealerStoreId)) {
                    byStore.set(s.dealerStoreId, { label: s.dealerStoreId, value: s.actualCash });
                }
            });
            return Array.from(byStore.entries())
                .map(([key, row]) => ({ key, ...row, color: colorByStoreKey.get(key) ?? OVERFLOW_BAR_COLOR }))
                .sort((a, b) => b.value - a.value);
        }

        const byEmployee = new Map<string, { label: string; sublabel?: string; value: number }>();
        sales.forEach((s) => {
            const key = `${s.employeeName}__${s.dealerStoreId}`;
            const value = activeBreakdownTab === "accessories" ? s.accessories : s.boxesSold;
            const existing = byEmployee.get(key);
            if (existing) {
                existing.value += value;
            } else {
                byEmployee.set(key, { label: s.employeeName, sublabel: s.dealerStoreId, value });
            }
        });
        return Array.from(byEmployee.entries())
            .map(([key, row]) => ({ key, ...row, color: colorByEmployeeKey.get(key) ?? OVERFLOW_BAR_COLOR }))
            .sort((a, b) => b.value - a.value);
    }, [sales, activeBreakdownTab, activeTabMeta.groupBy, colorByEmployeeKey, colorByStoreKey]);

    const maxBreakdownValue = Math.max(1, ...breakdownRows.map((r) => r.value));

    const sortedSales = useMemo(() => {
        const copy = [...sales];
        copy.sort((a, b) => {
            let cmp = 0;
            switch (sort.key) {
                case "dealerStoreId": cmp = a.dealerStoreId.localeCompare(b.dealerStoreId); break;
                case "employeeName": cmp = a.employeeName.localeCompare(b.employeeName); break;
                case "saleVerified": cmp = Number(a.saleVerified) - Number(b.saleVerified); break;
                default: cmp = (a[sort.key] as number) - (b[sort.key] as number);
            }
            return sort.direction === "asc" ? cmp : -cmp;
        });
        return copy;
    }, [sales, sort]);

    const toggleSort = (key: SortKey) => {
        setSort((prev) => prev.key === key
            ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
            : { key, direction: "desc" });
    };

    if (!date) { return null; }

    return (
        <div className="w-full max-w-7xl mb-8 space-y-4">
            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-300 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No EODs submitted for this date.</p>
                </div>
            ) : (
                <>
                    {totals && (
                        <section className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Summary Totals
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <StatCard label="Activations" value={totals.totalActivations} tone="blue" />
                                <StatCard label="Upgrades" value={totals.totalUpgrades} tone="yellow" />
                                <StatCard label="Migrations" value={totals.totalMigrations} tone="violet" />
                                <StatCard label="Total Accessories" value={money(totals.totalAccessories)} tone="green" />
                                <StatCard label="HSI / BTS" value={totals.totalHsi + totals.totalBts} tone="aqua" />
                                <StatCard label="Free Lines" value={totals.totalFreeLines} tone="magenta" />
                            </div>
                        </section>
                    )}

                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-700 p-4 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Store Breakdown
                        </h3>
                        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                            {BREAKDOWN_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveBreakdownTab(tab.key)}
                                    className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                        activeBreakdownTab === tab.key
                                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activeTabMeta.label} by {activeTabMeta.groupBy === "store" ? "Store" : "Employee"}
                        </p>
                        <div className="space-y-2">
                            {breakdownRows.map((row) => {
                                const pct = Math.min(100, Math.max(0, (row.value / maxBreakdownValue) * 100));
                                const display = activeTabMeta.isCurrency ? money(row.value) : `${row.value}`;
                                const hasFill = row.value > 0;
                                // A bar only has room to hold its own label once it's wide enough - below
                                // that, the label would get clipped by the track's overflow, so it rides
                                // in the track's remaining flex space just after the fill instead.
                                const labelFitsInside = pct >= 65;
                                return (
                                    <div
                                        key={row.key}
                                        className="flex items-center gap-3 text-sm"
                                        title={`${row.label}${row.sublabel ? ` · ${row.sublabel}` : ""} · ${display}`}
                                    >
                                        <span className="w-32 sm:w-40 shrink-0 truncate text-gray-700 dark:text-gray-200">{row.label}</span>
                                        <div className="flex-1 h-6 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center">
                                            {hasFill && labelFitsInside && (
                                                <div
                                                    className={`h-full flex items-center justify-end pr-2 transition-all ${row.color.bar}`}
                                                    style={{ width: `${pct}%`, borderRadius: "0 4px 4px 0" }}
                                                >
                                                    <span className={`text-xs font-semibold whitespace-nowrap ${row.color.onFillLight === "white" ? "text-white" : "text-gray-900"}`}>
                                                        {display}
                                                    </span>
                                                </div>
                                            )}
                                            {hasFill && !labelFitsInside && (
                                                <>
                                                    <div
                                                        className={`h-full shrink-0 transition-all ${row.color.bar}`}
                                                        style={{ width: `${pct}%`, borderRadius: "0 4px 4px 0" }}
                                                    />
                                                    <span className="pl-2 text-xs font-semibold whitespace-nowrap text-gray-700 dark:text-gray-200">
                                                        {display}
                                                    </span>
                                                </>
                                            )}
                                            {!hasFill && (
                                                <span className="pl-2 text-xs text-gray-400 dark:text-gray-500">
                                                    {display}
                                                </span>
                                            )}
                                        </div>
                                        {row.sublabel && (
                                            <span className="w-16 shrink-0 text-right text-xs text-gray-400 dark:text-gray-500">{row.sublabel}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-700 p-4 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Sale Records
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="p-2 w-6" />
                                        <SortableHeader label="Sale ID" sortKey="saleId" sort={sort} onSort={toggleSort} align="left" />
                                        <SortableHeader label="Store" sortKey="dealerStoreId" sort={sort} onSort={toggleSort} align="left" />
                                        <SortableHeader label="Employee" sortKey="employeeName" sort={sort} onSort={toggleSort} align="left" />
                                        <SortableHeader label="Boxes" sortKey="boxesSold" sort={sort} onSort={toggleSort} />
                                        <SortableHeader label="Upgrades" sortKey="upgrade" sort={sort} onSort={toggleSort} />
                                        <SortableHeader label="Accessories ($)" sortKey="accessories" sort={sort} onSort={toggleSort} />
                                        <SortableHeader label="Actual Cash ($)" sortKey="actualCash" sort={sort} onSort={toggleSort} />
                                        <SortableHeader label="Expense ($)" sortKey="cashExpense" sort={sort} onSort={toggleSort} />
                                        <SortableHeader label="Verified" sortKey="saleVerified" sort={sort} onSort={toggleSort} align="center" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSales.map((s) => {
                                        const expanded = expandedSaleId === s.saleId;
                                        return (
                                            <Fragment key={s.saleId}>
                                                <tr
                                                    onClick={() => setExpandedSaleId(expanded ? null : s.saleId)}
                                                    className="border-t border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
                                                >
                                                    <td className="p-2 text-gray-400">
                                                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </td>
                                                    <td className="p-2">{s.saleId}</td>
                                                    <td className="p-2 font-medium">{s.dealerStoreId}</td>
                                                    <td className="p-2">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            {s.employeeName}
                                                            {s.envelopeMissing && (
                                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-label="Envelope missing" />
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-center">{s.boxesSold}</td>
                                                    <td className="p-2 text-center">{s.upgrade}</td>
                                                    <td className="p-2 text-right">{money(s.accessories)}</td>
                                                    <td className="p-2 text-right">{money(s.actualCash)}</td>
                                                    <td className={`p-2 text-right font-semibold ${s.cashExpense > 100 ? "text-red-500" : s.cashExpense > 0 ? "text-red-400" : "text-gray-400"}`}>
                                                        {s.cashExpense > 0 ? `-${money(s.cashExpense)}` : "-"}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <VerifiedBadge verified={s.saleVerified} />
                                                    </td>
                                                </tr>
                                                {expanded && (
                                                    <tr className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                                                        <td colSpan={10} className="p-3">
                                                            <SaleDetail sale={s} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

const STAT_TONES: Record<string, string> = {
    blue: "text-blue-700 dark:text-blue-400",
    yellow: "text-amber-600 dark:text-amber-400",
    violet: "text-violet-700 dark:text-violet-400",
    green: "text-emerald-700 dark:text-emerald-400",
    aqua: "text-teal-600 dark:text-teal-400",
    magenta: "text-pink-600 dark:text-pink-400",
};

function StatCard({ label, value, tone }: { label: string; value: number | string; tone: keyof typeof STAT_TONES }) {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 flex flex-col gap-0.5">
            <span className={`text-lg sm:text-xl font-bold ${STAT_TONES[tone]}`}>{value}</span>
            <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">{label}</span>
        </div>
    );
}

function SortableHeader({
    label, sortKey, sort, onSort, align = "center",
}: {
    label: string;
    sortKey: SortKey;
    sort: { key: SortKey; direction: SortDirection };
    onSort: (key: SortKey) => void;
    align?: "left" | "center";
}) {
    const active = sort.key === sortKey;
    return (
        <th
            className={`p-2 select-none cursor-pointer whitespace-nowrap ${align === "left" ? "text-left" : "text-center"}`}
            onClick={() => onSort(sortKey)}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                <span className={`text-[10px] ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {active ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                </span>
            </span>
        </th>
    );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                verified
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
            }`}
        >
            {verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {verified ? "Yes" : "No"}
        </span>
    );
}

function SaleDetail({ sale }: { sale: SaleSummary }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
                <p className="font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide text-[10px]">System vs Actual</p>
                <DetailRow label="System Cash" value={money(sale.systemCash)} />
                <DetailRow label="Actual Cash" value={money(sale.actualCash)} />
                <DetailRow label="System Card" value={money(sale.systemCard)} />
                <DetailRow label="Actual Card" value={money(sale.actualCard)} />
                <DetailRow label="System Accessories" value={money(sale.systemAccessories)} />
                <DetailRow label="Accessories" value={money(sale.accessories)} />
                <DetailRow label="Credit Card" value={money(sale.creditCard)} />
                <DetailRow label="Debit Card" value={money(sale.debitCard)} />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide text-[10px]">Activity</p>
                <DetailRow label="Migrations" value={sale.migrations} />
                <DetailRow label="Tablets Sold" value={sale.tabletsSold} />
                <DetailRow label="Watches Sold" value={sale.watchesSold} />
                <DetailRow label="HSI Sold" value={sale.hsiSold} />
                <DetailRow label="Sale Date" value={sale.saleDate} />
                <DetailRow label="Last Transaction" value={formatSaleDateTime(sale.saleDate, sale.lastTransactionTime)} />
                <DetailRow label="Verified w/ RTPOS" value={sale.saleVerifiedWithRtpos ? "Yes" : "No"} />
                <DetailRow label="Envelope Missing" value={sale.envelopeMissing ? "Yes" : "No"} warn={sale.envelopeMissing} />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide text-[10px]">
                    Expenses {sale.expenses.length > 0 ? `(${sale.expenses.length})` : ""}
                </p>
                {sale.expenses.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500">No expenses logged.</p>
                ) : (
                    <div className="space-y-1.5">
                        {sale.expenses.map((exp) => (
                            <div key={exp.id} className="rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 bg-white dark:bg-gray-800">
                                <div className="flex items-center justify-between font-semibold text-gray-700 dark:text-gray-200">
                                    <span>{money(exp.amount)} · {exp.expenseType}</span>
                                    <span className="text-gray-400 dark:text-gray-500 font-normal">{exp.paymentType}</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 truncate">{exp.reason}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({ label, value, warn = false }: { label: string; value: string | number; warn?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`font-medium ${warn ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-gray-100"}`}>{value}</span>
        </div>
    );
}
