"use client";

import { useEffect, useState } from "react";
import { getStores, getEmployees, getEodDetails } from "@/services/owner/ownerService";
import { useOwner } from "@/hooks/useOwner";
import { Store } from "@/schemas/storeSchema";
import { Employee } from "@/types/employeeSchema";
import EodForm from "@/components/owner/EodForm";

export default function LogEodReportOwnerPage() {
    const { companyName } = useOwner();
    const [stores, setStores] = useState<Store[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formReady, setFormReady] = useState(false); // 👈 New flag
    const [dealerStoreId, setDealerStoreId] = useState("");
    const [employeeNtid, setEmployeeNtid] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [eodFormValues, setEodFormValues] = useState({
        store: { dealerStoreId: dealerStoreId ?? "" },
        employee: { employeeNtid: employeeNtid ?? "" },
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
            setFormReady(false); // ⏳ Reset readiness

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

                    setFormReady(true); // ✅ Form is ready to render
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

                    setFormReady(true); // ✅ Even fallback data is ready
                });
        }
    }, [dealerStoreId, employeeNtid, selectedDate]);


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100 my-4 text-center">
                End Of Day Report
            </h1>

            <div className="w-full max-w-3xl space-y-4 mb-6">
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
                <div className="w-full max-w-3xl">
                    <EodForm
                        initialValues={eodFormValues}
                        storeName={stores.find((s) => s.dealerStoreId === dealerStoreId)?.storeName || ""}
                        employeeName={employees.find((e) => e.employeeNtid === employeeNtid)?.employeeName || ""}
                        saleDate={selectedDate}
                    />
                </div>
            )}

        </div>
    );
}
