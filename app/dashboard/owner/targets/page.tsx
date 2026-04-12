"use client";

import { useEffect, useState } from "react";
import { StoreTarget, EmployeeTarget, StoreTargetResponse, EmployeeTargetResponse, StoreTargetRequest, EmployeeTargetRequest } from "@/types/targetTypes";
import { getEmployeeTargets, getStoreTargets, updateEmployeeTarget, updateStoreTarget } from "@/services/owner/targetService";
import StoreTargetTable from "@/components/owner/targets/StoreTargetTable";
import EmployeeTargetTable from "@/components/owner/targets/EmployeeTargetTable";
import { useOwner } from "@/hooks/useOwner";
import { format, subMonths } from "date-fns";

export default function MonthlyTargets() {
    const { companyName } = useOwner();

    const [storeTargets, setStoreTargets] = useState<StoreTargetResponse[]>([]);
    const [employeeTargets, setEmployeeTargets] = useState<EmployeeTargetResponse[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    // Default to current month
    const [targetMonth, setTargetMonth] = useState<string>(format(new Date(), "yyyy-MM"));

    useEffect(() => {
        async function fetchData() {
            if (!companyName) { return }; // ✅ Prevent API call if companyName is undefined

            try {
                setLoading(true);

                // ✅ Fetch and set Store Targets
                const stores: StoreTargetResponse[] = await getStoreTargets(companyName, targetMonth);
                setStoreTargets(stores); // ✅ State now correctly expects an array of StoreTargetResponse
                //console.log(stores);
                // ✅ Fetch and set Employee Targets
                const employees: EmployeeTargetResponse[] = await getEmployeeTargets(companyName, targetMonth);
                setEmployeeTargets(employees); // ✅ State now correctly expects an array of EmployeeTargetResponse
                //console.log(employees);
            } catch (error) {
                console.error("Error fetching targets:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [companyName, targetMonth]);

    const saveStoreTarget = async (dealerStoreId: string, target: StoreTarget) => {
        const payload: StoreTargetRequest = { store: { dealerStoreId }, target };
        await updateStoreTarget(payload);
        setStoreTargets((prev) => prev.map((row) => (row.store.dealerStoreId === dealerStoreId ? { ...row, target } : row)));
    };

    const saveEmployeeTarget = async (employeeNtid: string, target: EmployeeTarget) => {
        const payload: EmployeeTargetRequest = { employee: { employeeNtid }, target };
        await updateEmployeeTarget(payload);
        setEmployeeTargets((prev) => prev.map((row) => (row.employeeDTO.employeeNtid === employeeNtid ? { ...row, target } : row)));
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Monthly Targets</h1>

            {/* Month Selection Dropdown */}
            <div className="flex items-center space-x-4">
                <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Select Month:</label>
                <select
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                >
                    {Array.from({ length: 12 }).map((_, i) => {
                        const monthValue = format(subMonths(new Date(), i), "yyyy-MM");
                        return (
                            <option key={monthValue} value={monthValue}>
                                {format(subMonths(new Date(), i), "MMMM yyyy")}
                            </option>
                        );
                    })}
                </select>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading targets...</p>
            ) : (
                <>
                    <StoreTargetTable targets={storeTargets} month={targetMonth} onSave={saveStoreTarget} />
                    <EmployeeTargetTable targets={employeeTargets} month={targetMonth} onSave={saveEmployeeTarget} />
                </>
            )}
        </div>
    );
}
