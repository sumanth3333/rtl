"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import Button from "@/components/ui/Button";
import { useOwner } from "@/hooks/useOwner";
import { fetchRtposReport } from "@/services/rtposReportService";
import { RtposStoreReport } from "@/types/rtposReport";

type DateRange = { start: string; end: string };
type Preset = "lastWeek" | "monthToDate" | "lastMonth" | "custom";

export default function OwnerRtposReportPage() {
    const { companyName } = useOwner();
    const today = useMemo(() => new Date(), []);

    const computeRange = (preset: Preset): DateRange => {
        if (preset === "lastWeek") {
            const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
            const prevWeekStart = subWeeks(currentWeekStart, 1);
            const prevWeekEnd = addDays(prevWeekStart, 6); // Saturday
            return { start: format(prevWeekStart, "yyyy-MM-dd"), end: format(prevWeekEnd, "yyyy-MM-dd") };
        }
        if (preset === "monthToDate") {
            return { start: format(startOfMonth(today), "yyyy-MM-dd"), end: format(today, "yyyy-MM-dd") };
        }
        if (preset === "lastMonth") {
            const lastMonthDate = subMonths(today, 1);
            return { start: format(startOfMonth(lastMonthDate), "yyyy-MM-dd"), end: format(endOfMonth(lastMonthDate), "yyyy-MM-dd") };
        }
        // custom fallback
        return { start: format(subDays(today, 30), "yyyy-MM-dd"), end: format(today, "yyyy-MM-dd") };
    };

    const [selectedPreset, setSelectedPreset] = useState<Preset>("lastWeek");
    const [range, setRange] = useState<DateRange>(() => computeRange("lastWeek"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<RtposStoreReport[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!companyName) { return; }
        handleFetch(companyName, range);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName]); // fetch once when owner company is known

    const handleFetch = async (company: string, dateRange: DateRange) => {
        if (!company || !dateRange.start || !dateRange.end) {
            setError("Select a date range to continue.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const resp = await fetchRtposReport(company, dateRange.start, dateRange.end);
            setData(resp);
        } catch (err: any) {
            setError(err?.message || "Failed to load report");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const totals = useMemo(() => {
        const base = {
            activations: 0,
            upgrades: 0,
            accessories: 0,
            bts: 0,
            hsi: 0,
        };
        data.forEach((store) => {
            store.eodDetails.forEach((eod) => {
                base.activations += eod.rtposSale.phoneActivationsAndReactivations || 0;
                base.upgrades += eod.rtposSale.upgrades || 0;
                base.accessories += eod.rtposSale.systemAccessories || 0;
                base.bts += eod.rtposSale.bts || 0;
                base.hsi += eod.rtposSale.hsi || 0;
            });
        });
        return base;
    }, [data]);

    const storeTotals = (store: RtposStoreReport) => {
        return store.eodDetails.reduce(
            (acc, eod) => {
                acc.cash += eod.systemCash || 0;
                acc.card += eod.systemCard || 0;
                acc.activations += eod.rtposSale.phoneActivationsAndReactivations || 0;
                acc.upgrades += eod.rtposSale.upgrades || 0;
                acc.accessories += eod.rtposSale.systemAccessories || 0;
                acc.bts += eod.rtposSale.bts || 0;
                acc.hsi += eod.rtposSale.hsi || 0;
                return acc;
            },
            { cash: 0, card: 0, activations: 0, upgrades: 0, accessories: 0, bts: 0, hsi: 0 }
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Owner Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Verified RTPOS Sales</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Store-level activations, upgrades, accessories, BTS and HSI within a selected window.</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="text-sm text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                        {companyName || "No company found"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {[
                            { key: "lastWeek", label: "Prev Sun–Sat" },
                            { key: "monthToDate", label: "Month to Date" },
                            { key: "lastMonth", label: "Last Month" },
                            { key: "custom", label: "Custom" },
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => {
                                    const preset = opt.key as Preset;
                                    setSelectedPreset(preset);
                                    const nextRange = computeRange(preset);
                                    setRange(nextRange);
                                    if (preset !== "custom" && companyName) {
                                        handleFetch(companyName, nextRange);
                                    }
                                }}
                                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                                    selectedPreset === opt.key
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200 hover:border-indigo-300"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <input
                        type="date"
                        value={range.start}
                        onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400"
                    />
                    <input
                        type="date"
                        value={range.end}
                        onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400"
                    />
                    <Button
                        onClick={() => {
                            setSelectedPreset("custom");
                            companyName && handleFetch(companyName, range);
                        }}
                        disabled={loading || !companyName}
                    >
                        {loading ? "Loading..." : "Fetch"}
                    </Button>
                </div>
            </header>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {!loading && data.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-300">
                    Select a date window and click Fetch to view verified RTPOS sales.
                </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                    { label: "Activations", value: totals.activations },
                    { label: "Upgrades", value: totals.upgrades },
                    { label: "Accessories", value: totals.accessories.toFixed(2) },
                    { label: "BTS", value: totals.bts },
                    { label: "HSI", value: totals.hsi },
                ].map((card) => (
                    <div key={card.label} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white p-4 shadow-md">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-300">{card.label}</p>
                        <p className="text-2xl font-semibold mt-1">{card.value}</p>
                        <p className="text-xs text-slate-400">In selected range</p>
                    </div>
                ))}
            </section>

            <div className="space-y-6">
                {data.map((store) => (
                    <div key={store.store.dealerStoreId} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Store</p>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{store.store.storeName}</h3>
                                <p className="text-xs font-mono text-gray-500">{store.store.dealerStoreId}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-300">
                                <span>Dates: {range.start || "—"} → {range.end || "—"}</span>
                                <span className="hidden md:inline">•</span>
                                <span>Total days: {store.eodDetails.length}</span>
                                <span className="hidden md:inline">•</span>
                                {(() => {
                                    const t = storeTotals(store);
                                    return (
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">A:{t.activations}</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">U:{t.upgrades}</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">Acc:${t.accessories.toFixed(0)}</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">BTS:{t.bts}</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">HSI:{t.hsi}</span>
                                        </div>
                                    );
                                })()}
                                <button
                                    type="button"
                                    onClick={() => setExpanded((prev) => ({ ...prev, [store.store.dealerStoreId]: !prev[store.store.dealerStoreId] }))}
                                    className="ml-auto text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 text-sm font-semibold"
                                >
                                    {expanded[store.store.dealerStoreId] ? "Hide details" : "Show details"}
                                </button>
                            </div>
                        </div>

                        {expanded[store.store.dealerStoreId] && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Date</th>
                                            <th className="px-3 py-2 text-right">System Cash</th>
                                            <th className="px-3 py-2 text-right">System Card</th>
                                            <th className="px-3 py-2 text-right">Activations</th>
                                            <th className="px-3 py-2 text-right">Upgrades</th>
                                            <th className="px-3 py-2 text-right">Accessories</th>
                                            <th className="px-3 py-2 text-right">BTS</th>
                                            <th className="px-3 py-2 text-right">HSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {store.eodDetails.map((eod) => (
                                            <tr key={eod.date} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                                                <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{format(parseISO(eod.date), "MMM dd")}</td>
                                                <td className="px-3 py-2 text-right font-mono text-xs">{eod.systemCash.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right font-mono text-xs">{eod.systemCard.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right">{eod.rtposSale.phoneActivationsAndReactivations}</td>
                                                <td className="px-3 py-2 text-right">{eod.rtposSale.upgrades}</td>
                                                <td className="px-3 py-2 text-right">{eod.rtposSale.systemAccessories.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right">{eod.rtposSale.bts}</td>
                                                <td className="px-3 py-2 text-right">{eod.rtposSale.hsi}</td>
                                            </tr>
                                        ))}
                                        {(() => {
                                            const t = storeTotals(store);
                                            return (
                                                <tr className="bg-gray-100/70 dark:bg-gray-900/50 font-semibold text-gray-900 dark:text-gray-100">
                                                    <td className="px-3 py-2 text-left">Store Total</td>
                                                    <td className="px-3 py-2 text-right font-mono text-xs">{t.cash.toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-right font-mono text-xs">{t.card.toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-right">{t.activations}</td>
                                                    <td className="px-3 py-2 text-right">{t.upgrades}</td>
                                                    <td className="px-3 py-2 text-right">{t.accessories.toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-right">{t.bts}</td>
                                                    <td className="px-3 py-2 text-right">{t.hsi}</td>
                                                </tr>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
