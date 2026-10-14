"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarDaysIcon,
    SparklesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserGroupIcon,
    BuildingStorefrontIcon,
    UsersIcon,
    UserMinusIcon,
} from "@heroicons/react/24/outline";
import { useOwner } from "@/hooks/useOwner";
import { getStores, getEmployees } from "@/services/owner/ownerService";
import { generateSchedule, saveSchedule, updateEmployeeSchedule } from "@/services/owner/scheduleService";
import { Store } from "@/schemas/storeSchema";
import { Employee } from "@/types/employeeSchema";
import { DayOfWeek, DayUpdateState, GenerateScheduleResponse, ScheduledEmployee, StoreRequirement } from "@/types/scheduleTypes";
import StoreRequirementsGrid, { WeekdayColumn } from "@/components/owner/schedule/StoreRequirementsGrid";
import ScheduleGridTable from "@/components/owner/schedule/ScheduleGridTable";

type DatePreset = "thisWeek" | "nextWeek" | "custom";

const ALL_DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_BY_JS_INDEX: DayOfWeek[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const SHORT_LABEL: Record<DayOfWeek, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
};

const toISODate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split("T")[0];

const getMonday = (date: Date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    return result;
};

const getThisWeekRange = () => {
    const monday = getMonday(new Date());
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: toISODate(monday), end: toISODate(sunday) };
};

const getNextWeekRange = () => {
    const nextMonday = getMonday(new Date());
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    return { start: toISODate(nextMonday), end: toISODate(nextSunday) };
};

const calcHours = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
};

const formatDisplayDate = (value: string) => {
    if (!value) {
        return "—";
    }
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const computeWeekdayColumns = (start: string, end: string): WeekdayColumn[] => {
    if (!start || !end) {
        return [];
    }
    const [sy, sm, sd] = start.split("-").map(Number);
    const [ey, em, ed] = end.split("-").map(Number);
    const startDate = new Date(sy, sm - 1, sd);
    const endDate = new Date(ey, em - 1, ed);
    if (startDate > endDate) {
        return [];
    }

    const seen = new Map<DayOfWeek, string>();
    const cursor = new Date(startDate);
    while (cursor <= endDate && seen.size < 7) {
        const day = DAY_BY_JS_INDEX[cursor.getDay()];
        if (!seen.has(day)) {
            seen.set(day, toISODate(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    return ALL_DAYS.filter((day) => seen.has(day)).map((day) => ({
        day,
        shortLabel: SHORT_LABEL[day],
        date: seen.get(day) as string,
    }));
};

export default function EmployeeSchedulePage() {
    const { companyName } = useOwner();

    const [stores, setStores] = useState<Store[]>([]);
    const [storesLoading, setStoresLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [datePreset, setDatePreset] = useState<DatePreset>("thisWeek");
    const [scheduleStartDate, setScheduleStartDate] = useState("");
    const [scheduleEndDate, setScheduleEndDate] = useState("");

    const [requirements, setRequirements] = useState<Record<string, Partial<Record<DayOfWeek, number>>>>({});
    const [includedStores, setIncludedStores] = useState<Record<string, boolean>>({});

    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<GenerateScheduleResponse | null>(null);

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // ✅ Employees removed locally but not yet pushed via /employee-schedule/update —
    // kept (with their last known shift) so the update payload can report remove:true.
    const [pendingRemovals, setPendingRemovals] = useState<Record<string, Record<string, ScheduledEmployee[]>>>({});
    const [dayUpdateState, setDayUpdateState] = useState<Record<string, DayUpdateState>>({});

    const weekdays = useMemo(() => computeWeekdayColumns(scheduleStartDate, scheduleEndDate), [scheduleStartDate, scheduleEndDate]);

    // ✅ Default to "This Week" on first load
    useEffect(() => {
        const { start, end } = getThisWeekRange();
        setScheduleStartDate(start);
        setScheduleEndDate(end);
    }, []);

    // ✅ Load the company's stores and employee roster
    useEffect(() => {
        if (!companyName) {
            return;
        }
        setStoresLoading(true);
        getStores(companyName)
            .then((data) => setStores(data))
            .finally(() => setStoresLoading(false));
        getEmployees(companyName).then((data) => setEmployees(data));
    }, [companyName]);

    // ✅ Default every store to 1 required employee per day, and included, once stores load
    useEffect(() => {
        if (stores.length === 0) {
            return;
        }
        setRequirements((prev) => {
            if (Object.keys(prev).length > 0) {
                return prev;
            }
            const next: Record<string, Partial<Record<DayOfWeek, number>>> = {};
            stores.forEach((store) => {
                next[store.dealerStoreId] = ALL_DAYS.reduce((acc, day) => ({ ...acc, [day]: 1 }), {} as Partial<Record<DayOfWeek, number>>);
            });
            return next;
        });
        setIncludedStores((prev) => {
            if (Object.keys(prev).length > 0) {
                return prev;
            }
            const next: Record<string, boolean> = {};
            stores.forEach((store) => {
                next[store.dealerStoreId] = true;
            });
            return next;
        });
    }, [stores]);

    const applyPreset = (preset: DatePreset) => {
        setDatePreset(preset);
        if (preset === "thisWeek") {
            const { start, end } = getThisWeekRange();
            setScheduleStartDate(start);
            setScheduleEndDate(end);
        } else if (preset === "nextWeek") {
            const { start, end } = getNextWeekRange();
            setScheduleStartDate(start);
            setScheduleEndDate(end);
        }
    };

    const onChangeCell = (dealerStoreId: string, day: DayOfWeek, value: number) => {
        setRequirements((prev) => ({
            ...prev,
            [dealerStoreId]: { ...prev[dealerStoreId], [day]: value },
        }));
    };

    const onToggleStore = (dealerStoreId: string) => {
        setIncludedStores((prev) => ({ ...prev, [dealerStoreId]: !(prev[dealerStoreId] ?? true) }));
    };

    const onSetAllIncluded = (included: boolean) => {
        setIncludedStores(stores.reduce((acc, store) => ({ ...acc, [store.dealerStoreId]: included }), {} as Record<string, boolean>));
    };

    const onBulkApply = (value: number) => {
        setRequirements((prev) => {
            const next = { ...prev };
            stores
                .filter((store) => includedStores[store.dealerStoreId] ?? true)
                .forEach((store) => {
                    const dayValues = { ...next[store.dealerStoreId] };
                    weekdays.forEach((col) => {
                        dayValues[col.day] = value;
                    });
                    next[store.dealerStoreId] = dayValues;
                });
            return next;
        });
    };

    const handleGenerate = async () => {
        setGenerateError(null);

        if (!scheduleStartDate || !scheduleEndDate) {
            setGenerateError("Please select a schedule date range.");
            return;
        }

        // Every store/day is scheduled with a default of 1 employee automatically —
        // only send an override when a day actually needs more than that.
        const storeRequirements: StoreRequirement[] = stores
            .filter((store) => includedStores[store.dealerStoreId] ?? true)
            .map((store) => ({
                dealerStoreId: store.dealerStoreId,
                days: weekdays
                    .map((col) => ({ dayOfWeek: col.day, requiredEmployees: requirements[store.dealerStoreId]?.[col.day] ?? 0 }))
                    .filter((d) => d.requiredEmployees > 1),
            }))
            .filter((store) => store.days.length > 0);

        setGenerating(true);
        setSchedule(null);
        setSaveSuccess(false);
        try {
            const result = await generateSchedule({ companyName, scheduleStartDate, scheduleEndDate, storeRequirements });
            setSchedule(result);
        } catch (err) {
            console.error("❌ Failed to generate schedule:", err);
            setGenerateError(err instanceof Error && err.message ? err.message : "Failed to generate the schedule. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const dayStateKey = (dealerStoreId: string, date: string) => `${dealerStoreId}__${date}`;

    const clearDayUpdateState = (dealerStoreId: string, date: string) => {
        const key = dayStateKey(dealerStoreId, date);
        setDayUpdateState((prev) => {
            if (!prev[key]) {
                return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleRemoveEmployee = (dealerStoreId: string, date: string, employeeNtid: string) => {
        // Snapshot the employee before it's filtered out, so a later /update call can still
        // report it with remove:true.
        const removedSnapshot = schedule?.stores
            .find((s) => s.dealerStoreId === dealerStoreId)
            ?.days.find((d) => d.date === date)
            ?.employees.find((e) => e.employeeNtid === employeeNtid);

        setSchedule((prev) => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                stores: prev.stores.map((store) => {
                    if (store.dealerStoreId !== dealerStoreId) {
                        return store;
                    }
                    return {
                        ...store,
                        days: store.days.map((day) => {
                            if (day.date !== date) {
                                return day;
                            }
                            const employees = day.employees.filter((e) => e.employeeNtid !== employeeNtid);
                            return { ...day, employees, assignedEmployees: employees.length, fullyStaffed: employees.length >= day.requiredEmployees };
                        }),
                    };
                }),
            };
        });

        if (removedSnapshot) {
            setPendingRemovals((prev) => {
                const storeMap = { ...(prev[dealerStoreId] ?? {}) };
                const dayList = (storeMap[date] ?? []).filter((e) => e.employeeNtid !== employeeNtid);
                storeMap[date] = [...dayList, removedSnapshot];
                return { ...prev, [dealerStoreId]: storeMap };
            });
        }
        clearDayUpdateState(dealerStoreId, date);
    };

    const handleUpdateDay = async (dealerStoreId: string, date: string) => {
        if (!schedule) {
            return;
        }
        const store = schedule.stores.find((s) => s.dealerStoreId === dealerStoreId);
        const day = store?.days.find((d) => d.date === date);
        if (!store || !day) {
            return;
        }

        const key = dayStateKey(dealerStoreId, date);
        setDayUpdateState((prev) => ({ ...prev, [key]: { status: "saving" } }));

        const activeEmployees = day.employees.map((e) => ({
            employeeNtid: e.employeeNtid,
            shiftStartTime: e.startTime,
            shiftEndTime: e.endTime,
            remove: false,
        }));
        const removedEmployees = (pendingRemovals[dealerStoreId]?.[date] ?? []).map((e) => ({
            employeeNtid: e.employeeNtid,
            shiftStartTime: e.startTime,
            shiftEndTime: e.endTime,
            remove: true,
        }));

        try {
            await updateEmployeeSchedule({
                companyName: schedule.companyName,
                dealerStoreId,
                date,
                employees: [...activeEmployees, ...removedEmployees],
            });
            setPendingRemovals((prev) => {
                if (!prev[dealerStoreId]?.[date]) {
                    return prev;
                }
                const storeMap = { ...prev[dealerStoreId] };
                delete storeMap[date];
                return { ...prev, [dealerStoreId]: storeMap };
            });
            setDayUpdateState((prev) => ({ ...prev, [key]: { status: "success" } }));
        } catch (err) {
            console.error("❌ Failed to update schedule day:", err);
            setDayUpdateState((prev) => ({
                ...prev,
                [key]: { status: "error", error: err instanceof Error && err.message ? err.message : "Failed to update this day." },
            }));
        }
    };

    const handleEditShiftTime = (
        dealerStoreId: string,
        date: string,
        employeeNtid: string,
        field: "startTime" | "endTime",
        value: string
    ) => {
        setSchedule((prev) => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                stores: prev.stores.map((store) => {
                    if (store.dealerStoreId !== dealerStoreId) {
                        return store;
                    }
                    return {
                        ...store,
                        days: store.days.map((day) => {
                            if (day.date !== date) {
                                return day;
                            }
                            return {
                                ...day,
                                employees: day.employees.map((e) => (e.employeeNtid === employeeNtid ? { ...e, [field]: value } : e)),
                            };
                        }),
                    };
                }),
            };
        });
        clearDayUpdateState(dealerStoreId, date);
    };

    // ✅ Swap the person assigned to a slot, keeping their shift time — the score/reason
    // were computed for the original suggestion and no longer apply to the new pick.
    const handleChangeEmployee = (dealerStoreId: string, date: string, oldEmployeeNtid: string, newEmployeeNtid: string, newEmployeeName: string) => {
        setSchedule((prev) => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                stores: prev.stores.map((store) => {
                    if (store.dealerStoreId !== dealerStoreId) {
                        return store;
                    }
                    return {
                        ...store,
                        days: store.days.map((day) => {
                            if (day.date !== date) {
                                return day;
                            }
                            return {
                                ...day,
                                employees: day.employees.map((e) =>
                                    e.employeeNtid === oldEmployeeNtid
                                        ? { ...e, employeeNtid: newEmployeeNtid, employeeName: newEmployeeName, assignmentScore: undefined, assignmentReason: undefined }
                                        : e
                                ),
                            };
                        }),
                    };
                }),
            };
        });
        clearDayUpdateState(dealerStoreId, date);
    };

    // ✅ Add another employee to a specific store/day — used both to fill an unfilled
    // slot and to split a shift between multiple people.
    const handleAddEmployee = (dealerStoreId: string, date: string, employeeNtid: string, employeeName: string, startTime: string, endTime: string) => {
        setSchedule((prev) => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                stores: prev.stores.map((store) => {
                    if (store.dealerStoreId !== dealerStoreId) {
                        return store;
                    }
                    return {
                        ...store,
                        days: store.days.map((day) => {
                            if (day.date !== date) {
                                return day;
                            }
                            const newEmployee: ScheduledEmployee = {
                                employeeNtid,
                                employeeName,
                                startTime,
                                endTime,
                                assignedHours: calcHours(startTime, endTime),
                            };
                            const employees = [...day.employees, newEmployee];
                            return { ...day, employees, assignedEmployees: employees.length, fullyStaffed: employees.length >= day.requiredEmployees };
                        }),
                    };
                }),
            };
        });
        clearDayUpdateState(dealerStoreId, date);
    };

    const handleSave = async () => {
        if (!schedule) {
            return;
        }
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            await saveSchedule({
                companyName: schedule.companyName,
                scheduleStartDate: schedule.scheduleStartDate,
                scheduleEndDate: schedule.scheduleEndDate,
                stores: schedule.stores.map((store) => ({
                    dealerStoreId: store.dealerStoreId,
                    days: store.days.map((day) => ({
                        date: day.date,
                        employees: day.employees.map((e) => ({
                            employeeNtid: e.employeeNtid,
                            shiftStartTime: e.startTime,
                            shiftEndTime: e.endTime,
                        })),
                    })),
                })),
            });
            setSaveSuccess(true);
        } catch (err) {
            console.error("❌ Failed to save schedule:", err);
            setSaveError(err instanceof Error && err.message ? err.message : "Failed to save the schedule. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const kpiTiles = schedule
        ? [
            { label: "Stores", value: schedule.totalStores, icon: BuildingStorefrontIcon },
            { label: "Employees", value: schedule.totalEmployees, icon: UserGroupIcon },
            { label: "Assigned", value: schedule.totalAssignedEmployees, icon: UsersIcon },
            { label: "Left Out", value: schedule.totalLeftOutEmployees, icon: UserMinusIcon },
        ]
        : [];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
            <header className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 via-white to-slate-100 dark:from-[#0a0f1c] dark:via-[#0d1324] dark:to-[#0a0f1c] p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-blue-500" />
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Operations</p>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Employee Schedule</h1>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Set staffing needs per store and day, generate a suggested schedule for {companyName || "your company"}, review the assignments, then save.
                </p>
            </header>

            {/* ✅ Date Range */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    Schedule Week
                </label>

                <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden mb-2">
                    {([
                        ["thisWeek", "This Week"],
                        ["nextWeek", "Next Week"],
                        ["custom", "Custom"],
                    ] as [DatePreset, string][]).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => applyPreset(value)}
                            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${datePreset === value
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {datePreset === "custom" ? (
                    <div className="grid grid-cols-2 gap-2 max-w-sm">
                        <input
                            type="date"
                            value={scheduleStartDate}
                            onChange={(e) => setScheduleStartDate(e.target.value)}
                            className="p-2.5 border rounded-md bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            value={scheduleEndDate}
                            onChange={(e) => setScheduleEndDate(e.target.value)}
                            min={scheduleStartDate}
                            className="p-2.5 border rounded-md bg-white dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-700 dark:text-gray-300">
                        {formatDisplayDate(scheduleStartDate)} <span className="text-gray-400">→</span> {formatDisplayDate(scheduleEndDate)}
                    </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Staffing requirements below are set per weekday. Ranges longer than 7 days reuse the same weekday count for every occurrence.
                </p>
            </div>

            {/* ✅ Store Requirements */}
            {storesLoading ? (
                <div className="flex justify-center items-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Loading stores...</p>
                </div>
            ) : (
                <StoreRequirementsGrid
                    stores={stores}
                    weekdays={weekdays}
                    requirements={requirements}
                    includedStores={includedStores}
                    onChangeCell={onChangeCell}
                    onToggleStore={onToggleStore}
                    onBulkApply={onBulkApply}
                    onSetAllIncluded={onSetAllIncluded}
                />
            )}

            {generateError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{generateError}</p>
                </div>
            )}

            <div className="flex justify-center">
                <button
                    onClick={handleGenerate}
                    disabled={generating || storesLoading}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-md shadow-sm transition-all ${generating || storesLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                        }`}
                >
                    <SparklesIcon className={`h-5 w-5 ${generating ? "animate-pulse" : ""}`} />
                    {generating ? "Generating Schedule..." : "Generate Schedule"}
                </button>
            </div>

            {/* ✅ Generated Schedule Review */}
            {schedule && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {kpiTiles.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex flex-col gap-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-3 shadow-sm"
                            >
                                <Icon className="h-4 w-4 text-blue-500" />
                                <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</span>
                                <span className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{value}</span>
                            </div>
                        ))}
                    </div>

                    <ScheduleGridTable
                        stores={schedule.stores}
                        employees={employees}
                        onRemoveEmployee={handleRemoveEmployee}
                        onEditShiftTime={handleEditShiftTime}
                        onChangeEmployee={handleChangeEmployee}
                        onAddEmployee={handleAddEmployee}
                        onUpdateDay={handleUpdateDay}
                        dayUpdateState={dayUpdateState}
                    />

                    {saveError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3">
                            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">{saveError}</p>
                        </div>
                    )}

                    {saveSuccess && (
                        <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40 px-4 py-3">
                            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                Schedule saved for {formatDisplayDate(schedule.scheduleStartDate)} → {formatDisplayDate(schedule.scheduleEndDate)}.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-md shadow-sm transition-all ${saving
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
                                }`}
                        >
                            <ArrowPathIcon className={`h-5 w-5 ${saving ? "animate-spin" : ""}`} />
                            {saving ? "Saving..." : "Save Schedule"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
