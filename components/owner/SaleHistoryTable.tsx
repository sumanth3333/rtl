"use client";
import { useState } from "react";
import { SaleHistory } from "@/types/cashCollectionTypes";
import TableHeader from "./TableHeader";
import SaleHistoryRow from "./SaleHistoryRow";

interface SaleHistoryTableProps {
    saleHistory: SaleHistory[];
    dealerStoreId: string;
}

export default function SaleHistoryTable({ saleHistory, dealerStoreId }: SaleHistoryTableProps) {
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
        if (!sortedField) {
            return 0;
        }
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
        <div className="p-2 sm:p-4 overflow-x-auto">
            {saleHistory.length > 0 ? (
                <table className="w-full rounded-lg shadow-md text-xs sm:text-sm md:text-base">
                    <thead>
                        <TableHeader headers={headers} sortedField={sortedField} ascending={ascending} onSort={handleSort} />
                    </thead>
                    <tbody>
                        {sortedData.map((sale) => (
                            <SaleHistoryRow key={sale.saleDate + sale.employeeName} sale={sale} store={dealerStoreId} />
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500 text-center">No sales history available.</p>
            )}
        </div>
    );
}