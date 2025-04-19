// 📄 pages/owner/finance/ProfitsAndExpensesPage.tsx
"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/api/apiClient";
import PAndENavBar from "@/components/owner/finance/PAndENavBar";
import EditableTable from "@/components/owner/finance/EditableTable";
import OtherExpensesTable from "@/components/owner/finance/OtherExpensesTable";
import { useOwner } from "@/hooks/useOwner";

export default function ProfitsAndExpensesPage() {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [bills, setBills] = useState<any[]>([]);
    const [otherExpenses, setOtherExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [columnKeys, setColumnKeys] = useState<string[]>([]);
    const [columnLabels, setColumnLabels] = useState<string[]>([]);
    const { companyName } = useOwner();

    useEffect(() => {
        if (!companyName) {
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch regular expenses
                const billResponse = await apiClient.get("/expense/fetchRegularExpenses", {
                    params: { companyName, month: selectedMonth },
                });
                const fetchedBills = billResponse.data;
                setBills(fetchedBills);

                if (fetchedBills.length > 0) {
                    const firstRow = fetchedBills[0];
                    const ignoreKeys = ["dealerStoreId", "paidMonth"];
                    const keys = Object.keys(firstRow).filter((k) => !ignoreKeys.includes(k));
                    setColumnKeys(keys);

                    const labels = keys.map((key) =>
                        key
                            .replace(/([a-z])([A-Z])/g, "$1 $2")
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (char) => char.toUpperCase())
                    );
                    setColumnLabels(labels);
                }

                // Fetch other expenses
                const otherResponse = await apiClient.get("/expense/fetchOtherExpenses", {
                    params: { companyName, month: selectedMonth },
                });
                setOtherExpenses(otherResponse.data);

            } catch {
                setError("Failed to fetch expenses.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth, companyName]);

    const handleUpdateBills = (updated: any[]) => setBills(updated);
    const handleUpdateOtherExpenses = (updated: any[]) => setOtherExpenses(updated);

    const handleSaveBills = async (updated: any[]) => {
        await apiClient.post("/expense/saveRegularExpenses", updated);
    };

    const handleSaveOtherExpenses = async (updated: any[]) => {
        await apiClient.post("/v1/expense/saveOtherExpenses", {
            companyName,
            expenses: updated,
        });
    };

    return (
        <>
            <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

            <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                <p className="text-xl text-center font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {selectedMonth} Expenses
                </p>

                {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading data...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                <EditableTable
                    title="🏠 Business Bills"
                    columnKeys={columnKeys}
                    columnLabels={columnLabels}
                    data={bills}
                    onUpdate={handleUpdateBills}
                    onSave={handleSaveBills}
                />

                <OtherExpensesTable
                    data={otherExpenses}
                    companyName={companyName}
                    month={selectedMonth}
                    onUpdate={handleUpdateOtherExpenses}
                    onSave={handleSaveOtherExpenses}
                />
            </div>
        </>
    );
}
