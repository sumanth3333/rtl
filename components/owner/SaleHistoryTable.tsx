"use client";
import { useState } from "react";
import { SaleHistory } from "@/types/cashCollectionTypes";
import TableHeader from "./TableHeader";
import SaleHistoryRow from "./SaleHistoryRow";

interface SaleHistoryTableProps {
    saleHistory: SaleHistory[];
}

export default function SaleHistoryTable({ saleHistory }: SaleHistoryTableProps) {
    const headers = [
        { key: "employeeName", label: "Employee" },
        { key: "saleDate", label: "Sale Date" },
        { key: "systemAccessories", label: "System Accessories" },
        { key: "accessories", label: "Actual Accessories" },
        { key: "systemCash", label: "System Cash" },
        { key: "actualCash", label: "Actual Cash" },
        { key: "systemCard", label: "System Card" },
        { key: "actualCard", label: "Actual Card" },
        { key: "cashExpense", label: "Cash Expense" },
        { key: "expenseReason", label: "Expense Reason" },
    ];

    const [sortedField, setSortedField] = useState<string | null>(null);
    const [ascending, setAscending] = useState(true);

    const handleSort = (key: string) => {
        if (sortedField === key) {
            setAscending(!ascending);
        } else {
            setSortedField(key);
            setAscending(true);
        }
    };

    const sortedData = [...saleHistory].sort((a, b) => {
        if (!sortedField) return 0;
        const aValue = a[sortedField as keyof SaleHistory];
        const bValue = b[sortedField as keyof SaleHistory];

        if (typeof aValue === "string" && typeof bValue === "string") {
            return ascending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
            return ascending ? aValue - bValue : bValue - aValue;
        }

        return 0;
    });

    return (
        <div className="p-4">
            {saleHistory.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
                        <thead>
                            <TableHeader headers={headers} sortedField={sortedField} ascending={ascending} onSort={handleSort} />
                        </thead>
                        <tbody>
                            {sortedData.map((sale) => (
                                <SaleHistoryRow key={sale.saleDate + sale.employeeName} sale={sale} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center">No sales history available.</p>
            )}
        </div>
    );
}
