"use client";

import EodForm from "@/components/employee/EodForm";
import { useEmployee } from "@/hooks/useEmployee";
import { getEodDetails } from "@/services/employee/employeeService";
import { useEffect, useState } from "react";

export default function LogEodReportPage() {
    const [showInstructionsModal, setShowInstructionsModal] = useState(true);

    const { employee, store } = useEmployee();
    const [eodFormValues, setEodFormValues] = useState({
        store: { dealerStoreId: store?.dealerStoreId ?? "" },
        employee: { employeeNtid: employee?.employeeNtid ?? "" },
        actualCash: 0,
        systemCash: 0,
        actualCard: 0,
        systemCard: 0,
        systemAccessories: 0,
        accessoriesByEmployee: 0,
        lastTransactionTime: "10:00:00",
        cashExpense: 0,
        expenseReason: "NONE",
        boxesSold: 0,
        upgrade: 0,
        migrations: 0,
        hsiSold: 0,
        tabletsSold: 0,
        watchesSold: 0,
        expenseType: "Short",
        paymentMethod: "Cash",

    });

    useEffect(() => {
        if (store?.dealerStoreId && employee?.employeeNtid) {
            getEodDetails(store.dealerStoreId, employee.employeeNtid)
                .then((data) => {
                    setEodFormValues((prevValues) => ({
                        ...prevValues,
                        ...data,
                    }));
                })
                .catch((error) => {
                    console.error("❌ Failed to fetch EOD Report details:", error);
                });
        }
    }, [store?.dealerStoreId, employee?.employeeNtid]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 pb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100 my-4 text-center">
                End Of Day Report
            </h1>
            {/* ✅ EOD Instructions */}
            <div className="w-full max-w-3xl mb-8 p-5 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 shadow-sm">
                <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">📌 Please read before submitting:</h2>
                <ul className="space-y-2 text-sm text-red-500 dark:text-yellow-100 list-disc pl-5">
                    <li>Ensure <strong>PREACT SOLD IS ONLY FOR ACCESSORIES, NOT AN UPGRADE BOX COUNT.</strong> </li>
                    <li>If you preactivated any phones today, then <strong>CREATE THE INVOICE IN DEVICE UPGRADES Page</strong> before submitting EOD Report.</li>
                    <li>If you preactivated any phones today, then <strong>INCLUDE IN ACTIVATIONS BOX COUNT </strong>and invoiced amount as an expense, for accurate information.</li>
                    <li>Record the <strong>last transaction time</strong> from the invoice listing.</li>
                </ul>
            </div>

            {showInstructionsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
                        <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
                            📌 Please Read Before Submitting Your EOD
                        </h2>
                        <ul className="space-y-3 text-sm text-red-600 dark:text-yellow-100 list-disc pl-5">
                            <li><strong>PREACT SOLD IS ONLY FOR ACCESSORIES, NOT AN UPGRADE BOX COUNT.</strong></li>
                            <li>If you preactivated any phones today, <strong>CREATE THE INVOICE IN DEVICE UPGRADES</strong> before submitting EOD.</li>
                            <li>Include preactivated phones in <strong>ACTIVATIONS BOX COUNT</strong> and the invoice value as an expense.</li>
                            <li>Use the <strong>last transaction time</strong> from the invoice listing.</li>
                        </ul>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowInstructionsModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Form Section */}
            <div className="w-full max-w-3xl">
                <EodForm initialValues={eodFormValues} />
            </div>

            {/* Divider */}
            <div className="h-px my-12 w-full bg-gray-300 dark:bg-gray-700" />

            {/* FAQ Section
            <div className="w-full max-w-4xl">
                 <EODFaq /> 
            </div> */}
        </div>
    );
}
