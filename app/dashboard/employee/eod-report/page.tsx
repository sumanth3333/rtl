"use client";

import EodForm from "@/components/employee/EodForm";

export default function LogEodReportPage() {
    return (
        <div className="flex flex-col items-center justify-center lg:min-h-[50vh] sm:min-h-screen bg-gray-50 dark:bg-gray-900">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                End Of Day Report
            </h1>
            <div className="w-full max-w-3xl mt-2">
                <EodForm />
            </div>
        </div>
    );
}
