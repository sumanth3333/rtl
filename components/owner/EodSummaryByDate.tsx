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
    expenseReason: string;
    lastTransactionTime: string;
}

interface Props {
    date: string;
    companyName: string;
}

export default function EodSummaryByDate({ date, companyName }: Props) {
    const [sales, setSales] = useState<SaleSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!companyName || !date) { return };

        setLoading(true);
        apiClient
            .get("/sale/fetchSubmittedSalesByDate", {
                params: {
                    companyName,
                    date,
                },
            })
            .then((res) => setSales(res.data))
            .catch(() => setSales([]))
            .finally(() => setLoading(false));
    }, [date, companyName]);

    if (!date) { return null; }

    return (
        <div className="w-full max-w-7xl mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-300 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">
                Submitted EOD Reports for <span className="text-blue-600">{date}</span>
            </h2>

            {loading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : sales.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No EODs submitted for this date.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            <tr>
                                <th className="p-2 text-left">Store</th>
                                <th className="p-2 text-left">Employee</th>
                                <th className="p-2">Activations</th>
                                <th className="p-2">Upgrade</th>
                                <th className="p-2">BTS</th>
                                <th className="p-2">HSI</th>
                                <th className="p-2">Free Lines</th>
                                <th className="p-2">Migrations</th>
                                <th className="p-2 text-right">Accessories</th>
                                <th className="p-2 text-right">System Cash</th>
                                <th className="p-2 text-right">System Card</th>
                                <th className="p-2 text-right">Actual Cash</th>
                                <th className="p-2 text-right">Actual Card</th>
                                <th className="p-2 text-right text-red-600">Cash Expense</th>
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
                                    <td
                                        className="p-2 text-xs max-w-[200px] truncate"
                                        title={s.expenseReason === null ? "AUTO SUBMIT" : s.expenseReason}
                                    >
                                        {s.expenseReason === null ? (
                                            <span className="text-yellow-700 font-semibold bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                                                AUTO SUBMIT
                                            </span>
                                        ) : s.expenseReason.length > 40 ? (
                                            `${s.expenseReason.slice(0, 40)}...`
                                        ) : (
                                            s.expenseReason
                                        )}
                                    </td>
                                    <td className="p-2 text-center text-sm">{s.lastTransactionTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
