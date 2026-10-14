"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarDaysIcon,
    ChartBarIcon,
    BuildingStorefrontIcon,
    UserGroupIcon,
    DevicePhoneMobileIcon,
    ArrowUpCircleIcon,
    ArrowsRightLeftIcon,
    ShoppingBagIcon,
    DeviceTabletIcon,
    WifiIcon,
    PhoneIcon,
    ArchiveBoxIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useOwner } from "@/hooks/useOwner";
import { fetchDateRangeMetrics } from "@/services/owner/metricReportService";
import { StoreDateRangeMetric, EmployeeDateRangeMetric } from "@/types/metricReportTypes";
import MetricReportTable, { MetricReportRow } from "@/components/owner/metric-report/MetricReportTable";

type DatePreset = "thisMonth" | "lastMonth" | "custom";

const toISODate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split("T")[0];

const getThisMonthRange = () => {
    const now = new Date();
    return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: toISODate(now),
    };
};

const getLastMonthRange = () => {
    const now = new Date();
    return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: toISODate(new Date(now.getFullYear(), now.getMonth(), 0)), // day 0 = last day of previous month
    };
};

const formatDisplayDate = (value: string) => {
    if (!value) {
        return "—";
    }
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const toStoreRow = (item: StoreDateRangeMetric): MetricReportRow => ({
    key: item.store.dealerStoreId,
    primaryLabel: item.store.storeName,
    secondaryLabel: item.store.dealerStoreId,
    activations: item.activations,
    upgrades: item.upgrades,
    migration: item.migration,
    accessories: item.accessories,
    bts: item.bts,
    hsi: item.hsi,
    freelines: item.freelines,
    totalActivations: item.totalActivations,
    totalBoxes: item.totalBoxes,
});

const toEmployeeRow = (item: EmployeeDateRangeMetric): MetricReportRow => ({
    key: item.employee.employeeNtid,
    primaryLabel: item.employee.employeeName.trim(),
    secondaryLabel: item.employee.employeeNtid,
    activations: item.activations,
    upgrades: item.upgrades,
    migration: item.migration,
    accessories: item.accessories,
    bts: item.bts,
    hsi: item.hsi,
    freelines: item.freelines,
    totalActivations: item.totalActivations,
    totalBoxes: item.totalBoxes,
});

export default function MetricReportByDateRangePage() {
    const { companyName } = useOwner();

    const [datePreset, setDatePreset] = useState<DatePreset>("thisMonth");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [storeRows, setStoreRows] = useState<MetricReportRow[]>([]);
    const [employeeRows, setEmployeeRows] = useState<MetricReportRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const today = toISODate(new Date());

    const fetchReport = async (from: string, to: string) => {
        if (!companyName || !from || !to) {
            return;
        }
        setLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const data = await fetchDateRangeMetrics(companyName, from, to);
            setStoreRows((data.stores || []).map(toStoreRow));
            setEmployeeRows((data.employees || []).map(toEmployeeRow));
        } catch (err) {
            console.error("❌ Failed to fetch date range metrics:", err);
            setStoreRows([]);
            setEmployeeRows([]);
            setError(err instanceof Error && err.message ? err.message : "Failed to load the metric report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Default to "This Month" and load immediately so the report is useful on arrival
    useEffect(() => {
        const { start, end } = getThisMonthRange();
        setFromDate(start);
        setToDate(end);
    }, []);

    useEffect(() => {
        if (fromDate && toDate && !hasSearched) {
            fetchReport(fromDate, toDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);

    const applyPreset = (preset: DatePreset) => {
        setDatePreset(preset);
        if (preset === "thisMonth") {
            const { start, end } = getThisMonthRange();
            setFromDate(start);
            setToDate(end);
            fetchReport(start, end);
        } else if (preset === "lastMonth") {
            const { start, end } = getLastMonthRange();
            setFromDate(start);
            setToDate(end);
            fetchReport(start, end);
        }
    };

    const totals = useMemo(
        () =>
            storeRows.reduce(
                (acc, row) => {
                    acc.activations += row.activations;
                    acc.upgrades += row.upgrades;
                    acc.migration += row.migration;
                    acc.accessories += row.accessories;
                    acc.bts += row.bts;
                    acc.hsi += row.hsi;
                    acc.freelines += row.freelines;
                    acc.totalBoxes += row.totalBoxes;
                    return acc;
                },
                { activations: 0, upgrades: 0, migration: 0, accessories: 0, bts: 0, hsi: 0, freelines: 0, totalBoxes: 0 }
            ),
        [storeRows]
    );

    const kpiTiles = [
        { label: "Activations", value: totals.activations.toLocaleString("en-US"), icon: DevicePhoneMobileIcon },
        { label: "Upgrades", value: totals.upgrades.toLocaleString("en-US"), icon: ArrowUpCircleIcon },
        { label: "Migrations", value: totals.migration.toLocaleString("en-US"), icon: ArrowsRightLeftIcon },
        {
            label: "Accessories",
            value: totals.accessories.toLocaleString("en-US", { style: "currency", currency: "USD" }),
            icon: ShoppingBagIcon,
        },
        { label: "BTS", value: totals.bts.toLocaleString("en-US"), icon: DeviceTabletIcon },
        { label: "HSI", value: totals.hsi.toLocaleString("en-US"), icon: WifiIcon },
        { label: "Free Lines", value: totals.freelines.toLocaleString("en-US"), icon: PhoneIcon },
        { label: "Total Boxes", value: totals.totalBoxes.toLocaleString("en-US"), icon: ArchiveBoxIcon },
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
            <header className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-[#0a0f1c] dark:via-[#0d1324] dark:to-[#0a0f1c] p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-6 w-6 text-blue-500" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Reports</p>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                            Metric Report by Date Range
                        </h1>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Store and employee activations, upgrades, migrations, accessories, and boxes for {companyName || "your company"} over a chosen period.
                </p>
            </header>

            {/* ✅ Date Range Filter */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex flex-col">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            Date Range
                        </label>

                        <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden mb-2">
                            {([
                                ["thisMonth", "This Month"],
                                ["lastMonth", "Last Month"],
                                ["custom", "Custom"],
                            ] as [DatePreset, string][]).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => applyPreset(value)}
                                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${datePreset === value
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {datePreset === "custom" ? (
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    max={today}
                                    className="p-2.5 border rounded-md bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    min={fromDate}
                                    max={today}
                                    className="p-2.5 border rounded-md bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-700 dark:text-gray-300">
                                {formatDisplayDate(fromDate)} <span className="text-gray-400">→</span> {formatDisplayDate(toDate)}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => fetchReport(fromDate, toDate)}
                        disabled={loading || !fromDate || !toDate}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md shadow-sm transition-all ${loading || !fromDate || !toDate
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                            }`}
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Loading..." : "Generate Report"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Couldn&apos;t load the metric report</p>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                </div>
            )}

            {hasSearched && !loading && !error && storeRows.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {kpiTiles.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex flex-col gap-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-3 shadow-sm"
                        >
                            <Icon className="h-4 w-4 text-blue-500" />
                            <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</span>
                            <span className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {loading && storeRows.length === 0 && employeeRows.length === 0 ? (
                <div className="flex justify-center items-center py-16">
                    <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Loading metric report...</p>
                </div>
            ) : (
                hasSearched &&
                !error && (
                    <div className="space-y-5">
                        <MetricReportTable
                            title="Store Performance"
                            icon={BuildingStorefrontIcon}
                            entityLabel="Store"
                            rows={storeRows}
                            accent="blue"
                        />
                        <MetricReportTable
                            title="Employee Performance"
                            icon={UserGroupIcon}
                            entityLabel="Employee"
                            rows={employeeRows}
                            accent="indigo"
                        />
                    </div>
                )
            )}
        </div>
    );
}
