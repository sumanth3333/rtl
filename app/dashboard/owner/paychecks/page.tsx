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

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [includeBoxes, setIncludeBoxes] = useState<string>("NO");
    const [includeAccessories, setIncludeAccessories] = useState<string>("NO");
    const [includeTaxes, setIncludeTaxes] = useState<string>("NO");

    // ✅ Fetch Paychecks
    const fetchPaychecks = async () => {
        const response = await fetchEmployeePaychecks(companyName, startDate, endDate, includeBoxes, includeAccessories, includeTaxes);

        if (response.success && response.data) {
            setPaychecks(response.data); // ✅ Only set if data is present
        } else {
            console.error(response.error || "Unknown error fetching paychecks");
        }
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
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setIncludeBoxes={setIncludeBoxes}
                setIncludeTaxes={setIncludeTaxes}
                setIncludeAccessories={setIncludeAccessories}
                fetchPaychecks={fetchPaychecks}
            />

            {/* ✅ Corrected paycheck mapping */}
            {paychecks.length > 0 ? (
                <div className="mt-4">
                    {paychecks.map((pay) => (
                        <EmployeePaycheckCard paycheck={pay} fromDate={startDate} toDate={endDate} key={pay.employee.employeeNtid} includeBoxes={includeBoxes} includeAccessories={includeAccessories} includeTaxes={includeTaxes} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center mt-4">No paychecks found for the selected period.</p>
            )}
        </div>
    );
}
