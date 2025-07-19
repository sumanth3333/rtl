"use client";

import EodForm from "@/components/employee/EodForm";
import { useEmployee } from "@/hooks/useEmployee";
import { getEodDetails } from "@/services/employee/employeeService";
import { EodReport } from "@/types/employeeSchema";
import { useEffect, useState } from "react";

export default function LogEodReportPage() {
    const [showInstructionsModal, setShowInstructionsModal] = useState(true);
    const { employee, store } = useEmployee();

    const [eodFormValues, setEodFormValues] = useState<EodReport>({
        store: { dealerStoreId: store?.dealerStoreId ?? "" },
        employee: { employeeNtid: employee?.employeeNtid ?? "" },
        actualCash: 0,
        systemCash: 0,
        actualCard: 0,
        systemCard: 0,
        systemAccessories: 0,
        accessoriesByEmployee: 0,
        lastTransactionTime: "10:00:00",
        expenses: [],
        boxesSold: 0,
        upgrade: 0,
        migrations: 0,
        hsiSold: 0,
        tabletsSold: 0,
        watchesSold: 0,
    });

    useEffect(() => {
        if (store?.dealerStoreId && employee?.employeeNtid) {
            getEodDetails(store.dealerStoreId, employee.employeeNtid)
                .then((data) => {
                    setEodFormValues((prev) => ({ ...prev, ...data }));
                })
                .catch((err) =>
                    console.error("❌ Failed to fetch EOD Report details:", err)
                );
        }
    }, [store?.dealerStoreId, employee?.employeeNtid]);

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 pb-20">
            <header className="max-w-5xl mx-auto pt-10 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
                    End of Day Report
                </h1>
                <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please fill in all fields accurately. This report is used for payroll and compliance.
                </p>
            </header>

            {showInstructionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Before You Begin
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                            <li><strong>Preactivated phones</strong> should be added to the <strong>Activations count</strong>.</li>
                            <li><strong>Do not</strong> include tablets, HSI, or watches in activations.</li>
                            <li>Invoices must be created for all preactivated phones before submission.</li>
                            <li>Use the actual <strong>last transaction time</strong> from your invoice or POS system.</li>
                        </ul>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowInstructionsModal(false)}
                                className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-5xl mx-auto mt-10">
                <EodForm initialValues={eodFormValues} />
            </main>
        </div>
    );
}
