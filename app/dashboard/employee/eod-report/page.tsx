"use client";

import EodForm from "@/components/employee/EodForm";

export default function LogEodReportPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100 my-4 text-center">
                End Of Day Report
            </h1>
            <div className="w-full max-w-3xl">
                <EodForm />
            </div>
        </div>
    );
}
