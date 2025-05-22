"use client";

import ChangePasswordForm from "@/components/owner/settings/ChangePasswordForm";
import NotificationPreferences from "@/components/owner/settings/NotificationPreferences";
import { useState } from "react";

const tabs = [
    { key: "changePassword", label: "Change Password" },
    { key: "notifications", label: "Notification Preferences" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("changePassword");

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#334155] py-10 px-6">
            <div className="max-w-3xl mx-auto bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">Settings</h1>

                <div className="flex justify-center mb-6 space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full font-medium transition ${activeTab === tab.key
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "changePassword" && <ChangePasswordForm />}
                {activeTab === "notifications" && <NotificationPreferences />}
            </div>
        </div>
    );
}
