"use client";

import { useState } from "react";

interface Invoice {
    customerAccountNumber: string;
    invoicedStore: string;
    invoicedEmployee: string;
    invoicedDate: string;
    invoicedAmount: number;
}

interface StoreInvoiceData {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    totalInvoicesPrice: number;
    invoices: Invoice[];
}

export default function InvoicesDisplayTable({ data }: { data: StoreInvoiceData[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleExpand = (storeId: string) => {
        setExpanded(prev => (prev === storeId ? null : storeId));
    };

    const totalAll = data.reduce((sum, s) => sum + s.totalInvoicesPrice, 0);

    return (
        <div className="mt-10">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">📄 Invoiced Upgrades</h2>

            <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                        <tr>
                            <th className="p-3 text-left">Store</th>
                            <th className="p-3 text-left">Dealer ID</th>
                            <th className="p-3 text-right">Total Amount ($)</th>
                            <th className="p-3 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, idx) => (
                            <tr key={idx} className="bg-white dark:bg-gray-900 border-t">
                                <td className="p-3">{entry.store.storeName}</td>
                                <td className="p-3">{entry.store.dealerStoreId}</td>
                                <td className="p-3 text-right font-semibold text-blue-600 dark:text-blue-300">
                                    ${entry.totalInvoicesPrice.toFixed(2)}
                                </td>
                                <td className="p-3 text-center">
                                    {entry.invoices.length > 0 ? (
                                        <button
                                            onClick={() => toggleExpand(entry.store.dealerStoreId)}
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            {expanded === entry.store.dealerStoreId ? "Hide" : "View"}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 italic">No Invoices</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        <tr className="bg-gray-200 dark:bg-gray-800 font-bold text-gray-800 dark:text-white">
                            <td colSpan={2} className="p-3 text-right">
                                Grand Total
                            </td>
                            <td className="p-3 text-right">${totalAll.toFixed(2)}</td>
                            <td />
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Expanded invoice rows */}
            {expanded && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800 border rounded-md p-4">
                    <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Details for: {expanded}</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                <tr>
                                    <th className="p-2">Account #</th>
                                    <th className="p-2">Employee</th>
                                    <th className="p-2">Invoiced Date</th>
                                    <th className="p-2 text-right">Amount ($)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data
                                    .find(d => d.store.dealerStoreId === expanded)
                                    ?.invoices.map((inv, idx) => (
                                        <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                                            <td className="p-2">{inv.customerAccountNumber}</td>
                                            <td className="p-2">{inv.invoicedEmployee}</td>
                                            <td className="p-2">{inv.invoicedDate}</td>
                                            <td className="p-2 text-right">${inv.invoicedAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
