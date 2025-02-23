"use client";

import PaycheckLayout from "../layout";

export default function EmployeePaySetupPage() {
    return (
        <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Employee Pay Setup</h1>
            <p className="text-gray-700 dark:text-gray-300">
                Setup **default pay rate, commission percentage, box target incentives, and account target incentives**.
            </p>

            {/* ✅ Example: Pay Rate Input */}
            <div className="mt-6">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Set Default Pay Rate</label>
                <input
                    type="number"
                    placeholder="Enter hourly pay rate"
                    className="p-3 border rounded-lg w-full max-w-md bg-white dark:bg-gray-800 dark:text-gray-200"
                />
            </div>
        </>
    );
}
