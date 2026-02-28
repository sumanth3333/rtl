"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/api/apiClient";

interface SaleSummary {
    saleId: number;
    dealerStoreId: string;
    employeeName: string;
    boxesSold: number;
    accessories: number;
    upgrade: number;
    tabletsSold: number;
    hsiSold: number;
    watchesSold: number;
    migrations: number;
    systemCash: number;
    systemCard: number;
    actualCash: number;
    actualCard: number;
    cashExpense: number;
    expenseReason: string | null;
    lastTransactionTime: string;
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

export default function EodSummaryByDate({ date, companyName }: Props) {
    const [sales, setSales] = useState<SaleSummary[]>([]);
    const [totals, setTotals] = useState<SalesResponseTotals | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (!date) { return null; }

    return (
        <div className="w-full max-w-7xl mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-300 dark:border-gray-700">
            {/* <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Submitted EOD Reports for <span className="text-blue-600">{date}</span>
            </h2> */}

            {loading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : sales.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No EODs submitted for this date.</p>
            ) : (
                <>
                    {totals && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 text-sm">
                            <Stat label="Activations" value={totals.totalActivations} />
                            <Stat label="Upgrades" value={totals.totalUpgrades} />
                            <Stat label="BTS" value={totals.totalBts} />
                            <Stat label="HSI" value={totals.totalHsi} />
                            <Stat label="Migrations" value={totals.totalMigrations} />
                            <Stat label="Acc $" value={totals.totalAccessories} isCurrency />
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                <tr>
                                    <th className="p-2 text-left">Store</th>
                                    <th className="p-2 text-left">Employee</th>
                                    <th className="p-2">Acts</th>
                                    <th className="p-2">Upg</th>
                                    <th className="p-2">BTS</th>
                                    <th className="p-2">HSI</th>
                                    <th className="p-2">FreeLines</th>
                                    <th className="p-2">MiM</th>
                                    <th className="p-2 text-right">Accessories</th>
                                    <th className="p-2 text-right">SystemCash</th>
                                    <th className="p-2 text-right">SystemCard</th>
                                    <th className="p-2 text-right">ActualCash</th>
                                    <th className="p-2 text-right">ActualCard</th>
                                    <th className="p-2 text-right text-red-600">Expenses</th>
                                    <th className="p-2 text-left">Reason</th>
                                    <th className="p-2 text-center">Last Txn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((s) => (
                                    <tr
                                        key={s.saleId}
                                        className="border-t border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                                    >
                                        <td className="p-2">{s.dealerStoreId}</td>
                                        <td className="p-2">{s.employeeName}</td>
                                        <td className="p-2 text-center">{s.boxesSold}</td>
                                        <td className="p-2 text-center">{s.upgrade}</td>
                                        <td className="p-2 text-center">{s.tabletsSold}</td>
                                        <td className="p-2 text-center">{s.hsiSold}</td>
                                        <td className="p-2 text-center">{s.watchesSold}</td>
                                        <td className="p-2 text-center">{s.migrations}</td>
                                        <td className="p-2 text-right">${s.accessories.toFixed(2)}</td>
                                        <td className="p-2 text-right">${s.systemCash.toFixed(2)}</td>
                                        <td className="p-2 text-right">${s.systemCard.toFixed(2)}</td>
                                        <td className="p-2 text-right">${s.actualCash.toFixed(2)}</td>
                                        <td className="p-2 text-right">${s.actualCard.toFixed(2)}</td>
                                        <td className={`p-2 text-right font-semibold ${s.cashExpense > 100 ? "text-red-500" : "text-red-400"}`}>
                                            {s.cashExpense > 0 ? `-$${s.cashExpense.toFixed(2)}` : "-"}
                                        </td>
                                        {(() => {
                                            const reason = s.expenseReason ?? "";
                                            const isAuto = s.expenseReason === null;
                                            return (
                                                <td
                                                    className="p-2 text-xs max-w-[200px] truncate"
                                                    title={isAuto ? "AUTO SUBMIT" : reason || "—"}
                                                >
                                                    {isAuto ? (
                                                        <span className="text-yellow-700 font-semibold bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                                                            AUTO SUBMIT
                                                        </span>
                                                    ) : reason.length > 40 ? (
                                                        `${reason.slice(0, 40)}...`
                                                    ) : (
                                                        reason || "—"
                                                    )}
                                                </td>
                                            );
                                        })()}
                                        <td className="p-2 text-center text-sm">{s.lastTransactionTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function Stat({ label, value, isCurrency = false }: { label: string; value: number; isCurrency?: boolean }) {
    return (
        <div className="rounded-lg border border-indigo-100 dark:border-slate-700 bg-indigo-50/60 dark:bg-slate-800 px-3 py-2 flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-[0.08em] text-indigo-700 dark:text-slate-300 font-semibold">{label}</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {isCurrency ? `$${value.toFixed(2)}` : value}
            </span>
        </div>
    );
}
