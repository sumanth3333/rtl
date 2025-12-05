// app/(owner)/overtime-hours/page.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import apiClient from "@/services/api/apiClient";
import { useOwner } from "@/hooks/useOwner";

type ShiftEntry = {
    storeName: string;
    date: string; // YYYY-MM-DD
    clockInTime: string;
    clockOutTime: string;
    hoursWorked: number;
};

type EmployeeWeek = {
    weekStartDate: string;
    weekEndDate: string;
    regular: number;
    hoursWorked: number;
    overTime: number;
    work: ShiftEntry[];
};

type EmployeeOvertimeApi = {
    employeeNtid: string;
    employeeName: string;
    work: EmployeeWeek[];
};

// Transformed type for UI
type EmployeeOvertime = {
    employeeNtid: string;
    employeeName: string;
    weeks: EmployeeWeek[];
    totalRegular: number;
    totalHoursWorked: number;
    totalOverTime: number;
};

export default function OvertimeHoursPage() {
    const today = new Date().toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState<EmployeeOvertime[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

    const { companyName } = useOwner();

    const totalOvertime =
        data?.reduce((sum, emp) => sum + emp.totalOverTime, 0) ?? 0;
    const employeesWithOT =
        data?.filter((emp) => emp.totalOverTime > 0).length ?? 0;
    const totalEmployees = data?.length ?? 0;

    const fetchOvertime = async () => {
        if (!startDate || !endDate || !companyName) { return; }

        setLoading(true);
        setError(null);

        try {
            const res = await apiClient.get<EmployeeOvertimeApi[]>(
                "/company/viewOvertimeHoursByEmployee",
                {
                    params: {
                        companyName,
                        startDate,
                        endDate,
                    },
                }
            );

            const json = res.data || [];

            // Transform week-wise data into totals per employee
            const transformed: EmployeeOvertime[] = json.map((emp) => {
                const totalRegular = emp.work.reduce(
                    (sum, w) => sum + (w.regular || 0),
                    0
                );
                const totalHoursWorked = emp.work.reduce(
                    (sum, w) => sum + (w.hoursWorked || 0),
                    0
                );
                const totalOverTime = emp.work.reduce(
                    (sum, w) => sum + (w.overTime || 0),
                    0
                );

                return {
                    employeeNtid: emp.employeeNtid,
                    employeeName: emp.employeeName,
                    weeks: emp.work || [],
                    totalRegular,
                    totalHoursWorked,
                    totalOverTime,
                };
            });

            setData(transformed);
            setHasFetchedOnce(true);

            // auto-expand employees with any OT
            const initialExpanded: Record<string, boolean> = {};
            transformed.forEach((emp) => {
                initialExpanded[emp.employeeNtid] = emp.totalOverTime > 0;
            });
            setExpanded(initialExpanded);
        } catch (err: any) {
            console.error(err);
            const message =
                typeof err === "string"
                    ? err
                    : err?.message || "Something went wrong while fetching data.";
            setError(message);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleEmployee = (ntid: string) => {
        setExpanded((prev) => ({
            ...prev,
            [ntid]: !prev[ntid],
        }));
    };

    const formatWeekLabel = (week: EmployeeWeek) =>
        `${week.weekStartDate} → ${week.weekEndDate}`;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-6">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Overtime Hours by Employee
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
                            Company:{" "}
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {companyName || "—"}
                            </span>
                        </p>
                    </div>

                    {/* Quick totals pill */}
                    {data && (
                        <div className="rounded-2xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm flex flex-wrap gap-x-4 gap-y-1 dark:border-sky-500/40 dark:bg-sky-500/10">
                            <span className="font-medium">
                                Employees:{" "}
                                <span className="text-sky-600 dark:text-sky-300">
                                    {totalEmployees}
                                </span>
                            </span>
                            <span className="font-medium">
                                With OT:{" "}
                                <span className="text-emerald-600 dark:text-emerald-300">
                                    {employeesWithOT}
                                </span>
                            </span>
                            <span className="font-medium">
                                Total OT Hours:{" "}
                                <span className="text-amber-600 dark:text-amber-300">
                                    {totalOvertime.toFixed(2)}
                                </span>
                            </span>
                        </div>
                    )}
                </header>

                {/* Filters */}
                <section className="rounded-2xl border border-slate-200 bg-white backdrop-blur-sm p-4 md:p-5 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="startDate"
                                className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
                            >
                                Start Date
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                max={today}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="endDate"
                                className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
                            >
                                End Date
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                max={today}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={fetchOvertime}
                            disabled={loading || !startDate || !endDate || !companyName}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/30 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-sky-500 transition"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? "Loading..." : "View Overtime"}
                        </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Showing overtime from{" "}
                        <span className="font-medium text-slate-900 dark:text-slate-200">
                            {startDate || "—"}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-slate-900 dark:text-slate-200">
                            {endDate || "—"}
                        </span>
                        .
                    </p>
                </section>

                {/* Error state */}
                {error && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {hasFetchedOnce &&
                    !loading &&
                    !error &&
                    (!data || data.length === 0) && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                            No overtime or hours found for the selected date range.
                        </div>
                    )}

                {/* Summary + Detail */}
                {data && data.length > 0 && (
                    <section className="space-y-6">
                        {/* Summary table */}
                        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                            <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between dark:border-slate-800">
                                <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 uppercase">
                                    Summary by Employee
                                </h2>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Regular hours assumed at 40.00 per week.
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900/70">
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            <th className="px-4 py-2">Employee</th>
                                            <th className="px-4 py-2">NTID</th>
                                            <th className="px-4 py-2 text-right">Regular</th>
                                            <th className="px-4 py-2 text-right">Worked</th>
                                            <th className="px-4 py-2 text-right">Overtime</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((emp) => {
                                            const hasOT = emp.totalOverTime > 0;
                                            const isNoHours = emp.totalHoursWorked === 0;

                                            return (
                                                <tr
                                                    key={emp.employeeNtid}
                                                    className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-900/70 transition"
                                                >
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                                {emp.employeeName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                                        {emp.employeeNtid}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-mono">
                                                        {emp.totalRegular.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-mono">
                                                        {emp.totalHoursWorked.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-mono">
                                                        {emp.totalOverTime.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex justify-center">
                                                            {hasOT ? (
                                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/40">
                                                                    Overtime
                                                                </span>
                                                            ) : isNoHours ? (
                                                                <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/40">
                                                                    No hours
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/40">
                                                                    Regular
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detailed list (accordion style) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 uppercase">
                                    Weekly & Daily Breakdown
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Click on an employee to view week-by-week and per-day details.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {data.map((emp) => {
                                    const isOpen = expanded[emp.employeeNtid];
                                    const hasAnyShifts =
                                        emp.weeks?.some((w) => w.work && w.work.length > 0) || false;

                                    return (
                                        <div
                                            key={emp.employeeNtid}
                                            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleEmployee(emp.employeeNtid)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/90"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                        {emp.employeeName.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            {emp.employeeName}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {emp.employeeNtid}
                                                            {" • "}
                                                            Total:{" "}
                                                            <span className="font-mono">
                                                                {emp.totalHoursWorked.toFixed(2)}h
                                                            </span>{" "}
                                                            (OT{" "}
                                                            <span className="font-mono">
                                                                {emp.totalOverTime.toFixed(2)}h
                                                            </span>
                                                            )
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {emp.totalOverTime > 0 && (
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/40">
                                                            Overtime: {emp.totalOverTime.toFixed(2)}h
                                                        </span>
                                                    )}
                                                    {hasAnyShifts && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {emp.weeks.reduce(
                                                                (count, w) => count + (w.work?.length || 0),
                                                                0
                                                            )}{" "}
                                                            shift
                                                            {emp.weeks.reduce(
                                                                (count, w) => count + (w.work?.length || 0),
                                                                0
                                                            ) !== 1 && "s"}
                                                        </span>
                                                    )}
                                                    {isOpen ? (
                                                        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
                                                    {hasAnyShifts ? (
                                                        <div className="space-y-4 px-4 py-3">
                                                            {emp.weeks.map((week) => {
                                                                const weekHasShifts =
                                                                    week.work && week.work.length > 0;
                                                                return (
                                                                    <div
                                                                        key={`${emp.employeeNtid}-${week.weekStartDate}-${week.weekEndDate}`}
                                                                        className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900"
                                                                    >
                                                                        {/* Week summary header */}
                                                                        <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs md:text-sm dark:border-slate-800">
                                                                            <div className="flex flex-col">
                                                                                <span className="font-semibold text-slate-800 dark:text-slate-100">
                                                                                    Week: {formatWeekLabel(week)}
                                                                                </span>
                                                                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                                    Regular:{" "}
                                                                                    <span className="font-mono">
                                                                                        {week.regular.toFixed(2)}h
                                                                                    </span>
                                                                                    {" • "}
                                                                                    Worked:{" "}
                                                                                    <span className="font-mono">
                                                                                        {week.hoursWorked.toFixed(2)}h
                                                                                    </span>
                                                                                    {" • "}
                                                                                    OT:{" "}
                                                                                    <span className="font-mono">
                                                                                        {week.overTime.toFixed(2)}h
                                                                                    </span>
                                                                                </span>
                                                                            </div>
                                                                            {week.overTime > 0 && (
                                                                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/40">
                                                                                    OT this week: {week.overTime.toFixed(2)}h
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Week shifts table */}
                                                                        {weekHasShifts ? (
                                                                            <div className="overflow-x-auto">
                                                                                <table className="min-w-full text-xs md:text-sm">
                                                                                    <thead className="bg-slate-100 dark:bg-slate-950/80">
                                                                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[11px] md:text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                                                            <th className="px-3 py-2">Date</th>
                                                                                            <th className="px-3 py-2">Store</th>
                                                                                            <th className="px-3 py-2">Clock In</th>
                                                                                            <th className="px-3 py-2">Clock Out</th>
                                                                                            <th className="px-3 py-2 text-right">
                                                                                                Hours Worked
                                                                                            </th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {week.work.map((shift, idx) => (
                                                                                            <tr
                                                                                                key={`${emp.employeeNtid}-${week.weekStartDate}-${idx}-${shift.date}`}
                                                                                                className="border-b border-slate-100 dark:border-slate-900/80"
                                                                                            >
                                                                                                <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px] md:text-xs">
                                                                                                    {shift.date}
                                                                                                </td>
                                                                                                <td className="px-3 py-2 whitespace-nowrap text-slate-900 dark:text-slate-200">
                                                                                                    {shift.storeName}
                                                                                                </td>
                                                                                                <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px] md:text-xs">
                                                                                                    {shift.clockInTime}
                                                                                                </td>
                                                                                                <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px] md:text-xs">
                                                                                                    {shift.clockOutTime}
                                                                                                </td>
                                                                                                <td className="px-3 py-2 text-right font-mono">
                                                                                                    {shift.hoursWorked.toFixed(2)}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                                                No shifts recorded for this week.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                                            No shifts recorded for this employee in the selected
                                                            range.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
