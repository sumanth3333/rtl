"use client";

import { useState } from "react";
import { XMarkIcon, ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Employee } from "@/types/employeeSchema";
import { DayOfWeek, DayUpdateState, GeneratedScheduleDay, GeneratedScheduleStore, ScheduledEmployee } from "@/types/scheduleTypes";

interface ScheduleGridTableProps {
    stores: GeneratedScheduleStore[];
    employees: Employee[];
    onRemoveEmployee: (dealerStoreId: string, date: string, employeeNtid: string) => void;
    onEditShiftTime: (dealerStoreId: string, date: string, employeeNtid: string, field: "startTime" | "endTime", value: string) => void;
    onChangeEmployee: (dealerStoreId: string, date: string, oldEmployeeNtid: string, newEmployeeNtid: string, newEmployeeName: string) => void;
    onAddEmployee: (dealerStoreId: string, date: string, employeeNtid: string, employeeName: string, startTime: string, endTime: string) => void;
    onUpdateDay: (dealerStoreId: string, date: string) => void;
    dayUpdateState: Record<string, DayUpdateState>;
}

interface ColumnInfo {
    date: string;
    dayOfWeek: DayOfWeek;
}

const SHORT_LABEL: Record<DayOfWeek, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
};

const formatColumnDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const sortByName = (list: Employee[]) => [...list].sort((a, b) => a.employeeName.localeCompare(b.employeeName));

function AssignedEmployeeCell({
    store,
    day,
    employee,
    employees,
    assignedElsewhereToday,
    onRemoveEmployee,
    onEditShiftTime,
    onChangeEmployee,
    onAddEmployee,
}: {
    store: GeneratedScheduleStore;
    day: GeneratedScheduleDay;
    employee: ScheduledEmployee;
    employees: Employee[];
    assignedElsewhereToday: Set<string>;
    onRemoveEmployee: ScheduleGridTableProps["onRemoveEmployee"];
    onEditShiftTime: ScheduleGridTableProps["onEditShiftTime"];
    onChangeEmployee: ScheduleGridTableProps["onChangeEmployee"];
    onAddEmployee: ScheduleGridTableProps["onAddEmployee"];
}) {
    const [editingTime, setEditingTime] = useState(false);
    const [addingCoworker, setAddingCoworker] = useState(false);

    // Exclude the current employee (already shown as the selected option) and anyone
    // already working any store on this date.
    const notAssignedToday = sortByName(employees.filter((emp) => !assignedElsewhereToday.has(emp.employeeNtid)));
    const swapOptions = notAssignedToday.filter((emp) => emp.employeeNtid !== employee.employeeNtid);

    return (
        <div className="rounded-md bg-blue-50/60 dark:bg-blue-950/20 p-1.5 space-y-1">
            <div className="flex items-center justify-between gap-1">
                <select
                    value={employee.employeeNtid}
                    onChange={(e) => {
                        const chosen = employees.find((emp) => emp.employeeNtid === e.target.value);
                        if (chosen) {
                            onChangeEmployee(store.dealerStoreId, day.date, employee.employeeNtid, chosen.employeeNtid, chosen.employeeName);
                        }
                    }}
                    className="min-w-0 flex-1 text-[11px] font-semibold bg-transparent text-gray-900 dark:text-gray-100 border-none p-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                >
                    <option value={employee.employeeNtid}>{employee.employeeName}</option>
                    {swapOptions.map((emp) => (
                        <option key={emp.employeeNtid} value={emp.employeeNtid}>
                            {emp.employeeName}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => setAddingCoworker(!addingCoworker)}
                    className={`flex-shrink-0 p-0.5 rounded transition-colors ${addingCoworker
                        ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                    title="Add another employee to this day"
                >
                    <PlusIcon className="h-3 w-3" />
                </button>
                <button
                    type="button"
                    onClick={() => setEditingTime(!editingTime)}
                    className={`flex-shrink-0 p-0.5 rounded transition-colors ${editingTime
                        ? "text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300"
                        : "text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        }`}
                    title="Edit shift time"
                >
                    <ClockIcon className="h-3 w-3" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemoveEmployee(store.dealerStoreId, day.date, employee.employeeNtid)}
                    className="flex-shrink-0 p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Remove this assignment"
                >
                    <XMarkIcon className="h-3 w-3" />
                </button>
            </div>

            {addingCoworker && (
                <select
                    value=""
                    onChange={(e) => {
                        const chosen = notAssignedToday.find((emp) => emp.employeeNtid === e.target.value);
                        if (chosen) {
                            onAddEmployee(store.dealerStoreId, day.date, chosen.employeeNtid, chosen.employeeName, day.storeOpenTime, day.storeCloseTime);
                            setAddingCoworker(false);
                        }
                    }}
                    className="w-full text-[10px] px-1 py-1 border border-dashed rounded bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                    <option value="">+ Add employee</option>
                    {notAssignedToday.map((emp) => (
                        <option key={emp.employeeNtid} value={emp.employeeNtid}>
                            {emp.employeeName}
                        </option>
                    ))}
                </select>
            )}

            {editingTime && (
                <div className="flex items-center gap-1">
                    <input
                        type="time"
                        value={employee.startTime.slice(0, 5)}
                        onChange={(e) => onEditShiftTime(store.dealerStoreId, day.date, employee.employeeNtid, "startTime", `${e.target.value}:00`)}
                        className="w-[60px] text-[10px] px-1 py-0.5 border rounded bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-gray-400">–</span>
                    <input
                        type="time"
                        value={employee.endTime.slice(0, 5)}
                        onChange={(e) => onEditShiftTime(store.dealerStoreId, day.date, employee.employeeNtid, "endTime", `${e.target.value}:00`)}
                        className="w-[60px] text-[10px] px-1 py-0.5 border rounded bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            )}
        </div>
    );
}

function AddEmployeeCell({
    store,
    day,
    employees,
    unfilled,
    assignedElsewhereToday,
    onAddEmployee,
}: {
    store: GeneratedScheduleStore;
    day: GeneratedScheduleDay;
    employees: Employee[];
    unfilled: boolean;
    assignedElsewhereToday: Set<string>;
    onAddEmployee: ScheduleGridTableProps["onAddEmployee"];
}) {
    const available = sortByName(employees.filter((emp) => !assignedElsewhereToday.has(emp.employeeNtid)));

    return (
        <div>
            <select
                value=""
                onChange={(e) => {
                    const chosen = employees.find((emp) => emp.employeeNtid === e.target.value);
                    if (chosen) {
                        onAddEmployee(store.dealerStoreId, day.date, chosen.employeeNtid, chosen.employeeName, day.storeOpenTime, day.storeCloseTime);
                    }
                }}
                className="w-full text-[10px] px-1 py-1.5 border border-dashed rounded bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">+ Add employee</option>
                {available.map((emp) => (
                    <option key={emp.employeeNtid} value={emp.employeeNtid}>
                        {emp.employeeName}
                    </option>
                ))}
            </select>
            {unfilled && <div className="text-[9px] italic text-rose-400 dark:text-rose-500 mt-0.5">Unfilled</div>}
        </div>
    );
}

export default function ScheduleGridTable({
    stores,
    employees,
    onRemoveEmployee,
    onEditShiftTime,
    onChangeEmployee,
    onAddEmployee,
    onUpdateDay,
    dayUpdateState,
}: ScheduleGridTableProps) {
    // ✅ Union of every date across every store, in case store day-lists ever differ
    const columnsMap = new Map<string, ColumnInfo>();
    stores.forEach((store) =>
        store.days.forEach((day) => {
            if (!columnsMap.has(day.date)) {
                columnsMap.set(day.date, { date: day.date, dayOfWeek: day.dayOfWeek });
            }
        })
    );
    const columns = Array.from(columnsMap.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));

    // ✅ Who's already working somewhere on a given date, across every store — so the
    // dropdowns only ever offer people who are actually free that day.
    const assignedByDate = new Map<string, Set<string>>();
    stores.forEach((store) =>
        store.days.forEach((day) => {
            const set = assignedByDate.get(day.date) ?? new Set<string>();
            day.employees.forEach((e) => set.add(e.employeeNtid));
            assignedByDate.set(day.date, set);
        })
    );

    if (stores.length === 0 || columns.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No schedule to display.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="sticky left-0 top-0 z-20 min-w-[160px] border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">
                                Store
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.date}
                                    className="sticky top-0 z-10 min-w-[150px] border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-2 text-center font-semibold text-gray-700 dark:text-gray-200"
                                >
                                    <div>{SHORT_LABEL[col.dayOfWeek]}</div>
                                    <div className="text-[11px] font-normal text-gray-400 dark:text-gray-500">{formatColumnDate(col.date)}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store, storeIndex) => {
                            const daysByDate = new Map(store.days.map((d) => [d.date, d]));
                            const maxSlots = Math.max(
                                1,
                                ...store.days.map((d) => Math.max(d.requiredEmployees, d.employees.length))
                            );
                            const rowBg = storeIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/60 dark:bg-gray-800/40";

                            const slotRows = Array.from({ length: maxSlots }).map((_, slotIndex) => (
                                <tr key={`${store.dealerStoreId}-${slotIndex}`} className={rowBg}>
                                    {slotIndex === 0 && (
                                        <td
                                            rowSpan={maxSlots + 1}
                                            className="sticky left-0 z-10 border border-gray-200 dark:border-gray-700 bg-inherit px-3 py-2 align-top"
                                        >
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{store.dealerStoreId}</div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">{store.storeName}</div>
                                        </td>
                                    )}

                                    {columns.map((col) => {
                                        const day = daysByDate.get(col.date);
                                        if (!day) {
                                            return <td key={col.date} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40" />;
                                        }

                                        const employee = day.employees[slotIndex];
                                        const isUnfilledSlot = !employee && slotIndex < day.requiredEmployees;
                                        const assignedElsewhereToday = assignedByDate.get(day.date) ?? new Set<string>();

                                        return (
                                            <td key={col.date} className="align-top border border-gray-200 dark:border-gray-700 p-1.5">
                                                {employee ? (
                                                    <AssignedEmployeeCell
                                                        store={store}
                                                        day={day}
                                                        employee={employee}
                                                        employees={employees}
                                                        assignedElsewhereToday={assignedElsewhereToday}
                                                        onRemoveEmployee={onRemoveEmployee}
                                                        onEditShiftTime={onEditShiftTime}
                                                        onChangeEmployee={onChangeEmployee}
                                                        onAddEmployee={onAddEmployee}
                                                    />
                                                ) : (
                                                    <AddEmployeeCell
                                                        store={store}
                                                        day={day}
                                                        employees={employees}
                                                        unfilled={isUnfilledSlot}
                                                        assignedElsewhereToday={assignedElsewhereToday}
                                                        onAddEmployee={onAddEmployee}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ));

                            const updateRow = (
                                <tr key={`${store.dealerStoreId}-update`} className={rowBg}>
                                    {columns.map((col) => {
                                        const day = daysByDate.get(col.date);
                                        if (!day) {
                                            return <td key={col.date} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40" />;
                                        }
                                        const state = dayUpdateState[`${store.dealerStoreId}__${day.date}`];
                                        return (
                                            <td key={col.date} className="border border-gray-200 dark:border-gray-700 px-1.5 py-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => onUpdateDay(store.dealerStoreId, day.date)}
                                                    disabled={state?.status === "saving"}
                                                    title={`Push this day's changes for ${store.dealerStoreId}`}
                                                    className={`w-full text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors disabled:cursor-not-allowed ${state?.status === "success"
                                                        ? "border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                                                        : state?.status === "error"
                                                            ? "border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30"
                                                            : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        }`}
                                                >
                                                    {state?.status === "saving" ? "Updating…" : state?.status === "success" ? "Updated ✓" : state?.status === "error" ? "Retry Update" : "Update"}
                                                </button>
                                                {state?.status === "error" && state.error && (
                                                    <div className="text-[9px] text-red-500 dark:text-red-400 mt-0.5">{state.error}</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );

                            return [...slotRows, updateRow];
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
