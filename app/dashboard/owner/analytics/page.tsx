"use client";

import { useEffect, useMemo, useState } from "react";
import {
    getMostSoldPhones,
    getMostSoldPlans,
    getSimCardsUsed,
    getTransactionTypeMix,
    DeviceSalesByStore,
    PlanSalesByStore,
    SimUsedByStore,
    TransactionTypeByStore,
} from "@/services/owner/analyticsService";
import { useOwner } from "@/hooks/useOwner";
import { ArrowPathIcon, CalendarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type FetchState = "idle" | "loading" | "error" | "ready";

const fmtNumber = (value: number | undefined) =>
    value === undefined || Number.isNaN(value) ? "—" : new Intl.NumberFormat().format(value);

const todayLocal = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const lastNDays = (days: number) => {
    const end = todayLocal();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    return { start: toDateInputValue(start), end: toDateInputValue(end) };
};

const monthToDate = () => {
    const end = todayLocal();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { start: toDateInputValue(start), end: toDateInputValue(end) };
};

const previousFullMonth = () => {
    const end = todayLocal();
    const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 0);
    return { start: toDateInputValue(start), end: toDateInputValue(last) };
};

function SectionShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode; }) {
    return (
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1424] shadow-sm p-4 space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">{title}</p>
                    {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function StatCard({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent: string; }) {
    return (
        <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f1a2c] shadow-sm">
            <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} aria-hidden />
            <div className="relative p-3 sm:p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">{value}</p>
                {hint && <p className="text-xs text-gray-600 dark:text-gray-400">{hint}</p>}
            </div>
        </div>
    );
}

type BarDatum = { label: string; value: number; rightLabel?: string; subLabel?: string; };

function BarList({ data, max, color }: { data: BarDatum[]; max?: number; color?: string; }) {
    if (!data.length) {
        return <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data for this range.</p>;
    }

    const safeMax = max ?? Math.max(...data.map((d) => d.value), 1);
    const barColor = color || "bg-indigo-500";

    return (
        <div className="space-y-3">
            {data.map((item) => {
                const width = Math.max(8, Math.round((item.value / safeMax) * 100));
                return (
                    <div key={item.label} className="space-y-1">
                        <div className="flex items-baseline justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-200 gap-2">
                            <span className="font-medium truncate" title={item.label}>{item.label}</span>
                            <span className="tabular-nums text-gray-600 dark:text-gray-400">{fmtNumber(item.value)}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
                        </div>
                        {item.subLabel && <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.subLabel}</p>}
                    </div>
                );
            })}
        </div>
    );
}

function TransactionBar({ entry }: { entry: TransactionTypeByStore; }) {
    const total = entry.transactionType.reduce((acc, t) => acc + (t.quantity ?? 0), 0) || 1;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-800 dark:text-gray-200">
                <div className="truncate" title={entry.store.storeName}>{entry.store.storeName}</div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{fmtNumber(total)} total</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                {entry.transactionType.map((item) => {
                    const pct = (item.quantity / total) * 100;
                    const color = item.type === "New Activation" ? "bg-emerald-500" : item.type === "Upgrade" ? "bg-amber-500" : "bg-indigo-500";
                    return (
                        <div key={item.type} className={`${color} h-full`} style={{ width: `${pct}%` }} title={`${item.type}: ${fmtNumber(item.quantity)}`} />
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                {entry.transactionType.map((item) => (
                    <span key={item.type} className="inline-flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-sm ${item.type === "New Activation" ? "bg-emerald-500" : item.type === "Upgrade" ? "bg-amber-500" : "bg-indigo-500"}`} />
                        {item.type} ({fmtNumber(item.quantity)})
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function OwnerAnalyticsPage() {
    const { companyName } = useOwner();

    const defaultRange = useMemo(() => lastNDays(30), []);
    const [startDate, setStartDate] = useState(defaultRange.start);
    const [endDate, setEndDate] = useState(defaultRange.end);

    const [fetchState, setFetchState] = useState<FetchState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [phones, setPhones] = useState<DeviceSalesByStore[]>([]);
    const [plans, setPlans] = useState<PlanSalesByStore[]>([]);
    const [transactions, setTransactions] = useState<TransactionTypeByStore[]>([]);
    const [simUsage, setSimUsage] = useState<SimUsedByStore[]>([]);

    const handleRangePreset = (range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    };

    const loadAnalytics = async () => {
        if (!companyName || !startDate || !endDate) { return; }
        if (startDate > endDate) {
            setErrorMessage("Start date cannot be after end date.");
            return;
        }
        setFetchState("loading");
        setErrorMessage(null);
        try {
            const params = { companyName, startDate, endDate };
            const [phonesRes, plansRes, txRes, simRes] = await Promise.all([
                getMostSoldPhones(params),
                getMostSoldPlans(params),
                getTransactionTypeMix(params),
                getSimCardsUsed(params),
            ]);

            setPhones(Array.isArray(phonesRes) ? phonesRes : []);
            setPlans(Array.isArray(plansRes) ? plansRes : []);
            setTransactions(Array.isArray(txRes) ? txRes : []);
            setSimUsage(Array.isArray(simRes) ? simRes : []);
            setFetchState("ready");
        } catch (error: any) {
            const message = error?.message || "Unable to load analytics right now.";
            setErrorMessage(message);
            setFetchState("error");
        }
    };

    useEffect(() => {
        loadAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName]);

    const totalPhones = useMemo(() => phones.reduce((sum, store) => sum + store.devices.reduce((s, d) => s + (d.quantity || 0), 0), 0), [phones]);
    const totalPlans = useMemo(() => plans.reduce((sum, store) => sum + store.ratePlans.reduce((s, p) => s + (p.quantity || 0), 0), 0), [plans]);
    const totalSimUsed = useMemo(() => simUsage.reduce((sum, entry) => sum + (entry.type.quantity || 0), 0), [simUsage]);
    const transactionTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        transactions.forEach((store) => {
            store.transactionType.forEach((t) => {
                totals[t.type] = (totals[t.type] || 0) + (t.quantity || 0);
            });
        });
        return totals;
    }, [transactions]);

    const topDevices = useMemo(() => {
        const map = new Map<string, number>();
        phones.forEach((store) => {
            store.devices.forEach((d) => {
                map.set(d.device, (map.get(d.device) || 0) + (d.quantity || 0));
            });
        });
        return Array.from(map.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [phones]);

    const topPlans = useMemo(() => {
        const map = new Map<string, number>();
        plans.forEach((store) => {
            store.ratePlans.forEach((p) => {
                map.set(p.planCode, (map.get(p.planCode) || 0) + (p.quantity || 0));
            });
        });
        return Array.from(map.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [plans]);

    const bestStoresByPhones = useMemo(() => {
        return phones
            .map((store) => ({
                label: store.store.storeName,
                value: store.devices.reduce((s, d) => s + (d.quantity || 0), 0),
                subLabel: store.store.dealerStoreId,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [phones]);

    const simUsageList = useMemo(() => simUsage.map((entry) => ({
        label: entry.store.storeName,
        value: entry.type.quantity,
    })), [simUsage]);

    const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

    return (
        <div className="space-y-4">
            <header className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-[#0a0f1c] dark:via-[#0d1324] dark:to-[#0a0f1c] p-4 shadow-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Owner Analytics</p>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Sales intelligence for {companyName || "your company"}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">All metrics respect your device timezone ({timezone}).</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadAnalytics}
                        className="inline-flex items-center gap-2 rounded-md border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-100 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                        aria-busy={fetchState === "loading"}
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${fetchState === "loading" ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Devices Sold" value={fmtNumber(totalPhones)} hint="Top devices across all stores" accent="from-indigo-500/12 via-indigo-400/5 to-transparent" />
                    <StatCard label="Rate Plans Sold" value={fmtNumber(totalPlans)} hint="Combined across stores" accent="from-emerald-500/12 via-emerald-400/5 to-transparent" />
                    <StatCard label="SIMs Used" value={fmtNumber(totalSimUsed)} hint="Sum of SIM activations" accent="from-fuchsia-500/12 via-fuchsia-400/5 to-transparent" />
                    <StatCard
                        label="Activation Mix"
                        value={`${fmtNumber(transactionTotals["New Activation"] || 0)} / ${fmtNumber(transactionTotals["Upgrade"] || 0)}`}
                        hint="New vs Upgrade"
                        accent="from-amber-500/12 via-amber-400/5 to-transparent"
                    />
                </div>
            </header>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1424] shadow-sm p-4 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">Date range</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1" htmlFor="start-date">
                                <CalendarIcon className="h-4 w-4" /> From
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                            />
                            <span className="text-xs text-gray-500">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleRangePreset(monthToDate())}
                            className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Month to date
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRangePreset(lastNDays(30))}
                            className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Last 30 days
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRangePreset(previousFullMonth())}
                            className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Previous month
                        </button>
                        <button
                            type="button"
                            onClick={loadAnalytics}
                            className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 shadow-sm"
                            disabled={fetchState === "loading"}
                        >
                            {fetchState === "loading" ? "Loading..." : "Apply filters"}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="flex items-center gap-2 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 px-3 py-2 text-sm text-rose-700 dark:text-rose-100">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {fetchState === "loading" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fetching analytics...</p>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <SectionShell title="Top Devices" description="Aggregated across all stores">
                    <BarList data={topDevices} color="bg-indigo-500" />
                </SectionShell>

                <SectionShell title="Top Rate Plans" description="Best performing plans">
                    <BarList data={topPlans} color="bg-emerald-500" />
                </SectionShell>

                <SectionShell title="Best Stores by Device Volume" description="Ordered by device units sold">
                    <BarList data={bestStoresByPhones} color="bg-amber-500" />
                </SectionShell>
            </div>

            <SectionShell title="Transaction Mix by Store" description="New activations vs upgrades vs reactivations">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {transactions.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No transaction data for this range.</p>
                    ) : (
                        transactions.map((entry) => <TransactionBar key={entry.store.dealerStoreId} entry={entry} />)
                    )}
                </div>
            </SectionShell>

            <div className="grid gap-4 lg:grid-cols-2">
                <SectionShell title="Most Sold Devices by Store" description="Per-store top 5 devices">
                    <div className="grid gap-4 md:grid-cols-2">
                        {phones.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No device sales for this range.</p>
                        )}
                        {phones.map((store) => (
                            <div key={store.store.dealerStoreId} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0f1a2c] p-3 space-y-2">
                                <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
                                    <span className="truncate" title={store.store.storeName}>{store.store.storeName}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{store.store.dealerStoreId}</span>
                                </div>
                                <BarList
                                    data={store.devices
                                        .sort((a, b) => b.quantity - a.quantity)
                                        .slice(0, 5)
                                        .map((d) => ({ label: d.device, value: d.quantity }))}
                                />
                            </div>
                        ))}
                    </div>
                </SectionShell>

                <SectionShell title="Most Sold Plans by Store" description="Per-store top 5 plans">
                    <div className="grid gap-4 md:grid-cols-2">
                        {plans.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No plan sales for this range.</p>
                        )}
                        {plans.map((store) => (
                            <div key={store.store.dealerStoreId} className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0f1a2c] p-3 space-y-2">
                                <div className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
                                    <span className="truncate" title={store.store.storeName}>{store.store.storeName}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{store.store.dealerStoreId}</span>
                                </div>
                                <BarList
                                    data={store.ratePlans
                                        .sort((a, b) => b.quantity - a.quantity)
                                        .slice(0, 5)
                                        .map((p) => ({ label: p.planCode, value: p.quantity }))}
                                    color="bg-emerald-500"
                                />
                            </div>
                        ))}
                    </div>
                </SectionShell>
            </div>

            <SectionShell title="SIM Usage" description="SIMs consumed per store">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {simUsageList.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No SIM usage data.</p>
                    ) : (
                        simUsageList.map((item) => (
                            <div key={item.label} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f1a2c] p-3">
                                <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 truncate" title={item.label}>{item.label}</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{fmtNumber(item.value)}</p>
                            </div>
                        ))
                    )}
                </div>
            </SectionShell>
        </div>
    );
}
