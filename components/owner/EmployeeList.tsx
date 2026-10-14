"use client";

import { useMemo, useState } from "react";
import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";

interface Employee {
    dealerStoreId: string;
    employeeName: string;
    clockinTime: string;
    status?: string;
    reason?: string;
    clockoutTime?: string;
}

type SortKey = "dealerStoreId" | "clockinTime";
type SortDirection = "asc" | "desc";

interface EmployeeListProps {
    employees: Employee[];
    loading?: boolean;
}

const NOT_CLOCKED_IN = "NOT YET CLOCKED IN";
const NOT_CLOCKED_OUT = "NOT YET CLOCKED OUT";
const NO_EMPLOYEE = "NO EMPLOYEE FOUND";
const NO_REASON = "NOT AVAILABLE";

function parseClockTime(value: string) {
    // Attempt to parse times like "09:15", "09:15:30" or "09:15 AM"; fall back to lexical compare weight
    const normalized = value?.trim();
    if (!normalized || normalized === NOT_CLOCKED_IN) { return null; }

    // Handle AM/PM
    const ampmMatch = normalized.match(/^(\d{1,2}:\d{2})(?::\d{2})?\s?(AM|PM)$/i);
    if (ampmMatch) {
        const [time, meridiem] = [ampmMatch[1], ampmMatch[2].toUpperCase()];
        const [h, m] = time.split(":").map(Number);
        const hour24 = (h % 12) + (meridiem === "PM" ? 12 : 0);
        return hour24 * 60 + m;
    }

    // Handle HH:mm or HH:mm:ss
    const parts = normalized.split(":").map((p) => Number(p));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
        const [h, m, s = 0] = parts;
        return h * 3600 + m * 60 + s;
    }

    return null;
}

function statusBadgeClasses(status?: string) {
    const value = (status ?? "").trim();

    if (value === "ON_TIME") {
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-800";
    }
    if (/^OPENED LATE/i.test(value)) {
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800";
    }
    if (value === NOT_CLOCKED_IN || !value) {
        return "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-800";
}

function statusLabel(status?: string) {
    const value = (status ?? "").trim();
    const lateMatch = value.match(/^OPENED LATE\s+(\d+)\s*minutes?$/i);
    if (lateMatch) { return `Late ${lateMatch[1]} min`; }
    if (value === "ON_TIME") { return "On Time"; }
    if (value === NOT_CLOCKED_IN) { return "Not Clocked In"; }
    return value || "Unknown";
}

export default function EmployeeList({ employees, loading }: EmployeeListProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: "clockinTime", direction: "asc" });

    const sortedEmployees = useMemo(() => {
        const list = [...employees];
        const { key, direction } = sortConfig;

        return list.sort((a, b) => {
            if (key === "dealerStoreId") {
                const result = a.dealerStoreId.localeCompare(b.dealerStoreId);
                return direction === "asc" ? result : -result;
            }

            const aVal = parseClockTime(a.clockinTime);
            const bVal = parseClockTime(b.clockinTime);

            // Employees who haven't clocked in yet always sink to the bottom.
            if (aVal === null && bVal === null) { return 0; }
            if (aVal === null) { return 1; }
            if (bVal === null) { return -1; }

            const result = aVal - bVal;
            return direction === "asc" ? result : -result;
        });
    }, [employees, sortConfig]);

    const summary = useMemo(() => {
        const working = employees.filter(
            (e) => e.clockinTime !== NOT_CLOCKED_IN && e.clockoutTime === NOT_CLOCKED_OUT
        ).length;
        const late = employees.filter((e) => e.status?.toUpperCase().startsWith("OPENED LATE")).length;
        const notClockedIn = employees.filter((e) => e.clockinTime === NOT_CLOCKED_IN).length;
        return { working, late, notClockedIn };
    }, [employees]);

    const toggleSort = (key: SortKey) => {
        setSortConfig((prev) =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
    };

    const indicator = (key: SortKey) => {
        if (sortConfig.key !== key) { return ""; }
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };

    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0b1220] shadow-sm overflow-hidden">
            {/* Header (compact) */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm">
                        📍
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Who is Working</p>
                        <p className="text-[11px] sm:text-[12px] text-zinc-500 dark:text-zinc-300">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{summary.working}</span> working
                            {" "}•{" "}
                            <span className="font-semibold text-amber-700 dark:text-amber-300">{summary.late}</span> late
                            {" "}•{" "}
                            <span className="font-semibold text-zinc-600 dark:text-zinc-400">{summary.notClockedIn}</span> not clocked in
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-3">
                    <SkeletonTable rows={3} />
                </div>
            ) : sortedEmployees.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-6">No employees currently working.</p>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-center text-xs sm:text-sm table-fixed min-w-[640px]">
                    {/* Column widths as percentages so they rebalance with screen size instead of one column hogging space */}
                    <colgroup>
                        <col className="w-[12%]" />
                        <col className="w-[22%]" />
                        <col className="w-[16%]" />
                        <col className="w-[14%]" />
                        <col className="w-[14%]" />
                        <col className="w-[22%]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 text-[10px] sm:text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                            <th
                                className="px-2 py-1.5 whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("dealerStoreId")}
                                title="Sort by store"
                            >
                                Store {indicator("dealerStoreId")}
                            </th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Employee</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Status</th>
                            <th
                                className="px-2 py-1.5 whitespace-nowrap cursor-pointer select-none"
                                onClick={() => toggleSort("clockinTime")}
                                title="Sort by clock-in time"
                            >
                                Clock-In {indicator("clockinTime")}
                            </th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Clock-Out</th>
                            <th className="px-2 py-1.5 whitespace-nowrap">Reason</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {sortedEmployees.map((employee, index) => {
                            const isClockedIn = employee.clockinTime !== NOT_CLOCKED_IN;
                            const isCurrentlyWorking = isClockedIn && employee.clockoutTime === NOT_CLOCKED_OUT;
                            const hasEmployee = employee.employeeName?.trim() && employee.employeeName !== NO_EMPLOYEE;
                            const hasReason = employee.reason && employee.reason !== NO_REASON && employee.reason !== NOT_CLOCKED_OUT;

                            return (
                                <tr
                                    key={index}
                                    className="text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                                >
                                    <td className="px-2 py-1.5 break-words font-semibold text-zinc-900 dark:text-zinc-100">
                                        {employee.dealerStoreId}
                                    </td>

                                    <td className={`px-2 py-1.5 break-words ${hasEmployee ? "text-zinc-700 dark:text-zinc-200" : "italic text-zinc-400 dark:text-zinc-500"}`}>
                                        {hasEmployee ? employee.employeeName : "No employee found"}
                                    </td>

                                    <td className="px-2 py-1.5">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${statusBadgeClasses(employee.status)}`}
                                        >
                                            {statusLabel(employee.status)}
                                        </span>
                                    </td>

                                    <td className={`px-2 py-1.5 tabular-nums whitespace-nowrap ${isClockedIn ? "font-semibold text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                                        {isClockedIn ? employee.clockinTime : "—"}
                                    </td>

                                    <td className="px-2 py-1.5 tabular-nums whitespace-nowrap">
                                        {isCurrentlyWorking ? (
                                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                                                Working
                                            </span>
                                        ) : (
                                            <span className={isClockedIn ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                                                {isClockedIn ? (employee.clockoutTime || "—") : "—"}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-2 py-1.5 break-words text-zinc-500 dark:text-zinc-400">
                                        {hasReason ? employee.reason : "—"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
}
