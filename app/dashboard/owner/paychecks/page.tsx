"use client";

import { useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useOwner } from "@/hooks/useOwner";
import { fetchEmployeePaychecks } from "@/services/owner/paycheckService";
import EmployeePaycheckCard from "@/components/owner/paycheck/generate-pay/EmployeePaycheckCard";
import PaycheckFilters from "@/components/owner/paycheck/generate-pay/PaycheckFilters";
import { EmployeePaycheck, PaycheckResponse } from "@/types/paycheckTypes";

export default function GeneratePayPage() {
    const { companyName } = useOwner();
    const [paychecks, setPaychecks] = useState<EmployeePaycheck[]>([]); // ✅ Correctly typed
    const [totals, setTotals] = useState<Omit<PaycheckResponse, "paychecks" | "commissionReference"> | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [includeBoxes, setIncludeBoxes] = useState<string>("NO");
    const [includeAccessories, setIncludeAccessories] = useState<string>("NO");
    const [includeTaxes, setIncludeTaxes] = useState<string>("NO");
    const [commissionPerCompletedAccount, setCommissionPerCompletedAccount] = useState<string>("NO");

    // ✅ Fetch Paychecks
    const fetchPaychecks = async () => {
        setIsFetching(true);
        setFetchError(null);
        setHasSearched(true);

        const response = await fetchEmployeePaychecks(companyName, startDate, endDate, includeBoxes, includeAccessories, includeTaxes, commissionPerCompletedAccount);

        if (response.success && response.data) {
            setPaychecks(response.data.paychecks); // ✅ Only set if data is present
            const { totalHourlyPay, totalSalesCommission, totalMagentaCommission, totalAccessoriesCommission, totalCommission, totalGrossPay, totalTaxes, totalPayCheckForCompany } = response.data;
            setTotals({ totalHourlyPay, totalSalesCommission, totalMagentaCommission, totalAccessoriesCommission, totalCommission, totalGrossPay, totalTaxes, totalPayCheckForCompany });
        } else {
            setPaychecks([]);
            setTotals(null);
            setFetchError(response.error || "Something went wrong while fetching paychecks. Please try again.");
        }

        setIsFetching(false);
    };

    return (
        <div className="mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">💰 Generate Paychecks</h1>

            {/* ✅ Fixed PaycheckFilters Props */}
            <PaycheckFilters
                startDate={startDate}
                endDate={endDate}
                includeBoxes={includeBoxes}
                includeAccessories={includeAccessories}
                includeTaxes={includeTaxes}
                commissionPerCompletedAccount={commissionPerCompletedAccount}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setIncludeBoxes={setIncludeBoxes}
                setIncludeTaxes={setIncludeTaxes}
                setIncludeAccessories={setIncludeAccessories}
                setCommissionPerCompletedAccount={setCommissionPerCompletedAccount}
                fetchPaychecks={fetchPaychecks}
                isLoading={isFetching}
            />

            {fetchError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Couldn&apos;t generate paychecks</p>
                        <p className="text-sm text-red-700 dark:text-red-400">{fetchError}</p>
                    </div>
                </div>
            )}

            {totals !== null && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
                    {[
                        ["Hourly Pay", totals.totalHourlyPay],
                        ["Sales Commission", totals.totalSalesCommission],
                        ["Magenta Commission", totals.totalMagentaCommission],
                        ["Accessories Commission", totals.totalAccessoriesCommission],
                        ["Total Commission", totals.totalCommission],
                        ["Gross Pay", totals.totalGrossPay],
                        ["Taxes", totals.totalTaxes],
                        ["Total Payout", totals.totalPayCheckForCompany],
                    ].map(([label, value]) => (
                        <div key={label} className="flex flex-col">
                            <span className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{label}</span>
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                                {(value as number).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Corrected paycheck mapping */}
            {paychecks.length > 0 ? (
                <div className="mt-4">
                    {paychecks.map((pay) => (
                        <EmployeePaycheckCard paycheck={pay} fromDate={startDate} toDate={endDate} key={pay.employee.employeeNtid} includeBoxes={includeBoxes} includeAccessories={includeAccessories} includeTaxes={includeTaxes} />
                    ))}
                </div>
            ) : (
                hasSearched && !isFetching && !fetchError && (
                    <p className="text-gray-600 dark:text-gray-400 text-center mt-4">No paychecks found for the selected period.</p>
                )
            )}
        </div>
    );
}
