"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import { getEmployees } from "@/services/owner/ownerService";
import { fetchEmployeeLateReasonsByMonth } from "@/services/owner/whatsappService";
import { Employee } from "@/types/employeeSchema";
import { EmployeeLateReasonEntry } from "@/types/lateOpeningTypes";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const statusClasses = (status: string) => {
    switch (status) {
        case "REPLIED":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
        case "READ":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
        case "DELIVERED":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
        case "FAILED":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
        default:
            return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
};

export default function OwnerLateOpeningsPage() {
    const { companyName } = useOwner();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);

    const [employeeNtid, setEmployeeNtid] = useState("");
    const [month, setMonth] = useState(currentMonth());

    const [entries, setEntries] = useState<EmployeeLateReasonEntry[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    useEffect(() => {
        if (!companyName) { return; }
        const loadEmployees = async () => {
            setEmployeesLoading(true);
            try {
                const data = await getEmployees(companyName);
                setEmployees(data);
            } finally {
                setEmployeesLoading(false);
            }
        };
        loadEmployees();
    }, [companyName]);

    useEffect(() => {
        if (!employeeNtid || !month) {
            setEntries(null);
            return;
        }

        const loadReport = async () => {
            setLoading(true);
            setError(null);
            setExpandedRow(null);
            try {
                const data = await fetchEmployeeLateReasonsByMonth(employeeNtid, month);
                setEntries(data);
            } catch (err) {
                console.error("❌ Error fetching late opening reasons:", err);
                setEntries(null);
                setError("Failed to load late opening report for this employee and month.");
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [employeeNtid, month]);

    const summary = useMemo(() => {
        if (!entries) { return null; }
        const replied = entries.filter((entry) => entry.status === "REPLIED").length;
        return {
            total: entries.length,
            replied,
            awaiting: entries.length - replied,
        };
    }, [entries]);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Owner Portal · Reports</p>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Late Opening Report</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Review an employee&apos;s late store openings, WhatsApp reminders, and reasons replied for a given month.
                </p>
            </header>

            <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Employee</label>
                    <select
                        value={employeeNtid}
                        onChange={(e) => setEmployeeNtid(e.target.value)}
                        disabled={employeesLoading}
                        className="w-64 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">{employeesLoading ? "Loading employees..." : "Select employee"}</option>
                        {employees.map((employee) => (
                            <option key={employee.employeeNtid} value={employee.employeeNtid}>
                                {employee.employeeName} ({employee.employeeNtid})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Month</label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {!employeeNtid ? (
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Select an employee and month to view late opening details.
                </p>
            ) : loading ? (
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">Loading late opening report...</p>
            ) : entries ? (
                <>
                    {summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 px-4 py-3 shadow-sm">
                                <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Total Late Openings</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">{summary.total}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 shadow-sm">
                                <p className="text-[11px] uppercase tracking-[0.08em] text-emerald-800 dark:text-emerald-200 opacity-80">Replied</p>
                                <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mt-1">{summary.replied}</p>
                            </div>
                            <div className="rounded-xl border border-amber-100 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-900/30 px-4 py-3 shadow-sm">
                                <p className="text-[11px] uppercase tracking-[0.08em] text-amber-800 dark:text-amber-200 opacity-80">Awaiting Reply</p>
                                <p className="text-lg font-semibold text-amber-900 dark:text-amber-100 mt-1">{summary.awaiting}</p>
                            </div>
                        </div>
                    )}

                    {entries.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
                            ✅ No late openings for this employee in {month}.
                        </p>
                    ) : (
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 shadow-sm overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Date</th>
                                        <th className="px-3 py-2 text-left">Store</th>
                                        <th className="px-3 py-2 text-left">Scheduled</th>
                                        <th className="px-3 py-2 text-left">Clocked In</th>
                                        <th className="px-3 py-2 text-left">Late By</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Reason</th>
                                        <th className="px-3 py-2 text-left">Replied At</th>
                                        <th className="px-3 py-2 text-left">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {entries.map((entry, index) => (
                                        <Fragment key={`${entry.date}-${index}`}>
                                            <tr className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                                                <td className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">{entry.date}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 font-mono text-xs">{entry.storeId}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{entry.scheduledOpeningTime}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{entry.employeeClockInTime}</td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
                                                        {entry.lateDuration}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${statusClasses(entry.status)}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 max-w-xs">{entry.lateReason || "—"}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{entry.repliedTime || "—"}</td>
                                                <td className="px-3 py-2">
                                                    {entry.remarks.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                                                            className="text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:underline whitespace-nowrap"
                                                        >
                                                            {expandedRow === index ? "Hide" : `View (${entry.remarks.length})`}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedRow === index && (
                                                <tr className="bg-gray-50/60 dark:bg-gray-800/30">
                                                    <td colSpan={9} className="px-3 py-3">
                                                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-300">
                                                            {entry.remarks.map((remark, remarkIndex) => (
                                                                <li key={remarkIndex}>{remark}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}
