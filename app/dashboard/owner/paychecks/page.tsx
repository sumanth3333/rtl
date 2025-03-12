"use client";

import { useEffect, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import { fetchEmployeePaychecks } from "@/services/owner/paycheckService";
import EmployeePaycheckCard from "@/components/owner/paycheck/generate-pay/EmployeePaycheckCard";
import PaycheckFilters from "@/components/owner/paycheck/generate-pay/PaycheckFilters";
import { EmployeePaycheck } from "@/types/paycheckTypes";

export default function GeneratePayPage() {
    const { companyName } = useOwner();
    const [paychecks, setPaychecks] = useState<EmployeePaycheck[]>([]); // ✅ Correctly typed

    // Function to get the first day of the current month (YYYY-MM-DD)
    const getStartDate = () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    };

    // Function to get the last day of the current month (YYYY-MM-DD)
    const getEndDate = () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
    };

    // Ensure the dates update when the month changes
    useEffect(() => {
        setStartDate(getStartDate());
        setEndDate(getEndDate());
    }, []);

    const [startDate, setStartDate] = useState<string>(getStartDate());
    const [endDate, setEndDate] = useState<string>(getEndDate());
    const [includeBoxes, setIncludeBoxes] = useState<string>("NO");
    const [includeAccessories, setIncludeAccessories] = useState<string>("NO");

    // ✅ Fetch Paychecks
    const fetchPaychecks = async () => {
        const response = await fetchEmployeePaychecks(companyName, startDate, endDate, includeBoxes, includeAccessories);

        if (response.success && response.data) {
            setPaychecks(response.data); // ✅ Only set if data is present
        } else {
            console.error(response.error || "Unknown error fetching paychecks");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">💰 Generate Paychecks</h1>

            {/* ✅ Fixed PaycheckFilters Props */}
            <PaycheckFilters
                startDate={startDate}
                endDate={endDate}
                includeBoxes={includeBoxes}
                includeAccessories={includeAccessories}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setIncludeBoxes={setIncludeBoxes}
                setIncludeAccessories={setIncludeAccessories}
                fetchPaychecks={fetchPaychecks}
            />

            {/* ✅ Corrected paycheck mapping */}
            {paychecks.length > 0 ? (
                <div className="mt-4">
                    {paychecks.map((pay) => (
                        <EmployeePaycheckCard paycheck={pay} fromDate={startDate} toDate={endDate} key={pay.employee.employeeNtid} includeBoxes={includeBoxes} includeAccessories={includeAccessories} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center mt-4">No paychecks found for the selected period.</p>
            )}
        </div>
    );
}
