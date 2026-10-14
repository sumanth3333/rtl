"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Search, ShieldCheck } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useEmployee } from "@/hooks/useEmployee";
import { fetchEmployeeDateRange, verifyEmployeeDateRange } from "@/services/employeeVerificationService";
import { ApiError } from "@/services/api/errorHandler";
import { DateRecord, StoreDayRecord } from "@/types/employeeVerification";
import DisputeChangeModal from "@/components/employee/verification/DisputeChangeModal";

type LogRow = {
    key: string;
    date: string;
    dealerStoreId: string;
    storeName: string;
    clockIn: string;
    clockOut: string;
    activations: number;
    upgrades: number;
    hsi: number;
    bts: number;
    hours: number;
    hasOpenSession: boolean;
    status: "VERIFIED" | "NOT_VERIFIED";
    snapshotHash: string;
    raw: StoreDayRecord;
};

type SortKey = "date" | "dealerStoreId" | "activations" | "upgrades" | "hsi" | "bts" | "hours" | "status";

const PIE_COLORS = ["#4f46e5", "#f59e0b", "#059669", "#e11d48", "#0ea5e9", "#a855f7"];

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

const startOfMonth = () => {
    const now = new Date();
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const today = () => toISODate(new Date());

const formatShortDate = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${m}/${d}`;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

const formatTime12h = (value?: string | null) => {
    if (!value) { return null; }
    const [hStr, mStr] = value.split(":");
    const hour = parseInt(hStr, 10);
    if (Number.isNaN(hour)) { return null; }
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${mStr} ${period}`;
};

const buildRows = (records: DateRecord[]): LogRow[] => {
    const rows: LogRow[] = [];
    records.forEach((rec) => {
        rec.stores.forEach((store) => {
            const hours = store.actualWork.reduce((sum, w) => sum + (w.hours || 0), 0);
            const upgrades = store.regularSales.reduce((sum, s) => sum + (s.upgrades || 0), 0);
            const hsi = store.regularSales.reduce((sum, s) => sum + (s.hsi || 0), 0);
            const bts = store.regularSales.reduce((sum, s) => sum + (s.bts || 0), 0);

            const sessions = [...store.actualWork, ...store.incompleteWork, ...store.salesCreditWork]
                .sort((a, b) => (a.clockInTime ?? "").localeCompare(b.clockInTime ?? ""));
            const clockIn = sessions.map((w) => formatTime12h(w.clockInTime) ?? "—").join(", ") || "—";
            const clockOut = sessions.map((w) => formatTime12h(w.clockOutTime) ?? "Open").join(", ") || "—";

            rows.push({
                key: `${rec.date}|${store.dealerStoreId}`,
                date: rec.date,
                dealerStoreId: store.dealerStoreId,
                storeName: store.storeName,
                clockIn,
                clockOut,
                activations: store.activations?.net ?? 0,
                upgrades,
                hsi,
                bts,
                hours: round1(hours),
                hasOpenSession: store.incompleteWork.length > 0,
                status: store.verificationStatus,
                snapshotHash: store.snapshotHash,
                raw: store,
            });
        });
    });
    return rows;
};

export default function VerifyRecordsPage() {
    const { employee } = useEmployee();
    const employeeNtid = employee?.employeeNtid;

    const [secureCode, setSecureCode] = useState("");
    const [fromDate, setFromDate] = useState(startOfMonth());
    const [toDate, setToDate] = useState(today());

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [records, setRecords] = useState<DateRecord[] | null>(null);

    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortAsc, setSortAsc] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [disputedKeys, setDisputedKeys] = useState<Set<string>>(new Set());
    const [verifying, setVerifying] = useState(false);
    const [disputeTarget, setDisputeTarget] = useState<{ date: string; store: StoreDayRecord } | null>(null);

    const handleLoad = async () => {
        if (!employeeNtid) { return; }
        if (secureCode.length !== 6) {
            setLoadError("Enter your 6-digit secure code.");
            return;
        }
        if (!fromDate || !toDate) {
            setLoadError("Select a from and to date.");
            return;
        }

        setLoading(true);
        setLoadError(null);
        try {
            const data = await fetchEmployeeDateRange({ employeeNtid, secureCode, fromDate, toDate });
            setRecords(data);
            setSelected(new Set());
            setDisputedKeys(new Set());
        } catch (err) {
            setLoadError(err instanceof ApiError ? err.message : "Failed to load your records. Please check your secure code and try again.");
        } finally {
            setLoading(false);
        }
    };

    const rows = useMemo(() => (records ? buildRows(records) : []), [records]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        const filtered = q
            ? rows.filter((r) => r.date.includes(q) || r.storeName.toLowerCase().includes(q) || r.dealerStoreId.toLowerCase().includes(q))
            : rows;
        const sorted = [...filtered].sort((a, b) => {
            const dir = sortAsc ? 1 : -1;
            const av = a[sortKey];
            const bv = b[sortKey];
            if (typeof av === "number" && typeof bv === "number") { return (av - bv) * dir; }
            return String(av).localeCompare(String(bv)) * dir;
        });
        return sorted;
    }, [rows, search, sortKey, sortAsc]);

    const stats = useMemo(() => {
        const totalActivations = rows.reduce((s, r) => s + r.activations, 0);
        const totalHours = round1(rows.reduce((s, r) => s + r.hours, 0));
        const workDays = new Set(rows.filter((r) => r.hours > 0 || r.hasOpenSession).map((r) => r.date)).size;
        const openSessions = rows.filter((r) => r.hasOpenSession).length;
        const totalUpgrades = rows.reduce((s, r) => s + r.upgrades, 0);
        const totalBts = rows.reduce((s, r) => s + r.bts, 0);
        return { totalActivations, totalHours, workDays, totalUpgrades, totalBts, openSessions };
    }, [rows]);

    const dailyActivations = useMemo(
        () => (records ?? []).map((rec) => ({
            date: formatShortDate(rec.date),
            value: rec.stores.reduce((sum, s) => sum + (s.activations?.net ?? 0), 0),
        })),
        [records]
    );

    const dailyHours = useMemo(
        () => (records ?? []).map((rec) => ({
            date: formatShortDate(rec.date),
            value: round1(rec.stores.reduce((sum, s) => sum + s.actualWork.reduce((a, w) => a + (w.hours || 0), 0), 0)),
        })),
        [records]
    );

    const activationsByStore = useMemo(() => {
        const map = new Map<string, number>();
        rows.forEach((r) => {
            map.set(r.storeName, (map.get(r.storeName) ?? 0) + r.activations);
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
    }, [rows]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortAsc((prev) => !prev);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const toggleSelect = (key: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const verifyKeys = async (keys: string[]) => {
        if (!employeeNtid || keys.length === 0) { return; }
        setVerifying(true);
        try {
            const verifications = keys.map((key) => {
                const row = rows.find((r) => r.key === key);
                return { date: row!.date, dealerStoreId: row!.dealerStoreId, snapshotHash: row!.snapshotHash };
            });
            const updated = await verifyEmployeeDateRange({ employeeNtid, secureCode, fromDate, toDate, verifications });

            setRecords((prev) => {
                if (!prev) { return prev; }
                const updatedByKey = new Map<string, StoreDayRecord>();
                updated.forEach((rec) => rec.stores.forEach((s) => updatedByKey.set(`${rec.date}|${s.dealerStoreId}`, s)));
                return prev.map((rec) => ({
                    ...rec,
                    stores: rec.stores.map((s) => updatedByKey.get(`${rec.date}|${s.dealerStoreId}`) ?? s),
                }));
            });
            setSelected(new Set());
            toast.success(keys.length === 1 ? "Day verified." : `${keys.length} days verified.`);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Failed to verify. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    const selectableSelected = Array.from(selected).filter((key) => {
        const row = rows.find((r) => r.key === key);
        return row && row.status === "NOT_VERIFIED" && !disputedKeys.has(key);
    });

    const selectableFilteredKeys = filteredRows
        .filter((r) => r.status === "NOT_VERIFIED" && !disputedKeys.has(r.key))
        .map((r) => r.key);
    const allFilteredSelected = selectableFilteredKeys.length > 0 && selectableFilteredKeys.every((key) => selected.has(key));

    const toggleSelectAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allFilteredSelected) {
                selectableFilteredKeys.forEach((key) => next.delete(key));
            } else {
                selectableFilteredKeys.forEach((key) => next.add(key));
            }
            return next;
        });
    };

    if (!employeeNtid) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
            <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Verify My Records</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Review your clock times and sales for a date range, confirm they're correct, or request a correction.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">To</label>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Secure Code
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={secureCode}
                            onChange={(e) => setSecureCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="••••••"
                            className="w-full p-2 text-center tracking-[0.4em] border rounded-md bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleLoad}
                        disabled={loading}
                        className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? "Loading..." : "Load Report"}
                    </button>
                </div>
                {loadError && <p className="text-sm text-rose-600 dark:text-rose-400 mt-3">{loadError}</p>}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Your secure code is the same one you use to confirm clock-ins.
                </p>
            </div>

            {records && (
                <>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Employee: {employee?.employeeName ?? employeeNtid} &nbsp;|&nbsp; Period: {fromDate} – {toDate} &nbsp;|&nbsp; {records.length} days returned
                    </div>

                    {stats.openSessions > 0 && (
                        <div className="flex items-start gap-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                {stats.openSessions} {stats.openSessions === 1 ? "day has" : "days have"} a clock-in with no clock-out recorded.
                                Look for the <span className="font-semibold">Open Session</span> tag below and dispute it to request the correct clock-out time.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { label: "Total Activations", value: stats.totalActivations },
                            { label: "Total Hours", value: stats.totalHours },
                            { label: "Work Days", value: stats.workDays },
                            { label: "Upgrades", value: stats.totalUpgrades },
                            { label: "BTS", value: stats.totalBts },
                        ].map((tile) => (
                            <div key={tile.label} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-3 text-center">
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{tile.value}</p>
                                <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-1">{tile.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Daily Activations</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={dailyActivations}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Daily Hours Worked</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={dailyHours}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Activations by Store</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={activationsByStore} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                                        {activationsByStore.map((entry, index) => (
                                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Work Log Detail</h2>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Filter by date or store..."
                                        className="pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => verifyKeys(selectableSelected)}
                                    disabled={selectableSelected.length === 0 || verifying}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Verify Selected ({selectableSelected.length})
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] sm:text-xs md:text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 w-8">
                                            <input
                                                type="checkbox"
                                                checked={allFilteredSelected}
                                                disabled={selectableFilteredKeys.length === 0}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                                aria-label="Select all"
                                            />
                                        </th>
                                        {([
                                            ["date", "Date"],
                                            ["dealerStoreId", "Store"],
                                        ] as [SortKey, string][]).map(([key, label]) => (
                                            <th key={key} className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort(key)}>
                                                {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : "↕"}
                                            </th>
                                        ))}
                                        <th className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 whitespace-nowrap">Clock In</th>
                                        <th className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 whitespace-nowrap">Clock Out</th>
                                        {([
                                            ["activations", "Activations"],
                                            ["upgrades", "Upgrades"],
                                            ["hsi", "HSI"],
                                            ["bts", "BTS"],
                                            ["hours", "Hours"],
                                            ["status", "Status"],
                                        ] as [SortKey, string][]).map(([key, label]) => (
                                            <th key={key} className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort(key)}>
                                                {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : "↕"}
                                            </th>
                                        ))}
                                        <th className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredRows.map((row) => {
                                        const isDisputed = disputedKeys.has(row.key);
                                        return (
                                            <tr key={row.key} className="text-gray-800 dark:text-gray-200">
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3">
                                                    {row.status === "NOT_VERIFIED" && !isDisputed && (
                                                        <input type="checkbox" checked={selected.has(row.key)} onChange={() => toggleSelect(row.key)} className="rounded" />
                                                    )}
                                                </td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 whitespace-nowrap">{formatShortDate(row.date)}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="inline-block px-1.5 py-0.5 sm:px-2 rounded bg-gray-100 dark:bg-gray-800 text-[10px] sm:text-xs">{row.dealerStoreId}</span>
                                                        {row.hasOpenSession && (
                                                            <span
                                                                title="Clocked in with no clock-out recorded"
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[9px] sm:text-[10px] font-semibold"
                                                            >
                                                                <AlertTriangle className="w-3 h-3" /> Open Session
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 whitespace-nowrap tabular-nums">{row.clockIn}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 whitespace-nowrap tabular-nums">{row.clockOut}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 tabular-nums">{row.activations}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 tabular-nums">{row.upgrades}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 tabular-nums">{row.hsi}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 tabular-nums">{row.bts}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 tabular-nums">{row.hours.toFixed(2)}</td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3">
                                                    {isDisputed ? (
                                                        <span className="inline-flex items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 whitespace-nowrap">
                                                            Correction Requested
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-semibold whitespace-nowrap ${row.status === "VERIFIED"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                                            }`}>
                                                            {row.status === "VERIFIED" ? "Verified" : "Not Verified"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 md:px-3 text-right whitespace-nowrap">
                                                    {!isDisputed && (
                                                        <div className="inline-flex gap-1.5">
                                                            {row.status === "NOT_VERIFIED" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => verifyKeys([row.key])}
                                                                    disabled={verifying}
                                                                    className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                                                                >
                                                                    Verify
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => setDisputeTarget({ date: row.date, store: row.raw })}
                                                                className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                                                            >
                                                                Dispute
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredRows.length === 0 && (
                                        <tr>
                                            <td colSpan={12} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No rows match.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!records && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500">
                    <ClipboardCheck className="w-10 h-10 mb-2" />
                    <p className="text-sm">Enter your secure code and a date range, then load your report.</p>
                </div>
            )}

            {disputeTarget && employeeNtid && (
                <DisputeChangeModal
                    date={disputeTarget.date}
                    store={disputeTarget.store}
                    baseRequest={{ employeeNtid, secureCode, fromDate, toDate }}
                    onClose={() => setDisputeTarget(null)}
                    onSubmitted={(date, dealerStoreId) => {
                        setDisputedKeys((prev) => new Set(prev).add(`${date}|${dealerStoreId}`));
                        setDisputeTarget(null);
                        toast.success("Correction request submitted. Your owner will review it.");
                    }}
                />
            )}
        </div>
    );
}
