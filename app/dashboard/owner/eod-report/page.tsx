"use client";

import { useEffect, useState } from "react";
import { getStores, getEmployees, getEodDetails } from "@/services/owner/ownerService";
import { useOwner } from "@/hooks/useOwner";
import { Store } from "@/schemas/storeSchema";
import { Employee } from "@/types/employeeSchema";
import EodForm from "@/components/owner/EodForm";
import EodSummaryByDate from "@/components/owner/EodSummaryByDate";
import ChangeEmployeeStore from "@/components/owner/ChangeEmployeeStore";

export default function LogEodReportOwnerPage() {
    const { companyName } = useOwner();
    const [stores, setStores] = useState<Store[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formReady, setFormReady] = useState(false);
    const [dealerStoreId, setDealerStoreId] = useState("");
    const [employeeNtid, setEmployeeNtid] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [summaryDate, setSummaryDate] = useState("");
    const [activeTab, setActiveTab] = useState<"summary" | "log" | "assignment">("summary");

    const [eodFormValues, setEodFormValues] = useState({
        store: { dealerStoreId },
        employee: { employeeNtid },
        clockinTime: "10:00:00",
        clockoutTime: "10:00:00",
        actualCash: 0,
        systemCash: 0,
        actualCard: 0,
        systemCard: 0,
        systemAccessories: 0,
        accessories: 0,
        saleDate: selectedDate,
        lastTransactionTime: "10:00:00",
        cashExpense: 0,
        expenseReason: "NONE",
        boxesSold: 0,
        upgrade: 0,
        migrations: 0,
        hsiSold: 0,
        tabletsSold: 0,
        watchesSold: 0,
    });

    useEffect(() => {
        if (!companyName) { return };
        (async () => {
            const fetchedStores = await getStores(companyName);
            const fetchedEmployees = await getEmployees(companyName);
            setStores(fetchedStores);
            setEmployees(fetchedEmployees);
        })();
    }, [companyName]);

    useEffect(() => {
        if (dealerStoreId && employeeNtid && selectedDate) {
            setFormReady(false);
            getEodDetails(dealerStoreId, employeeNtid, selectedDate)
                .then((data) => {
                    setEodFormValues({
                        store: { dealerStoreId },
                        employee: { employeeNtid },
                        actualCash: data.actualCash ?? 0,
                        clockinTime: data.clockinTime ?? "10:00:00",
                        clockoutTime: data.clockoutTime ?? "10:00:00",
                        systemCash: data.systemCash ?? 0,
                        actualCard: data.actualCard ?? 0,
                        systemCard: data.systemCard ?? 0,
                        systemAccessories: data.systemAccessories ?? 0,
                        saleDate: selectedDate,
                        accessories: data.accessories ?? 0,
                        lastTransactionTime: data.lastTransactionTime ?? "10:00:00",
                        cashExpense: data.cashExpense ?? 0,
                        expenseReason: data.expenseReason ?? "NONE",
                        boxesSold: data.boxesSold ?? 0,
                        upgrade: data.upgrade ?? 0,
                        migrations: data.migrations ?? 0,
                        hsiSold: data.hsiSold ?? 0,
                        tabletsSold: data.tabletsSold ?? 0,
                        watchesSold: data.watchesSold ?? 0,
                    });
                    setFormReady(true);
                })
                .catch(() => {
                    setEodFormValues({
                        store: { dealerStoreId },
                        employee: { employeeNtid },
                        clockinTime: "10:00:00",
                        clockoutTime: "10:00:00",
                        actualCash: 0,
                        systemCash: 0,
                        actualCard: 0,
                        systemCard: 0,
                        systemAccessories: 0,
                        accessories: 0,
                        saleDate: selectedDate,
                        lastTransactionTime: "10:00:00",
                        cashExpense: 0,
                        expenseReason: "NONE",
                        boxesSold: 0,
                        upgrade: 0,
                        migrations: 0,
                        hsiSold: 0,
                        tabletsSold: 0,
                        watchesSold: 0,
                    });
                    setFormReady(true);
                });
        }
    }, [dealerStoreId, employeeNtid, selectedDate]);

    return (
        <div className="min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
            {/* Navigation Tabs */}
            <div className="flex justify-center gap-4 mt-6 mb-8">
                <button
                    onClick={() => setActiveTab("summary")}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === "summary"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                        }`}
                >
                    View EOD Summary
                </button>
                <button
                    onClick={() => setActiveTab("log")}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === "log"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                        }`}
                >
                    Log EOD Report
                </button>
                <button
                    onClick={() => setActiveTab("assignment")}
                    className={`px-4 py-2 rounded-lg font-medium ${activeTab === "assignment"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                        }`}
                >
                    Change Employee Store
                </button>
            </div>

            {/* EOD Summary */}
            {activeTab === "summary" && (
                <div className="w-full max-w-3xl mx-auto">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        View Submitted EODs For:
                    </label>
                    <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={summaryDate}
                        onChange={(e) => setSummaryDate(e.target.value)}
                        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white mb-4"
                    />
                    {summaryDate && companyName && (
                        <EodSummaryByDate date={summaryDate} companyName={companyName} />
                    )}
                </div>
            )}

            {/* Log EOD Report */}
            {activeTab === "log" && (
                <div className="flex flex-col items-center w-full max-w-3xl mx-auto mb-10">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-100 my-4 text-center">
                        End Of Day Report
                    </h1>

                    <div className="w-full space-y-4 mb-6">
                        <select
                            value={dealerStoreId}
                            onChange={(e) => setDealerStoreId(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Select Store</option>
                            {stores.map((store) => (
                                <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                    {store.storeName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={employeeNtid}
                            onChange={(e) => setEmployeeNtid(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Select Employee</option>
                            {employees.map((emp) => (
                                <option key={emp.employeeNtid} value={emp.employeeNtid}>
                                    {emp.employeeName}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {formReady && (
                        <div className="w-full">
                            <EodForm
                                initialValues={eodFormValues}
                                storeName={stores.find((s) => s.dealerStoreId === dealerStoreId)?.storeName || ""}
                                employeeName={employees.find((e) => e.employeeNtid === employeeNtid)?.employeeName || ""}
                                saleDate={selectedDate}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Change Employee Store Assignment */}
            {activeTab === "assignment" && (
                <div className="w-full max-w-3xl mx-auto mb-10">
                    <ChangeEmployeeStore companyName={companyName} />
                </div>
            )}
        </div>
    );
}
