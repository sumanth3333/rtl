"use client";

import { useEffect, useState } from "react";
import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";
import { useAuth } from "@/hooks/useAuth";
import { getLatestEodDetails, getWhoIsWorking } from "@/services/owner/ownerService";
import EmployeeList from "@/components/owner/EmployeeList";
import { useOwner } from "@/hooks/useOwner";
import LatestEodList from "@/components/owner/LatestEodList";
import ElbScorecard from "@/components/owner/ElbScorecard";

export default function OwnerDashboard() {
    const { role, isLoading } = useAuth();
    const { companyName } = useOwner();
    const [workingEmployees, setWorkingEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingEod, setLoadingEod] = useState(false);
    const [latestEod, setLatestEod] = useState([]);

    useEffect(() => {
        if (companyName) {
            getWhoIsWorking(companyName)
                .then((data) => setWorkingEmployees(data))
                .catch(() => { })
                .finally(() => setLoadingEmployees(false));

            getLatestEodDetails(companyName)
                .then((eodDetails) => setLatestEod(eodDetails))
                .catch(() => { })
                .finally(() => setLoadingEod(false));
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
        <div className="p-3 md:p-6 space-y-4">
            {/* 🚀 Stunning Welcome Banner */}
            {/* 🚀 Subtle & Modern Welcome Banner */}
            <header className="relative w-full text-white rounded-b-xl overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 opacity-90"></div>

                <div className="relative p-6 flex flex-col items-center md:items-start text-center md:text-left">
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">
                        Welcome, {companyName}
                    </h1>
                    <p className="text-sm md:text-base text-white/80 mt-1">
                        Effortlessly manage your stores, employees, sales data and many more.
                    </p>
                </div>
            </header>

            {/* 🚀 Dashboard Sections */}
            <main className="space-y-4">
                {/* ✅ Who is Working */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📍 Who is Working</h2>
                    {loadingEmployees ? (
                        <SkeletonTable rows={3} />
                    ) : workingEmployees.length > 0 ? (
                        <EmployeeList employees={workingEmployees} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No employees currently working.</p>
                    )}
                </section>

                {/* ✅ Latest EOD Summary */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📊 Latest EOD Summary</h2>
                    {loadingEod ? (
                        <SkeletonTable rows={3} />
                    ) : latestEod.length > 0 ? (
                        <LatestEodList eodList={latestEod} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No EOD reports available.</p>
                    )}
                </section>

                {/* ✅ ELB Scorecard */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📈 ELB Scorecard</h2>
                    <ElbScorecard companyName={companyName} />
                </section>
            </main>
        </div>
    );
}
