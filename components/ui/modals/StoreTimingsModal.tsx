"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/api/apiClient";
import { toast } from "react-toastify";

const weekdays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface StoreTiming {
    weekdayId: number;
    openTime: string;
    closeTime: string;
}

interface Props {
    dealerStoreId: string;
    existingTimings?: StoreTiming[];
    onClose: () => void;
    onSave?: () => void;
}

export default function StoreTimingsModal({
    dealerStoreId,
    existingTimings,
    onClose,
    onSave,
}: Props) {
    const [timings, setTimings] = useState<StoreTiming[]>([]);
    const [saving, setSaving] = useState(false);

    const today = new Date().getDay(); // Sunday = 0 ... Saturday = 6
    const todayWeekdayId = today === 0 ? 7 : today;

    useEffect(() => {
        const defaultTimings: StoreTiming[] = weekdays.map((_, idx) => ({
            weekdayId: idx + 1,
            openTime: "10:00",
            closeTime: idx === 6 ? "17:00" : "19:00",
        }));

        if (existingTimings?.length === 7) {
            const parsed = existingTimings.map((t) => ({
                ...t,
                openTime: formatTo24Hour(t.openTime),
                closeTime: formatTo24Hour(t.closeTime),
            }));
            setTimings(parsed);
        } else {
            setTimings(defaultTimings);
        }
    }, [existingTimings]);

    const handleChange = (index: number, field: "openTime" | "closeTime", value: string) => {
        const updated = [...timings];
        updated[index][field] = value;
        setTimings(updated);
    };

    const handleSubmit = async (isAuto = false) => {
        try {
            setSaving(true);
            await apiClient.post("/store/setUpStoreTimings", {
                dealerStoreId,
                storeTimings: timings,
            });
            if (!isAuto) { toast.success("Store timings saved successfully."); }
            if (onSave) { onSave(); }
            onClose(); // Optional: close on save
        } catch (err) {
            toast.error("Failed to save store timings.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const formatTo24Hour = (time: string) => {
        const [hours, minutes] = time.replace("AM", "").replace("PM", "").trim().split(":");
        let h = parseInt(hours);
        if (time.toLowerCase().includes("pm") && h !== 12) { h += 12; }
        if (time.toLowerCase().includes("am") && h === 12) { h = 0; }
        return `${h.toString().padStart(2, "0")}:${minutes}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Set Store Timings for <span className="text-blue-600">{dealerStoreId}</span>
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {timings.map((t, i) => (
                        <div
                            key={i}
                            className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-md ${t.weekdayId === todayWeekdayId
                                ? "bg-yellow-100 dark:bg-yellow-900"
                                : "bg-gray-50 dark:bg-gray-800"
                                }`}
                        >
                            <div className="w-32 font-medium text-gray-700 dark:text-gray-300">
                                {weekdays[i]}
                            </div>
                            <input
                                type="time"
                                value={t.openTime}
                                onChange={(e) => handleChange(i, "openTime", e.target.value)}
                                className="border rounded p-2 w-32 bg-white dark:bg-gray-700 dark:text-white"
                            />
                            <span className="text-gray-600 dark:text-gray-400">to</span>
                            <input
                                type="time"
                                value={t.closeTime}
                                onChange={(e) => handleChange(i, "closeTime", e.target.value)}
                                className="border rounded p-2 w-32 bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={saving}
                        className={`px-4 py-2 rounded text-white ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
