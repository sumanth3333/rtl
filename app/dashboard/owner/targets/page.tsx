"use client";

import { useEffect, useState } from "react";
import { StoreTarget, EmployeeTarget, StoreTargetResponse, EmployeeTargetResponse, StoreTargetRequest, EmployeeTargetRequest } from "@/types/targetTypes";
import { getEmployeeTargets, getStoreTargets } from "@/services/owner/targetService";
import StoreTargetTable from "@/components/owner/targets/StoreTargetTable";
import EmployeeTargetTable from "@/components/owner/targets/EmployeeTargetTable";
import TargetUpdateModal from "@/components/owner/targets/TargetUpdateModal";
import { useOwner } from "@/hooks/useOwner";
import { format, subMonths } from "date-fns";

export default function MonthlyTargets() {
    const { companyName } = useOwner();

    const [storeTargets, setStoreTargets] = useState<StoreTargetResponse[]>([]);
    const [employeeTargets, setEmployeeTargets] = useState<EmployeeTargetResponse[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTarget, setSelectedTarget] = useState<StoreTargetRequest | EmployeeTargetRequest | null>(null);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

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

    const openEditModal = (target: StoreTarget | EmployeeTarget | null, id: string, type: "store" | "employee") => {
        const initialTarget = type === "store"
            ? {
                activationTargetToStore: 0,
                upgradeTargetToStore: 0,
                accessoriesTargetToStore: 0.0,
                hsiTargetToStore: 0,
                tabletsTargetToStore: 0,
                smartwatchTragetToStore: 0,
                targetMonth,
            } as StoreTarget
            : {
                phonesTargetToEmployee: 0,
                upgradeTargetToEmployee: 0,
                accessoriesTargetByEmployee: 0.0,
                hsiTarget: 0,
                tabletsTargetByEmployee: 0,
                smartwatchTargetByEmployee: 0,
                targetMonth,

            } as EmployeeTarget;

        const actualTarget = type === "store"
            ? {
                store: { dealerStoreId: id },
                target: target
            } as StoreTargetRequest
            : {
                employee: { employeeNtid: id },
                target: target

            } as EmployeeTargetRequest;

        const defaultTarget = type === "store"
            ? {
                store: { dealerStoreId: id },
                target: initialTarget
            } as StoreTargetRequest
            : {
                employee: { employeeNtid: id },
                target: initialTarget

            } as EmployeeTargetRequest;

        setSelectedTarget(actualTarget || defaultTarget);
        setModalOpen(true);
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
                    <StoreTargetTable targets={storeTargets} month={targetMonth} onEdit={(target, id) => openEditModal(target, id, "store")} />
                    <EmployeeTargetTable targets={employeeTargets} month={targetMonth} onEdit={(target, id) => openEditModal(target, id, "employee")} />
                </>
            )}

            {selectedTarget && (
                <TargetUpdateModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} target={selectedTarget} month={targetMonth} />
            )}
        </div>
    );
}