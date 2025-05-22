"use client";

import { playNotificationSound } from "@/utils/playNotificationSound";
import { useState } from "react";
import { toast } from "react-toastify";

export default function NotificationPreferences() {
    const [prefs, setPrefs] = useState({
        newRequest: true,
        eod: true,
        todo: true,
        inventory: false,
        lowInventory: false,
        employeeClockIn: false,
    });

    const handleSave = () => {
        // Replace with API POST later
        toast.success("Preferences saved!");
        playNotificationSound();
    };

    const labels: { key: keyof typeof prefs; label: string }[] = [
        { key: "newRequest", label: "New Request Raised" },
        { key: "eod", label: "EOD Submission" },
        { key: "todo", label: "To-do Status Update" },
        { key: "inventory", label: "Inventory Updated Notification" },
        { key: "lowInventory", label: "Low Inventory Alert" },
        { key: "employeeClockIn", label: "Employee Clocked-In Alert" },
    ];

    return (
        <div className="space-y-4">
            {labels.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                    <input
                        type="checkbox"
                        checked={prefs[key]}
                        onChange={() => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="accent-blue-600 w-5 h-5"
                    />
                    {label}
                </label>
            ))}

            <button
                onClick={handleSave}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
                Save Preferences
            </button>
        </div>
    );
}
