"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isSameMonth, parseISO, startOfMonth, subMonths } from "date-fns";
import { CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import { fetchSubmittedAvailability, saveAvailability } from "@/services/employee/scheduleAvailabilityService";
import { DayAvailability } from "@/types/scheduleAvailabilityTypes";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DayEntry = {
    isAvailable: boolean;
    availableFrom: string;
    availableTo: string;
    notes: string;
    submitted: boolean;
};

const toISODate = (d: Date) => format(d, "yyyy-MM-dd");

// Monday-start weekday index (0 = Mon ... 6 = Sun)
const mondayIndex = (d: Date) => (getDay(d) + 6) % 7;

const getMonday = (date: Date) => {
    const result = new Date(date);
    result.setDate(result.getDate() - mondayIndex(result));
    return result;
};

const getNextWeekRange = () => {
    const nextMonday = getMonday(new Date());
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    return { start: toISODate(nextMonday), end: toISODate(nextSunday) };
};

const toInputTime = (time?: string | null) => (time ? time.slice(0, 5) : "");

const formatTimeLabel = (time?: string | null) => {
    if (!time) { return ""; }
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

const emptyEntry = (): DayEntry => ({
    isAvailable: true,
    availableFrom: "",
    availableTo: "",
    notes: "",
    submitted: false,
});

export default function ScheduleAvailabilityPage() {
    const { employee } = useEmployee();
    const employeeNtid = employee?.employeeNtid;

    const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
    const [entries, setEntries] = useState<Record<string, DayEntry>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [modalDate, setModalDate] = useState<string | null>(null);
    const [modalDraft, setModalDraft] = useState({ availableFrom: "", availableTo: "", notes: "" });

    const nextWeek = useMemo(() => getNextWeekRange(), []);
    const today = useMemo(() => new Date(), []);

    const monthDays = useMemo(
        () => eachDayOfInterval({ start: startOfMonth(monthCursor), end: endOfMonth(monthCursor) }),
        [monthCursor]
    );
    const leadingBlanks = mondayIndex(monthDays[0]);

    const isEditable = useCallback(
        (dateStr: string) => dateStr >= nextWeek.start && dateStr <= nextWeek.end,
        [nextWeek]
    );

    useEffect(() => {
        if (!employeeNtid) { return; }
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const submitted = await fetchSubmittedAvailability(employeeNtid, format(monthCursor, "yyyy-MM"));
                if (cancelled) { return; }
                const submittedByDate = new Map(submitted.map((d) => [d.date, d]));

                const next: Record<string, DayEntry> = {};
                monthDays.forEach((day) => {
                    const dateStr = toISODate(day);
                    const found = submittedByDate.get(dateStr);
                    if (found) {
                        next[dateStr] = {
                            isAvailable: found.isAvailable,
                            availableFrom: toInputTime(found.availableFrom),
                            availableTo: toInputTime(found.availableTo),
                            notes: found.notes ?? "",
                            submitted: true,
                        };
                    } else {
                        next[dateStr] = emptyEntry();
                    }
                });
                setEntries(next);
            } catch (err) {
                if (!cancelled) {
                    console.error("❌ Failed to load submitted availability:", err);
                    setError("Failed to load availability. Please try again.");
                }
            } finally {
                if (!cancelled) { setLoading(false); }
            }
        };

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeNtid, monthCursor]);

    const updateEntry = (dateStr: string, patch: Partial<DayEntry>) => {
        if (!isEditable(dateStr)) { return; }
        setEntries((prev) => ({ ...prev, [dateStr]: { ...(prev[dateStr] ?? emptyEntry()), ...patch } }));
        setSuccessMessage(null);
    };

    const openModal = (dateStr: string) => {
        const entry = entries[dateStr] ?? emptyEntry();
        setModalDraft({ availableFrom: entry.availableFrom, availableTo: entry.availableTo, notes: entry.notes });
        setModalDate(dateStr);
    };

    const closeModal = () => setModalDate(null);

    const saveModal = () => {
        if (!modalDate) { return; }
        const entry = entries[modalDate] ?? emptyEntry();
        if (entry.isAvailable && (!modalDraft.availableFrom || !modalDraft.availableTo)) {
            setError("Please set both a start and end time for the shift.");
            return;
        }
        updateEntry(modalDate, {
            availableFrom: modalDraft.availableFrom,
            availableTo: modalDraft.availableTo,
            notes: modalDraft.notes,
        });
        setError(null);
        setModalDate(null);
    };

    const handleSave = async () => {
        if (!employeeNtid) { return; }
        const nextWeekDateStrs = eachDayOfInterval({ start: parseISO(nextWeek.start), end: parseISO(nextWeek.end) }).map(toISODate);
        const visibleDateStrs = nextWeekDateStrs.filter((d) => entries[d] !== undefined);

        if (visibleDateStrs.length === 0) {
            setError("Navigate to the month containing next week to submit availability.");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const availability: DayAvailability[] = visibleDateStrs.map((dateStr) => {
                const entry = entries[dateStr];
                return {
                    date: dateStr,
                    isAvailable: entry.isAvailable,
                    availableFrom: entry.isAvailable && entry.availableFrom ? `${entry.availableFrom}:00` : null,
                    availableTo: entry.isAvailable && entry.availableTo ? `${entry.availableTo}:00` : null,
                    notes: entry.notes.trim() ? entry.notes.trim() : null,
                };
            });

            await saveAvailability({
                employeeNtid,
                month: format(monthCursor, "yyyy-MM"),
                availabilityStartDate: visibleDateStrs[0],
                availabilityEndDate: visibleDateStrs[visibleDateStrs.length - 1],
                availability,
            });

            setEntries((prev) => {
                const next = { ...prev };
                visibleDateStrs.forEach((dateStr) => {
                    next[dateStr] = { ...next[dateStr], submitted: true };
                });
                return next;
            });
            setSuccessMessage("Availability saved successfully.");
        } catch (err) {
            console.error("❌ Failed to save availability:", err);
            setError("Failed to save availability. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (!employeeNtid) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 pb-20">
            <div className="max-w-6xl mx-auto py-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <CalendarCheck className="w-3.5 h-3.5" /> Schedule Availability
                        </p>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Provide your availability for next week
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Only next week ({format(parseISO(nextWeek.start), "MMM d")}–{format(parseISO(nextWeek.end), "MMM d")}) is open for selection.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMonthCursor((prev) => subMonths(prev, 1))}
                            className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-32 text-center">
                            {format(monthCursor, "MMMM yyyy")}
                        </span>
                        <button
                            type="button"
                            onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
                            className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        {!isSameMonth(monthCursor, today) && (
                            <button
                                type="button"
                                onClick={() => setMonthCursor(startOfMonth(new Date()))}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                This month
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 lg:p-6 shadow-sm">
                    {loading ? (
                        <div className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <div className="min-w-[700px]">
                                    <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                        {WEEKDAY_LABELS.map((d) => <div key={d}>{d}</div>)}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1.5 mt-1.5">
                                        {Array.from({ length: leadingBlanks }).map((_, i) => (
                                            <div key={`blank-${i}`} />
                                        ))}
                                        {monthDays.map((day) => {
                                            const dateStr = toISODate(day);
                                            const entry = entries[dateStr] ?? emptyEntry();
                                            const editable = isEditable(dateStr);
                                            const isToday = isSameDay(day, today);

                                            return (
                                                <div
                                                    key={dateStr}
                                                    className={`rounded-lg border p-2 flex flex-col gap-1.5 ${editable ? "min-h-[128px] bg-white dark:bg-gray-900" : "min-h-[92px] bg-gray-50 dark:bg-gray-800/40"} ${isToday ? "border-indigo-500 ring-2 ring-indigo-400" : "border-gray-200 dark:border-gray-700"}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs font-semibold ${isToday ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}`}>
                                                            {format(day, "d")}
                                                        </span>
                                                        {!editable ? (
                                                            <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                                        ) : entry.submitted ? (
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        ) : null}
                                                    </div>

                                                    {!editable ? (
                                                        <div className="flex-1 flex flex-col items-start justify-center gap-1">
                                                            {entry.submitted ? (
                                                                <>
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${entry.isAvailable
                                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                                                            }`}
                                                                    >
                                                                        {entry.isAvailable ? "Available" : "Unavailable"}
                                                                    </span>
                                                                    {entry.isAvailable && entry.availableFrom && entry.availableTo && (
                                                                        <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                                                            {formatTimeLabel(entry.availableFrom)}–{formatTimeLabel(entry.availableTo)}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-[9px] text-gray-400 dark:text-gray-500">
                                                                    {dateStr > nextWeek.end ? "Opens later" : "Not available"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 text-[9px] font-semibold">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateEntry(dateStr, { isAvailable: true })}
                                                                    className={`flex-1 py-1 transition ${entry.isAvailable ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
                                                                >
                                                                    Available
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateEntry(dateStr, { isAvailable: false })}
                                                                    className={`flex-1 py-1 transition ${!entry.isAvailable ? "bg-rose-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
                                                                >
                                                                    Off
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => openModal(dateStr)}
                                                                className={`w-full rounded-md border px-2 py-1.5 text-[10px] font-medium leading-tight whitespace-normal ${entry.isAvailable && entry.availableFrom && entry.availableTo
                                                                    ? "border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30"
                                                                    : "border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                                                                    }`}
                                                            >
                                                                {entry.isAvailable
                                                                    ? (entry.availableFrom && entry.availableTo
                                                                        ? `${formatTimeLabel(entry.availableFrom)} – ${formatTimeLabel(entry.availableTo)}`
                                                                        : "Not full day? Give time")
                                                                    : (entry.notes ? entry.notes : "Add note")}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available</span>
                                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Unavailable</span>
                                <span className="inline-flex items-center gap-1.5"><Lock className="w-3 h-3" /> Not open for selection</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
                        {successMessage && <p className="text-xs text-emerald-600 dark:text-emerald-400">{successMessage}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 shadow-sm"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Availability
                    </button>
                </div>
            </div>

            {modalDate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={closeModal}
                >
                    <div
                        className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {format(parseISO(modalDate), "EEEE, MMM d")}
                        </p>

                        {entries[modalDate]?.isAvailable && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <label className="text-xs text-gray-500 dark:text-gray-400">
                                    From
                                    <input
                                        type="time"
                                        value={modalDraft.availableFrom}
                                        onChange={(e) => setModalDraft((prev) => ({ ...prev, availableFrom: e.target.value }))}
                                        className="mt-1 w-full rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 text-sm text-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
                                    />
                                </label>
                                <label className="text-xs text-gray-500 dark:text-gray-400">
                                    To
                                    <input
                                        type="time"
                                        value={modalDraft.availableTo}
                                        onChange={(e) => setModalDraft((prev) => ({ ...prev, availableTo: e.target.value }))}
                                        className="mt-1 w-full rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 text-sm text-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
                                    />
                                </label>
                            </div>
                        )}

                        <label className="mt-3 block text-xs text-gray-500 dark:text-gray-400">
                            Notes (optional)
                            <input
                                type="text"
                                value={modalDraft.notes}
                                onChange={(e) => setModalDraft((prev) => ({ ...prev, notes: e.target.value }))}
                                placeholder="e.g. Personal day"
                                className="mt-1 w-full rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 py-1 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                            />
                        </label>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={saveModal}
                                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
