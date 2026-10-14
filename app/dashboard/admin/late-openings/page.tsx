"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAllCompanies } from "@/services/admin/adminService";
import { fetchLateOpeningDetails } from "@/services/admin/whatsappService";
import { SimpleCompany } from "@/types/fileExportTypes";
import { LateOpeningDetailsResponse } from "@/types/lateOpeningTypes";
import LateOpeningCard from "@/components/admin/whatsapp/LateOpeningCard";

type Alert = { type: "success" | "error" | "info"; message: string };

const today = () => new Date().toISOString().slice(0, 10);

export default function LateOpeningsPage() {
    const [companies, setCompanies] = useState<SimpleCompany[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);

    const [companyName, setCompanyName] = useState("");
    const [date, setDate] = useState(today());

    const [report, setReport] = useState<LateOpeningDetailsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<Alert | null>(null);

    useEffect(() => {
        const loadCompanies = async () => {
            setCompaniesLoading(true);
            try {
                const data = await fetchAllCompanies();
                setCompanies(data);
            } catch (error) {
                console.error("❌ Error fetching companies:", error);
                setAlert({ type: "error", message: "Couldn't load companies. Please try again." });
            } finally {
                setCompaniesLoading(false);
            }
        };
        loadCompanies();
    }, []);

    useEffect(() => {
        if (!companyName || !date) {
            setReport(null);
            return;
        }

        const loadReport = async () => {
            setLoading(true);
            setAlert(null);
            try {
                const data = await fetchLateOpeningDetails(companyName, date);
                setReport(data);
            } catch (error) {
                console.error("❌ Error fetching late opening details:", error);
                setReport(null);
                setAlert({ type: "error", message: "Failed to load late opening details for this date." });
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [companyName, date]);

    const sortedEntries = useMemo(() => {
        if (!report) { return []; }
        return [...report.lateOpenings].sort((a, b) => b.lateDurationSeconds - a.lateDurationSeconds);
    }, [report]);

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">⏰ Late Opening Details</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review store openings that missed their scheduled time, WhatsApp reminders sent, and employee replies — for report generation and behavior review.
            </p>

            {alert && (
                <div
                    className={`mt-4 rounded-md px-4 py-3 text-sm ${alert.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : alert.type === "error"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                >
                    {alert.message}
                </div>
            )}

            {/* Filters */}
            <div className="mt-6 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Company</label>
                    <select
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={companiesLoading}
                        className="w-64 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">{companiesLoading ? "Loading companies..." : "Select company"}</option>
                        {companies.map((company) => (
                            <option key={company.companyId} value={company.companyName}>
                                {company.companyName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {!companyName ? (
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Select a company and date to view late opening details.
                </p>
            ) : loading ? (
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">Loading late opening details...</p>
            ) : report ? (
                <>
                    {/* Summary tiles */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <StatTile label="Total Late Openings" value={report.totalLateOpenings} accent="rose" />
                        <StatTile label="Replied" value={report.totalReplied} accent="emerald" />
                        <StatTile label="Awaiting Reply" value={report.totalAwaitingReply} accent="amber" />
                        <StatTile label="Never Replied" value={report.neverReplied} accent="rose" />
                        <StatTile label="Replied After Initial" value={report.repliedAfterInitialMessage} accent="indigo" />
                        <StatTile label="Replied After Reminder 1" value={report.repliedAfterReminder1} accent="indigo" />
                        <StatTile label="Replied After Reminder 2" value={report.repliedAfterReminder2} accent="indigo" />
                        <StatTile label="Avg. Late Duration" value={report.averageLateDuration} accent="amber" />
                        <StatTile label="Avg. Response Time" value={report.averageResponseTime} accent="indigo" />
                    </div>

                    {/* Entries */}
                    <div className="mt-6 space-y-3">
                        {sortedEntries.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                                ✅ No late openings for this date.
                            </p>
                        ) : (
                            sortedEntries.map((entry) => <LateOpeningCard key={entry.reasonId} entry={entry} />)
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

function StatTile({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | number;
    accent: "indigo" | "emerald" | "amber" | "rose";
}) {
    const accentClasses: Record<typeof accent, string> = {
        indigo: "border-indigo-100 bg-indigo-50 text-indigo-900 dark:border-indigo-800/80 dark:bg-indigo-900/30 dark:text-indigo-100",
        emerald: "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-900/30 dark:text-emerald-100",
        amber: "border-amber-100 bg-amber-50 text-amber-900 dark:border-amber-800/80 dark:bg-amber-900/30 dark:text-amber-100",
        rose: "border-rose-100 bg-rose-50 text-rose-900 dark:border-rose-800/80 dark:bg-rose-900/30 dark:text-rose-100",
    };

    return (
        <div className={`rounded-xl border shadow-sm px-3 py-3 ${accentClasses[accent]}`}>
            <p className="text-[11px] uppercase tracking-[0.08em] opacity-80">{label}</p>
            <p className="text-lg font-semibold mt-1 break-words">{value}</p>
        </div>
    );
}
