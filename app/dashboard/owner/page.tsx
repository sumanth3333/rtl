"use client";

import { useEffect, useState } from "react";

import SkeletonTable from "@/components/ui/skeletons/SkeletonTable";
import { useAuth } from "@/hooks/useAuth";
import { useOwner } from "@/hooks/useOwner";

import { getLatestEodByDate, getWhoIsWorking } from "@/services/owner/ownerService";
import { getGoalsTrendingCurrently } from "@/services/owner/getGoalsTrendingCurrently";

import EmployeeList from "@/components/owner/EmployeeList";
import LatestEodList from "@/components/owner/LatestEodList";
import ElbScorecard from "@/components/owner/ElbScorecard";

// ✅ correct type import (adjust path to your actual file)
import type { GoalsTrendingCurrentlyItem } from "@/types/goalsTrending";
import GoalsTrendingTable from "@/components/owner/GoalsTrendingBoard";
import TodayGoalsSection from "@/components/goals/TodayGoalsSection";
import MtdMetricsCards from "@/components/owner/MtdMetricsCards";
import { getMtdMetricsOverall, MtdMetrics } from "@/services/owner/ownerService";

export default function OwnerDashboard() {
    const { role, isLoading } = useAuth();
    const { companyName } = useOwner();

    // ✅ strongly type these if you have types available
    const [workingEmployees, setWorkingEmployees] = useState<any[]>([]);
    const [latestEod, setLatestEod] = useState<any[]>([]);
    const [latestTotals, setLatestTotals] = useState<any | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        return now.toISOString().slice(0, 10);
    });
    const [attemptedYesterday, setAttemptedYesterday] = useState(false);

    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingEod, setLoadingEod] = useState(true);

    const [goalsTrending, setGoalsTrending] = useState<GoalsTrendingCurrentlyItem[]>([]);
    const [loadingGoals, setLoadingGoals] = useState(true);
    const [mtdMetrics, setMtdMetrics] = useState<MtdMetrics | null>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    useEffect(() => {
        if (!companyName) { return; }

        setLoadingEmployees(true);
        setLoadingEod(true);
        setLoadingGoals(true);
        setLoadingMetrics(true);

        getWhoIsWorking(companyName)
            .then((data) => setWorkingEmployees(data ?? []))
            .catch(() => setWorkingEmployees([]))
            .finally(() => setLoadingEmployees(false));

        getLatestEodByDate(companyName, selectedDate)
            .then((eodDetails) => {
                setLatestEod(eodDetails?.salesByStore ?? []);
                setLatestTotals(eodDetails ?? null);
            })
            .catch(() => {
                setLatestEod([]);
                setLatestTotals(null);
            })
            .finally(() => setLoadingEod(false));

        getGoalsTrendingCurrently(companyName)
            .then((data) => setGoalsTrending(data ?? []))
            .catch(() => setGoalsTrending([]))
            .finally(() => setLoadingGoals(false));

        getMtdMetricsOverall(companyName)
            .then((data) => setMtdMetrics(data))
            .catch(() => setMtdMetrics(null))
            .finally(() => setLoadingMetrics(false));
    }, [companyName, selectedDate]);

    // If today's data is empty, fall back to yesterday automatically (one-time)
    useEffect(() => {
        const todayIso = new Date().toISOString().slice(0, 10);
        if (!loadingEod && latestEod.length === 0 && !attemptedYesterday && selectedDate === todayIso) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setSelectedDate(yesterday.toISOString().slice(0, 10));
            setAttemptedYesterday(true);
        }
    }, [loadingEod, latestEod.length, selectedDate, attemptedYesterday]);

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
        <div className="p-3 md:p-6 space-y-3">
            <header className="flex items-center justify-between rounded-xl border border-gray-300 dark:border-gray-700 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-[#0a0f1c] dark:via-[#0c1320] dark:to-[#0a0f1c] px-4 py-4 shadow-sm">
                <div className="space-y-0.5">
                    <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Welcome</p>
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        {companyName || "Owner Dashboard"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Overview of your stores, teams, and daily performance.
                    </p>
                </div>
            </header>

            <main className="space-y-4">
                <MtdMetricsCards metrics={mtdMetrics} loading={loadingMetrics} />
                {/* Goals Trending */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 space-y-3 overflow-x-auto">
                    {loadingGoals ? (
                        <SkeletonTable rows={4} />
                    ) : goalsTrending.length > 0 ? (
                        <GoalsTrendingTable rows={goalsTrending} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No goals data available.</p>
                    )}
                </div>

                {/* Who is Working */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 space-y-3">
                    {loadingEmployees ? (
                        <SkeletonTable rows={3} />
                    ) : workingEmployees.length > 0 ? (
                        <EmployeeList employees={workingEmployees} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No employees currently working.</p>
                    )}
                </div>
                {/* Latest EOD Summary (moved above Today Goals) */}
                <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            📊 EOD Summary
                        </h2>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <label htmlFor="eod-date" className="text-gray-600 dark:text-gray-300">Date:</label>
                            <input
                                id="eod-date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
                            />
                        </div>
                    </div>

                    {loadingEod ? (
                        <SkeletonTable rows={3} />
                    ) : latestEod.length > 0 ? (
                        <LatestEodList eodList={latestEod} totals={latestTotals ?? undefined} />
                    ) : (
                        <p className="text-gray-500 text-sm text-center">No EOD reports available.</p>
                    )}
                </section>


                <div><TodayGoalsSection companyName={companyName} /></div>

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
