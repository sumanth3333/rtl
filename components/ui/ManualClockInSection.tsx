"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Clock } from "lucide-react";

import { fetchAllCompanies } from "@/services/admin/adminService";
import { getStores, getEmployees } from "@/services/owner/ownerService";
import { SimpleCompany } from "@/types/fileExportTypes";
import { Store } from "@/schemas/storeSchema";
import { Employee } from "@/types/employeeSchema";
import { ManualClockInResponse } from "@/types/manualClockInTypes";
import { ApiError } from "@/services/api/errorHandler";

const inputClasses =
    "rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed";

function todayDate() {
    return new Date().toISOString().slice(0, 10);
}

function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface ManualClockInSectionProps {
    // Owner/company usage: companyName is already known, so no company picker is shown.
    // Admin usage: omit companyName and a company picker is shown instead.
    companyName?: string;
    submit: (payload: { dealerStoreId: string; employeeNtid: string; clockInDate: string; clockInTime: string }) => Promise<ManualClockInResponse>;
}

export default function ManualClockInSection({ companyName: fixedCompanyName, submit }: ManualClockInSectionProps) {
    const [companies, setCompanies] = useState<SimpleCompany[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(!fixedCompanyName);
    const [selectedCompany, setSelectedCompany] = useState(fixedCompanyName ?? "");

    const [stores, setStores] = useState<Store[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [selectedEmployeeNtid, setSelectedEmployeeNtid] = useState("");
    const [clockInDate, setClockInDate] = useState(todayDate);
    const [clockInTime, setClockInTime] = useState(nowTime);

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Admin mode only: load the company dropdown once.
    useEffect(() => {
        if (fixedCompanyName) { return; }
        let cancelled = false;
        fetchAllCompanies()
            .then((data) => { if (!cancelled) { setCompanies(data); } })
            .catch(() => { if (!cancelled) { setError("Failed to load companies."); } })
            .finally(() => { if (!cancelled) { setCompaniesLoading(false); } });
        return () => { cancelled = true; };
    }, [fixedCompanyName]);

    // Load stores + employees whenever the active company changes.
    useEffect(() => {
        setSelectedStoreId("");
        setSelectedEmployeeNtid("");
        if (!selectedCompany) {
            setStores([]);
            setEmployees([]);
            return;
        }
        let cancelled = false;
        setOptionsLoading(true);
        setError(null);
        Promise.all([getStores(selectedCompany), getEmployees(selectedCompany)])
            .then(([storeData, employeeData]) => {
                if (cancelled) { return; }
                setStores(storeData);
                setEmployees(employeeData);
            })
            .catch(() => { if (!cancelled) { setError("Failed to load stores/employees for this company."); } })
            .finally(() => { if (!cancelled) { setOptionsLoading(false); } });
        return () => { cancelled = true; };
    }, [selectedCompany]);

    const canSubmit =
        !!selectedCompany && !!selectedStoreId && !!selectedEmployeeNtid && !!clockInDate && !!clockInTime;

    const handleSubmit = async () => {
        if (!canSubmit) { return; }
        setSubmitting(true);
        setError(null);
        try {
            const result = await submit({
                dealerStoreId: selectedStoreId,
                employeeNtid: selectedEmployeeNtid,
                clockInDate,
                clockInTime,
            });
            toast.success(`${result.employeeName} clocked in at ${result.storeName} for ${result.clockInDate} ${result.clockInTime}.`);
            setSelectedEmployeeNtid("");
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to record this clock-in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Manual Clock-In
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Backup for when an employee can&apos;t sign in themselves - clock them in directly.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {!fixedCompanyName && (
                    <label className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</span>
                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            disabled={companiesLoading}
                            className={inputClasses}
                        >
                            <option value="">{companiesLoading ? "Loading companies…" : "Select a company"}</option>
                            {companies.map((c) => (
                                <option key={c.companyId} value={c.companyName}>{c.companyName}</option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store</span>
                    <select
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        disabled={!selectedCompany || optionsLoading}
                        className={inputClasses}
                    >
                        <option value="">
                            {!selectedCompany
                                ? "Select a company first"
                                : optionsLoading
                                    ? "Loading stores…"
                                    : stores.length === 0
                                        ? "No stores found"
                                        : "Select a store"}
                        </option>
                        {stores.map((s) => (
                            <option key={s.dealerStoreId} value={s.dealerStoreId}>
                                {s.storeName} ({s.dealerStoreId})
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee</span>
                    <select
                        value={selectedEmployeeNtid}
                        onChange={(e) => setSelectedEmployeeNtid(e.target.value)}
                        disabled={!selectedCompany || optionsLoading}
                        className={inputClasses}
                    >
                        <option value="">
                            {!selectedCompany
                                ? "Select a company first"
                                : optionsLoading
                                    ? "Loading employees…"
                                    : employees.length === 0
                                        ? "No employees found"
                                        : "Select an employee"}
                        </option>
                        {employees.map((e) => (
                            <option key={e.employeeNtid} value={e.employeeNtid}>
                                {e.employeeName} ({e.employeeNtid})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</span>
                        <input
                            type="date"
                            value={clockInDate}
                            onChange={(e) => setClockInDate(e.target.value)}
                            className={inputClasses}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</span>
                        <input
                            type="time"
                            value={clockInTime}
                            onChange={(e) => setClockInTime(e.target.value)}
                            className={inputClasses}
                        />
                    </label>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="mt-4 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? "Clocking in…" : "Clock In"}
            </button>
        </section>
    );
}
