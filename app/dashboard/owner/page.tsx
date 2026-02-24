"use client";

import { useEffect, useState } from "react";

import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";
import { useAuth } from "@/hooks/useAuth";
import { useOwner } from "@/hooks/useOwner";

import { getLatestEodDetails, getWhoIsWorking } from "@/services/owner/ownerService";
import { getGoalsTrendingCurrently } from "@/services/owner/getGoalsTrendingCurrently";

import EmployeeList from "@/components/owner/EmployeeList";
import LatestEodList from "@/components/owner/LatestEodList";
import ElbScorecard from "@/components/owner/ElbScorecard";

// ✅ correct type import (adjust path to your actual file)
import type { GoalsTrendingCurrentlyItem } from "@/types/goalsTrending";
import GoalsTrendingTable from "@/components/owner/GoalsTrendingBoard";
import TodayGoalsSection from "@/components/goals/TodayGoalsSection";

export default function OwnerDashboard() {
    const { role, isLoading } = useAuth();
    const { companyName } = useOwner();

    // ✅ strongly type these if you have types available
    const [workingEmployees, setWorkingEmployees] = useState<any[]>([]);
    const [latestEod, setLatestEod] = useState<any[]>([]);

    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingEod, setLoadingEod] = useState(true);

    const [goalsTrending, setGoalsTrending] = useState<GoalsTrendingCurrentlyItem[]>([]);
    const [loadingGoals, setLoadingGoals] = useState(true);

    useEffect(() => {
        if (!companyName) { return; }

        setLoadingEmployees(true);
        setLoadingEod(true);
        setLoadingGoals(true);

        getWhoIsWorking(companyName)
            .then((data) => setWorkingEmployees(data ?? []))
            .catch(() => setWorkingEmployees([]))
            .finally(() => setLoadingEmployees(false));

        getLatestEodDetails(companyName)
            .then((eodDetails) => setLatestEod(eodDetails ?? []))
            .catch(() => setLatestEod([]))
            .finally(() => setLoadingEod(false));

        getGoalsTrendingCurrently(companyName)
            .then((data) => setGoalsTrending(data ?? []))
            .catch(() => setGoalsTrending([]))
            .finally(() => setLoadingGoals(false));
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
        <div className="p-3 md:p-6 space-y-2">
            {/* Welcome Banner
            <header className="relative w-full text-white rounded-b-xl overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 opacity-90" />
                <div className="relative p-6 flex flex-col items-center md:items-start text-center md:text-left">
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">
                        Welcome, {companyName}
                    </h1>
                    <p className="text-sm md:text-base text-white/80 mt-1">
                        Effortlessly manage your stores, employees, sales data and many more.
                    </p>
                </div>
            </header> */}

            <main className="space-y-4">
                {/* Who is Working + Goals Trending side by side */}
                {/* <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch"> */}

                {/* RIGHT: Goals Trending */}
                <div className="h-full bg-white dark:bg-gray-900 p-4">

                    {loadingGoals ? (
                        <SkeletonTable rows={4} />
                    ) : goalsTrending.length > 0 ? (
                        <GoalsTrendingTable rows={goalsTrending} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No goals data available.</p>
                    )}
                </div>

                {/* LEFT: Who is Working */}
                <div className="h-full bg-white dark:bg-gray-900">

                    {loadingEmployees ? (
                        <SkeletonTable rows={3} />
                    ) : workingEmployees.length > 0 ? (
                        <EmployeeList employees={workingEmployees} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No employees currently working.</p>
                    )}
                </div>


                {/* </section> */}

                <div><TodayGoalsSection companyName={companyName} /></div>
                {/* Latest EOD Summary */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        📊 Latest EOD Summary
                    </h2>

                    {loadingEod ? (
                        <SkeletonTable rows={3} />
                    ) : latestEod.length > 0 ? (
                        <LatestEodList eodList={latestEod} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No EOD reports available.</p>
                    )}
                </section>

                {/* ELB Scorecard */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        📈 ELB Scorecard
                    </h2>
                    <ElbScorecard companyName={companyName} />
                </section>
            </main>
        </div>
    );
}
