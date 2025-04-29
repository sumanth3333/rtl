"use client";

import EodForm from "@/components/employee/EodForm";
import { useEmployee } from "@/hooks/useEmployee";
import { getEodDetails } from "@/services/employee/employeeService";
import { useEffect, useState } from "react";
import EODFaq from "@/components/employee/EODFaq";

export default function LogEodReportPage() {
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
