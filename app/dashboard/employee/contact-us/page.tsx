"use client";

import EmployeeContactUsPanel from "@/components/contactUs/EmployeeContactUsPanel";

export default function EmployeeContactUsPage() {
    return (
        <div className="p-3 md:p-6 max-w-2xl mx-auto space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact Support</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Running into an issue with the app? Confirm your secure code, then tell us what&apos;s going on.
                </p>
            </div>

            <EmployeeContactUsPanel />
        </div>
    );
}
