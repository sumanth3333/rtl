"use client";
import { SaleHistory } from "@/types/cashCollectionTypes";
import { useMemo, useState } from "react";
import apiClient from "@/services/api/apiClient";
import { toast } from "react-toastify";

interface SaleHistoryRowProps {
    sale: SaleHistory;
    store: string;
}

export default function SaleHistoryRow({ sale, store }: SaleHistoryRowProps) {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    // local UI state for toggles
    const [envelopeMissing, setEnvelopeMissing] = useState<boolean>(!!sale.envelopeMissing);

    const saleDate = useMemo(() => sale.saleDate, [sale.saleDate]); // must be yyyy-mm-dd (recommended)

    const handleAddExpense = async (expenseIndex: number) => {
        const expense = sale.expenses[expenseIndex];

        const payload = {
            dealerStoreId: store,
            expenses: [
                {
                    paidFor: expense.reason,
                    amount: expense.amount,
                    month: sale.saleDate.slice(0, 7),
                    paidDate: sale.saleDate,
                },
            ],
        };

        try {
            setLoadingIndex(expenseIndex);
            await apiClient.post("/expense/saveStoreExpenses", payload);
            toast.success(`Expense "${expense.reason}" added.`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to add expense.");
        } finally {
            setLoadingIndex(null);
        }
    };

    // const handleToggleSaleVerified = async () => {
    // if your backend ONLY "marks as verified" (no unverify), block turning it off
    //     if (saleVerified) return;

    //     try {
    //         setSaleVerified(true); // optimistic
    //         await apiClient.post("/company/saleVerified", null, {
    //             params: { dealerStoreId: store, date: saleDate },
    //         });
    //         toast.success("Marked as Verified.");
    //     } catch (err: any) {
    //         setSaleVerified(false); // rollback
    //         toast.error(err?.response?.data?.message || "Failed to update sale verified.");
    //     }
    // };

    const handleToggleEnvelopeMissing = async () => {
        // if your backend ONLY "marks as missing" (no unmark), block turning it off
        if (envelopeMissing) { return; }

        try {
            setEnvelopeMissing(true); // optimistic
            await apiClient.post("/company/envelopeMissing", null, {
                params: { dealerStoreId: store, date: saleDate },
            });
            toast.success("Marked as Collected.");
        } catch (err: any) {
            setEnvelopeMissing(false); // rollback
            toast.error(err?.response?.data?.message || "Failed to update envelope status.");
        }
    };

    const statusBtnBase =
        "text-xs sm:text-sm px-2 py-1 rounded font-semibold whitespace-nowrap disabled:opacity-60";

    return (
        <>
            {/* Main Sale Row */}
            <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm md:text-base">
                <td className="border px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3">{sale.employeeName}</td>

                <td className="border px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 whitespace-nowrap">
                    {sale.saleDate.slice(5)}{" "}
                    <span className="text-xs text-gray-500">({sale.saleDate.slice(0, 4)})</span>
                </td>

                <td className="border px-2 sm:px-3 md:px-4 text-gray-600 dark:text-gray-400">
                    ${sale.systemAccessories.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4 text-purple-600 dark:text-purple-400 font-bold">
                    ${sale.accessories.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4 text-gray-600 dark:text-gray-400">
                    ${sale.systemCash.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4 text-green-600 dark:text-green-400 font-bold">
                    ${sale.actualCash.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4 text-gray-600 dark:text-gray-400">
                    ${sale.systemCard.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4 text-blue-600 dark:text-blue-400 font-bold">
                    ${sale.actualCard.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4 text-red-600 dark:text-red-400">
                    ${sale.cashExpense.toFixed(2)}
                </td>
                <td className="border px-2 sm:px-3 md:px-4">{sale.expenseReason}</td>

                {/* ✅ Sale Verified button */}
                {/* <td className="border px-2 sm:px-3 md:px-4">
                    <button
                        onClick={handleToggleSaleVerified}
                        disabled={saleVerified}
                        className={
                            saleVerified
                                ? `${statusBtnBase} bg-green-600 text-white`
                                : `${statusBtnBase} bg-red-600 text-white hover:bg-red-700`
                        }
                        title={saleVerified ? "Verified" : "Click to mark as Verified"}
                    >
                        {saleVerified ? "Verified" : "Not Verified"}
                    </button>
                </td> */}

                {/* ✅ Envelope Missing button */}
                <td className="border px-2 sm:px-3 md:px-4">
                    <button
                        onClick={handleToggleEnvelopeMissing}
                        disabled={envelopeMissing}
                        className={
                            envelopeMissing
                                ? `${statusBtnBase} bg-green-600 text-white hover:bg-green-700`
                                : `${statusBtnBase} bg-red-600 text-white`
                        }
                        title={envelopeMissing ? "Missing Envelope" : "Click to mark as Missing"}
                    >
                        {envelopeMissing ? "Collected" : "Not Collected"}
                    </button>
                </td>
            </tr>

            {/* Expense Rows */}
            {sale.expenses?.map((expense, index) => (
                <tr key={index} className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                    <td className="border px-3 py-1" colSpan={3}>
                        <strong>Reason:</strong> {expense.reason}
                    </td>
                    <td className="border px-3 py-1" colSpan={2}>
                        <strong>Amount:</strong> ${expense.amount.toFixed(2)}
                    </td>
                    <td className="border px-3 py-1" colSpan={2}>
                        <strong>Type:</strong> {expense.expenseType || "N/A"}
                    </td>
                    <td className="border px-3 py-1" colSpan={2}>
                        <strong>Payment:</strong> {expense.paymentType || "N/A"}
                    </td>
                    <td className="border px-3 py-1" colSpan={2}>
                        <button
                            onClick={() => handleAddExpense(index)}
                            disabled={loadingIndex === index}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loadingIndex === index ? "Adding..." : "Add to Expense"}
                        </button>
                    </td>
                </tr>
            ))}
        </>
    );
}
