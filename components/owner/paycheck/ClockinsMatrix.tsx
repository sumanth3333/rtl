import { useEffect, useMemo, useState } from "react";
import { StoreClockin, StoreClockinReport } from "@/services/owner/ownerService";

type Props = {
    storeData: StoreClockinReport[];
    storeDates: string[];
    employeeData: StoreClockinReport[];
    employeeDates: string[];
    employeeRange: {
        start: string;
        end: string;
        onChange: (field: "start" | "end", value: string) => void;
    };
};

type EmployeeClockinRow = {
    employeeName: string;
    clockins: (StoreClockin & { storeId: string; storeName: string })[];
};

const statusClasses: Record<string, string> = {
    ONTIME: "bg-emerald-100/70 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-100 dark:border-emerald-800",
    LATE: "bg-rose-100/70 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-100 dark:border-rose-800",
    GRACE: "bg-amber-100/70 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-100 dark:border-amber-800",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
    NODATA: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
};

const severityOrder: Record<string, number> = { LATE: 3, GRACE: 2, ONTIME: 1, CLOSED: 0, NODATA: -1 };

function cellStatus(store: StoreClockinReport, date: string) {
    const matches = store.storeOpeningReport.storeClockins.filter((c) => c.date === date);
    if (!matches || matches.length === 0) {
        return {
            label: "No data",
            className: statusClasses.NODATA,
            entries: [],
            tooltip: "No clock-in recorded"
        };
    }

    const clsStatus = matches.reduce((prev, curr) =>
        (severityOrder[curr.status] ?? -1) > (severityOrder[prev.status] ?? -1) ? curr : prev
        , matches[0]).status;
    const cls = statusClasses[clsStatus] || statusClasses.NODATA;

    const entries = matches.map((m, idx) => ({
        id: `${m.employeeName}-${m.employeeOpeningTime}-${idx}-${m.status}`,
        employee: m.employeeName || "—",
        time: m.employeeOpeningTime || "—",
        note: m.lateDuration || "",
        status: m.status,
        statusClass: statusClasses[m.status] || statusClasses.NODATA,
    }));

    return {
        label: clsStatus === "ONTIME" ? "On time" : clsStatus === "LATE" ? "Late" : clsStatus === "GRACE" ? "Grace" : clsStatus,
        className: cls,
        entries,
        tooltip: matches.map(e => `${e.employeeName || "Unknown"} • ${e.employeeOpeningTime || ""} • ${e.lateDuration || ""}`).join(" | ")
    };
}

function employeeCellStatus(employee: EmployeeClockinRow, date: string) {
    const matches = employee.clockins.filter((c) => c.date === date);
    if (!matches || matches.length === 0) {
        return {
            label: "No data",
            className: statusClasses.NODATA,
            entries: [],
            tooltip: "No clock-in recorded"
        };
    }

    const clsStatus = matches.reduce((prev, curr) =>
        (severityOrder[curr.status] ?? -1) > (severityOrder[prev.status] ?? -1) ? curr : prev
        , matches[0]).status;
    const cls = statusClasses[clsStatus] || statusClasses.NODATA;

    const entries = matches.map((m, idx) => ({
        id: `${m.storeId}-${m.employeeOpeningTime}-${idx}-${m.status}`,
        employee: `${m.storeId} • ${m.storeName || "Store"}`,
        time: m.employeeOpeningTime || "—",
        note: m.lateDuration || "",
        status: m.status,
        statusClass: statusClasses[m.status] || statusClasses.NODATA,
    }));

    return {
        label: clsStatus === "ONTIME" ? "On time" : clsStatus === "LATE" ? "Late" : clsStatus === "GRACE" ? "Grace" : clsStatus,
        className: cls,
        entries,
        tooltip: matches.map(e => `${e.storeName || "Store"} • ${e.employeeOpeningTime || ""} • ${e.lateDuration || ""}`).join(" | ")
    };
}

function CellCard({ info, cellKey }: { info: ReturnType<typeof cellStatus>; cellKey: string }) {
    const [expanded, setExpanded] = useState(false);
    const entries = info.entries;

    if (!entries.length) {
        return (
            <div className="min-w-[130px]">
                <div className={`flex flex-col gap-1 rounded border px-2 py-2 text-[10px] sm:text-[11px] min-h-[78px] ${info.className}`}>
                    <span className="text-[10px] font-normal text-gray-500 dark:text-gray-300 leading-tight">—</span>
                </div>
            </div>
        );
    }

    const displayPriority: Record<string, number> = { ONTIME: 3, GRACE: 2, LATE: 1 };
    const primary =
        entries.reduce((best, curr) =>
            (displayPriority[curr.status] || 0) > (displayPriority[best.status] || 0) ? curr : best,
            entries[0]
        ) || entries[0];
    const visible = expanded ? entries : [primary];

    const statusLabel = (s: string) => (s === "ONTIME" ? "On time" : s === "LATE" ? "Late" : s === "GRACE" ? "Grace" : s);

    return (
        <div className="min-w-[130px]">
            {/* <div className={`flex flex-col gap-2 min-w-[170px] rounded border px-2 py-2 text-[10px] sm:text-[11px] ${info.className}`}> */}
            {/* <div className="flex justify-between">
                <span className="font-semibold leading-tight">{info.label}</span>
            </div> */}
            <div className="space-y-1 text-left">
                {visible.map((e) => (
                    <div key={`${cellKey}-${e.id}`} className={`rounded-md border px-2 py-1 shadow-sm min-h-[78px] ${e.statusClass}`}>
                        <div className="flex justify-between">
                            <span className="text-[10px] font-semibold">{statusLabel(e.status)}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-100">{e.employee}</div>
                        <div className="flex items-center justify-between text-[10px] text-gray-700 dark:text-gray-200 gap-2">
                            <span>{e.time}</span>
                            {entries.length > 1 && (
                                <button
                                    onClick={() => setExpanded((p) => !p)}
                                    className="text-[10px] text-blue-600 dark:text-blue-300 hover:underline"
                                >
                                    {expanded ? "Collapse" : `+${entries.length - 1} more`}
                                </button>
                            )}
                        </div>
                        {/* {e.note && <div className="text-[10px] text-gray-600 dark:text-gray-300">{e.note}</div>} */}
                    </div>
                ))}

            </div>

        </div>
    );
}

export default function ClockinsMatrix({ storeData, storeDates, employeeData, employeeDates, employeeRange }: Props) {
    const employeeClockins: EmployeeClockinRow[] = useMemo(() => {
        const map = new Map<string, EmployeeClockinRow>();
        employeeData.forEach((store) => {
            const storeId = store.store.dealerStoreId;
            const storeName = store.store.storeName;
            store.storeOpeningReport?.storeClockins?.forEach((c) => {
                const key = c.employeeName || "Unknown";
                if (!map.has(key)) {
                    map.set(key, { employeeName: key, clockins: [] });
                }
                map.get(key)?.clockins.push({ ...c, storeId, storeName });
            });
        });
        return Array.from(map.values()).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }, [employeeData]);

    // column order for employee view
    const [employeeColumns, setEmployeeColumns] = useState<string[]>([]);
    const [draggingCol, setDraggingCol] = useState<string | null>(null);

    // reset order when data changes
    useEffect(() => {
        const names = employeeClockins.map((e) => e.employeeName);
        setEmployeeColumns(names);
    }, [employeeClockins]);

    const orderedEmployees = employeeColumns
        .map((name) => employeeClockins.find((e) => e.employeeName === name))
        .filter((e): e is EmployeeClockinRow => Boolean(e));

    const handleDrop = (target: string) => {
        if (!draggingCol || draggingCol === target) {
            return;
        }
        setEmployeeColumns((cols) => {
            const fromIdx = cols.indexOf(draggingCol);
            const toIdx = cols.indexOf(target);
            if (fromIdx === -1 || toIdx === -1) {
                return cols;
            }
            const newCols = [...cols];
            newCols.splice(fromIdx, 1);
            newCols.splice(toIdx, 0, draggingCol);
            return newCols;
        });
        setDraggingCol(null);
    };

    return (
        <div className="space-y-10">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-[11px] sm:text-sm">
                    <thead className="sticky top-0 z-30 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 border-b-2 border-indigo-100 dark:border-slate-700 backdrop-blur shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-left sticky left-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-40 text-[10px] font-semibold tracking-[0.08em] uppercase text-indigo-700 dark:text-slate-100">Store</th>
                            {storeDates.map((d) => {
                                const day = new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
                                return (
                                    <th key={d} className="px-4 py-3 text-center whitespace-nowrap text-[10px] font-semibold tracking-[0.08em] uppercase text-indigo-700 dark:text-slate-100">
                                        <div className="flex flex-col items-center leading-tight gap-1">
                                            <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-50">{d}</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/80 text-slate-600 border border-indigo-100 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700 shadow-sm">{day}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {storeData.map((store) => (
                            <tr key={store.store.dealerStoreId} className="text-gray-900 dark:text-gray-100">
                                <td className="px-4 py-3 font-semibold sticky left-0 bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 z-20 shadow-sm border-r border-indigo-100 dark:border-slate-800 backdrop-blur text-slate-900 dark:text-slate-100">
                                    {store.store.dealerStoreId}
                                    <div className="text-[11px] font-medium text-indigo-700 dark:text-slate-300">{store.store.storeName}</div>
                                </td>
                                {storeDates.map((d) => {
                                    const info = cellStatus(store, d);
                                    return (
                                        <td key={d} className="px-2 py-1 text-center align-top">
                                            <CellCard info={info} cellKey={`${store.store.dealerStoreId}-${d}`} />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pr-2 gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Employee Clock-ins</h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Employees by date, showing clock-in time and store.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Employee range</span>
                        <label className="text-gray-700 dark:text-gray-300">Start</label>
                        <input
                            type="date"
                            value={employeeRange.start}
                            onChange={(e) => employeeRange.onChange("start", e.target.value)}
                            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                        />
                        <label className="text-gray-700 dark:text-gray-300">End</label>
                        <input
                            type="date"
                            value={employeeRange.end}
                            onChange={(e) => employeeRange.onChange("end", e.target.value)}
                            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-[10px] sm:text-[11px]">
                        <thead className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 border-b-2 border-indigo-100 dark:border-slate-700 backdrop-blur shadow-sm">
                            <tr>
                                <th className="px-3 py-2 text-left sticky left-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-30 text-[10px] font-semibold tracking-[0.08em] uppercase text-indigo-700 dark:text-slate-100">Date</th>
                                {orderedEmployees.map((employee) => {
                                    return (
                                        <th
                                            key={`emp-${employee.employeeName}`}
                                            draggable
                                            onDragStart={() => setDraggingCol(employee.employeeName)}
                                            onDragEnd={() => setDraggingCol(null)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => handleDrop(employee.employeeName)}
                                            className={`px-3 py-2 text-center whitespace-nowrap text-[10px] font-semibold tracking-[0.08em] uppercase text-indigo-700 dark:text-slate-100 select-none cursor-move ${draggingCol === employee.employeeName ? "opacity-60 ring-2 ring-indigo-300 dark:ring-indigo-600" : ""}`}
                                        >
                                            <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-50">{employee.employeeName || "Unknown"}</span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {employeeDates.map((d) => {
                                const day = new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
                                return (
                                    <tr key={d} className="text-gray-900 dark:text-gray-100">
                                        <td className="px-3 py-2 font-semibold sticky left-0 bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 z-20 shadow-sm border-r border-indigo-100 dark:border-slate-800 backdrop-blur text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                            <div className="flex flex-col leading-tight gap-0.5">
                                                <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-50">{d}</span>
                                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/80 text-slate-600 border border-indigo-100 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700 shadow-sm w-fit">{day}</span>
                                            </div>
                                    </td>
                                        {orderedEmployees.map((employee) => {
                                            const info = employeeCellStatus(employee, d);
                                            return (
                                                <td key={`emp-${employee.employeeName}-${d}`} className="px-1.5 py-1 text-center align-top">
                                                    <CellCard info={info} cellKey={`${employee.employeeName}-${d}`} />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
