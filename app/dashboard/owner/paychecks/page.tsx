"use client";

import { useState } from "react";

export default function PaycheckPage() {
    const [activeSection, setActiveSection] = useState("generatePay");

    return (
        <main className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-all duration-300">

            {/* ✅ Content Section (Padding added to prevent content from going behind navbar) */}
            <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 mt-14">
                {activeSection === "generatePay" && (
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Generate Pay</h1>
                        <p className="text-gray-700 dark:text-gray-300">
                            Generate pay for employees by selecting **date range** or **monthly payroll**.
                        </p>
                    </div>
                )}

                {activeSection === "setupEmployeePay" && (
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Employee Pay Setup</h1>
                        <p className="text-gray-700 dark:text-gray-300">
                            Setup **default pay rate, commission percentage, box target incentives, and account target incentives**.
                        </p>
                    </div>
                )}

                {activeSection === "companyCommission" && (
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Company Commission Settings</h1>
                        <p className="text-gray-700 dark:text-gray-300">
                            Configure **commission structure, payment frequency, tier limits, and incentives per box**.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
