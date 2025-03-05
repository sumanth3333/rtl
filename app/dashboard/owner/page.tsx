"use client";

import { useEffect, useState } from "react";
import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";
import { useAuth } from "@/hooks/useAuth";
import { getWhoIsWorking } from "@/services/owner/ownerService";
import EmployeeList from "@/components/owner/EmployeeList";
import { useOwner } from "@/hooks/useOwner";

export default function OwnerDashboard() {
    const { role, isLoading } = useAuth();
    const { companyName } = useOwner();
    const [workingEmployees, setWorkingEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);

    useEffect(() => {
        if (companyName) {
            getWhoIsWorking(companyName)
                .then((data) => setWorkingEmployees(data))
                .catch((error) => console.error("Failed to fetch employees:", error))
                .finally(() => setLoadingEmployees(false));
        }
    }, [companyName]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Loading dashboard...</p>
            </div>
        );
    }

    if (!role) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Please log in to access the dashboard.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Welcome Banner */}
            <header className="relative bg-gradient-to-r from-[#E0EAFC] to-[#CFDEF3] dark:from-[#232526] dark:to-[#414345] text-gray-900 dark:text-gray-100 p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl md:text-4xl font-bold text-center md:text-left">Welcome, {companyName}</h1>
                <p className="hidden md:block text-lg mt-2">Manage Companies, Stores, Invoices, and Payments efficiently.</p>
            </header>

            {/* Widgets Section */}
            <main className="space-y-6">
                {/* Who is Working Section */}
                <section>
                    <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide text-gray-900 dark:text-white border-b-4 border-gray-300 dark:border-gray-700 pt-4 pb-2">
                        WHO IS WORKING
                    </h2>

                    {loadingEmployees ? (
                        <SkeletonTable rows={4} />
                    ) : workingEmployees.length > 0 ? (
                        <EmployeeList employees={workingEmployees} />
                    ) : (
                        <p className="text-gray-500">No employees currently working.</p>
                    )}
                </section>

                {/* Additional Widgets Section */}
                <section>
                    <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide text-gray-900 dark:text-white border-b-4 border-gray-300 dark:border-gray-700 pt-4 pb-2">
                        EOD SUMMARY (COMING SOON)
                    </h2>
                    <SkeletonTable rows={6} />

                </section>
                <section>
                    <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide text-gray-900 dark:text-white border-b-4 border-gray-300 dark:border-gray-700 pt-4 pb-2">
                        ELB SCORECARD SO FAR (COMING SOON)
                    </h2>
                    <SkeletonTable rows={6} />

                </section>
            </main>
        </div>
    );
}
