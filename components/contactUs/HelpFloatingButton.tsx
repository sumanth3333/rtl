"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LifeBuoy, X } from "lucide-react";

import EmployeeContactUsPanel from "./EmployeeContactUsPanel";
import OwnerContactUsPanel from "./OwnerContactUsPanel";

export default function HelpFloatingButton({ role }: { role: "EMPLOYEE" | "OWNER" }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const contactUsPath = role === "EMPLOYEE" ? "/dashboard/employee/contact-us" : "/dashboard/owner/contact-us";
    if (pathname?.startsWith(contactUsPath)) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Contact support"
                className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all"
            >
                <LifeBuoy className="w-5 h-5" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full sm:w-[420px] max-h-[90vh] sm:max-h-[640px] flex flex-col rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                                    <LifeBuoy className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contact Support</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                                className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            {role === "EMPLOYEE" ? (
                                <EmployeeContactUsPanel onCancel={() => setOpen(false)} />
                            ) : (
                                <OwnerContactUsPanel />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
