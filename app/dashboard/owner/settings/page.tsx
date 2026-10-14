"use client";

import { useState } from "react";
import { Bell, KeyRound, Lock, Package } from "lucide-react";
import ChangePasswordForm from "@/components/owner/settings/ChangePasswordForm";
import DealerInventoryCommissionForm from "@/components/owner/settings/DealerInventoryCommissionForm";
import NotificationPreferences from "@/components/owner/settings/NotificationPreferences";
import CompanyCredentialsCard from "@/components/owner/settings/credentials/CompanyCredentialsCard";

const sections = [
    {
        key: "changePassword",
        label: "Change Password",
        description: "Update your account password",
        icon: Lock,
        Component: ChangePasswordForm,
    },
    {
        key: "inventoryCommission",
        label: "Dealer Per Box Commission",
        description: "Set the commission rate per box sold",
        icon: Package,
        Component: DealerInventoryCommissionForm,
    },
    {
        key: "notifications",
        label: "Notification Preferences",
        description: "Choose what you get notified about",
        icon: Bell,
        Component: NotificationPreferences,
    },
    {
        key: "companyCredentials",
        label: "Company Credentials",
        description: "Manage the encrypted company login",
        icon: KeyRound,
        Component: CompanyCredentialsCard,
    },
];

export default function SettingsPage() {
    const [activeKey, setActiveKey] = useState(sections[0].key);
    const active = sections.find((s) => s.key === activeKey) ?? sections[0];
    const ActiveComponent = active.Component;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your account, store configuration, and security preferences.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Section nav */}
                    <nav className="w-full md:w-64 shrink-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = section.key === activeKey;
                            return (
                                <button
                                    key={section.key}
                                    type="button"
                                    onClick={() => setActiveKey(section.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition ${isActive
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`} />
                                    {section.label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content panel */}
                    <div className="flex-1 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{active.label}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{active.description}</p>
                        </div>
                        <ActiveComponent />
                    </div>
                </div>
            </div>
        </div>
    );
}
