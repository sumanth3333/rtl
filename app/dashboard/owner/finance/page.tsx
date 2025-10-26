"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/api/apiClient";
import PAndENavBar from "@/components/owner/finance/PAndENavBar";
import EditableTable from "@/components/owner/finance/EditableTable";
import OtherExpensesTable from "@/components/owner/finance/OtherExpensesTable";
import { useOwner } from "@/hooks/useOwner";
import LegalExpensesTable from "@/components/owner/finance/LegalExpensesTable";
import StoreExpensesDisplay from "@/components/owner/finance/StoreExpensesDisplay";
import InvoicesDisplayTable from "@/components/owner/finance/InvoicesDisplayTable";
import DealerExpensesTable from "@/components/owner/finance/DealerExpensesTable";

export default function ProfitsAndExpensesPage() {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const { companyName } = useOwner();
    const [invoiceExpenses, setInvoiceExpenses] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [storeExpenses, setStoreExpenses] = useState<any[]>([]);
    const [dealerExpenses, setDealerExpenses] = useState<any[]>([]);
    const [legalExpenses, setLegalExpenses] = useState<any[]>([]);
    const [otherExpenses, setOtherExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [columnKeys, setColumnKeys] = useState<string[]>([]);
    const [columnLabels, setColumnLabels] = useState<string[]>([]);

    useEffect(() => {
        if (!companyName) { return };


        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Business Bills
                const billResponse = await apiClient.get("/expense/fetchRegularExpenses", {
                    params: { companyName, month: selectedMonth }
                });
                const fetchedBills = billResponse.data;
                setBills(fetchedBills);

                if (fetchedBills.length > 0) {
                    const ignore = ["dealerStoreId", "paidMonth"];
                    const keys = Object.keys(fetchedBills[0]).filter(k => !ignore.includes(k));
                    setColumnKeys(keys);
                    setColumnLabels(keys.map(key =>
                        key
                            .replace(/([a-z])([A-Z])/g, "$1 $2")
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())
                    ));
                }
                const invoiceRes = await apiClient.get("/upgradePhones/viewAllInvoicesForTheMonth", {
                    params: { companyName, month: selectedMonth }
                });
                setInvoiceExpenses(invoiceRes.data);

                // Other expenses
                const otherRes = await apiClient.get("/expense/fetchOtherExpenses", {
                    params: { companyName, month: selectedMonth }
                });
                setOtherExpenses(otherRes.data);

                // Store expenses
                const storeRes = await apiClient.get("/expense/fetchStoreExpenses", {
                    params: { companyName, month: selectedMonth }
                });
                const flattenedStoreExpenses = storeRes.data.flatMap((store: any) =>
                    store.expenses.map((expense: any) => ({
                        dealerStoreId: store.dealerStoreId,
                        ...expense
                    }))
                );
                setStoreExpenses(flattenedStoreExpenses);
                // Dealer expenses
                const dealerRes = await apiClient.get("/expense/fetchDealerExpenses", {
                    params: { companyName, month: selectedMonth }
                });
                setDealerExpenses(dealerRes.data);

                // Legal expenses
                const legalRes = await apiClient.get("/expense/fetchLegalExpenses", {
                    params: { companyName, month: selectedMonth }
                });
                setLegalExpenses(legalRes.data);

            } catch {
                setError("Failed to fetch expenses.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth, companyName]);

    const handleSaveBills = async (data: any[]) => {
        await apiClient.post("/expense/saveRegularExpenses", data);
    };

    const handleSaveOtherExpenses = async (data: any[]) => {
        await apiClient.post("/expense/saveOtherExpenses", {
            companyName,
            expenses: data,
        });
    };

    const handleSaveStoreExpenses = async (data: any[]) => {
        const grouped = data.reduce((acc: Record<string, any[]>, item) => {
            const id = item.dealerStoreId;
            if (!acc[id]) { acc[id] = []; }
            acc[id].push({
                paidFor: item.paidFor,
                amount: item.amount,
                month: item.month,
                paidDate: item.paidDate,
                expenseRecordedDate: item.expenseRecordedDate
            });
            return acc;
        }, {});

        const payload = Object.entries(grouped).map(([dealerStoreId, expenses]) => ({
            dealerStoreId,
            expenses
        }));

        await apiClient.post("/expense/saveStoreExpenses", {
            companyName,
            expenses: payload
        });
    };


    const handleSaveDealerExpenses = async (data: any[]) => {
        const payload = data.map((item) => ({
            dealerStoreId: item.dealerStoreId,
            expenseType: item.expenseType ?? "Flat Management Fee",
            amount: parseFloat(item.amount || 0),
            month: selectedMonth
        }));
        await apiClient.post("/expense/recordDealerExpenses", payload);
    };

    const handleSaveLegalExpenses = async (data: any[]) => {
        const payload = {
            companyName,
            legalExpenses: data.map((item) => ({
                legalExpenseId: item.expenseId ?? undefined, // ✅ Include ID if present
                expenseType: item.expenseType,
                amount: parseFloat(item.amount || 0),
                recordedDate: item.recordedDate,
                month: selectedMonth,
            })),
        };

        await apiClient.post("/expense/recordLegalExpenses", payload);
    };


    return (
        <>
            <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

            <div className=" mx-auto p-6">
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
                    onUpdate={setBills}
                    onSave={handleSaveBills}
                />

                <StoreExpensesDisplay
                    expenses={storeExpenses}
                    onAdd={(newExpense) => setStoreExpenses(prev => [...prev, newExpense])}
                    onSave={handleSaveStoreExpenses}
                />

                <OtherExpensesTable
                    data={otherExpenses}
                    companyName={companyName}
                    month={selectedMonth}
                    onUpdate={setOtherExpenses}
                    onSave={handleSaveOtherExpenses}
                />

                <DealerExpensesTable
                    data={dealerExpenses}
                    onUpdate={setDealerExpenses}
                    onSave={handleSaveDealerExpenses}
                />

                <LegalExpensesTable
                    data={legalExpenses}
                    month={selectedMonth}
                    onUpdate={setLegalExpenses}
                    onSave={handleSaveLegalExpenses}
                />

                <InvoicesDisplayTable data={invoiceExpenses} />
            </div>
        </>
    );
}
