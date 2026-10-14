"use client";

import { useEffect, useMemo, useState } from "react";
import {
    assignStrategy,
    fetchStoreStrategyAssignments,
    fetchStrategyOptions,
} from "@/services/owner/salesSprintStrategyService";
import { StoreStrategyAssignment, StrategyOption } from "@/types/salesSprintStrategyTypes";

interface PhaseAssignmentsTableProps {
    companyName: string;
    yearMonth: string;
}

type Alert = { type: "success" | "error"; message: string };

const formatStrategyName = (name: string) =>
    name
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

export default function PhaseAssignmentsTable({ companyName, yearMonth }: PhaseAssignmentsTableProps) {
    const [stores, setStores] = useState<StoreStrategyAssignment[]>([]);
    const [strategyOptions, setStrategyOptions] = useState<StrategyOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<Alert | null>(null);
    const [assigningStoreId, setAssigningStoreId] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName || !yearMonth) { return; }

        const load = async () => {
            setLoading(true);
            setAlert(null);
            try {
                const [assignments, options] = await Promise.all([
                    fetchStoreStrategyAssignments(companyName, yearMonth),
                    fetchStrategyOptions(),
                ]);
                setStores(assignments.stores);
                setStrategyOptions(options);
            } catch (error) {
                console.error("❌ Error fetching phase assignments:", error);
                setAlert({ type: "error", message: "Failed to load phase assignments." });
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [companyName, yearMonth]);

    const strategyIdByName = useMemo(() => {
        const map = new Map<string, number>();
        strategyOptions.forEach((option) => map.set(option.strategyName, option.id));
        return map;
    }, [strategyOptions]);

    const handleAssign = async (dealerStoreId: string, strategyId: number) => {
        setAssigningStoreId(dealerStoreId);
        setAlert(null);
        try {
            const updated = await assignStrategy({ dealerStoreId, salesSprintStrategyId: strategyId, yearMonth });
            setStores(updated.stores);
            setAlert({ type: "success", message: "✅ Strategy assigned successfully!" });
        } catch (error) {
            console.error("❌ Error assigning strategy:", error);
            setAlert({ type: "error", message: "Failed to assign strategy. Please try again." });
        } finally {
            setAssigningStoreId(null);
        }
    };

    return (
        <div className="h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-3">
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🎯 Phase Assignments</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Assign each store&apos;s phase strategy for the selected month.
                </p>
            </div>

            {alert && (
                <div
                    className={`rounded-md px-4 py-3 text-sm ${alert.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                        }`}
                >
                    {alert.message}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading phase assignments...</p>
            ) : stores.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No stores found.</p>
            ) : (
                <div className="space-y-2 flex-1">
                    {stores.map((store) => {
                        const isAssigned = store.strategyName !== "N/A";
                        const currentId = strategyIdByName.get(store.strategyName) ?? "";
                        const isAssigning = assigningStoreId === store.dealerStoreId;

                        return (
                            <div
                                key={store.dealerStoreId}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{store.storeName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{store.dealerStoreId}</span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${isAssigned
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                        >
                                            {isAssigned ? formatStrategyName(store.strategyName) : "Not Assigned"}
                                        </span>
                                    </div>
                                </div>

                                <select
                                    value={currentId}
                                    onChange={(e) => handleAssign(store.dealerStoreId, Number(e.target.value))}
                                    disabled={isAssigning || strategyOptions.length === 0}
                                    className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                                >
                                    <option value="">{isAssigning ? "Assigning..." : "Select strategy"}</option>
                                    {strategyOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {formatStrategyName(option.strategyName)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
