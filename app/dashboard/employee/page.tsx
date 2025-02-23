"use client";

import Card from "@/components/ui/card/Card";
import { dashboardCards, Role } from "@/config/roleConfig";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeDashboard() {
    const { role, isLoading } = useAuth();

    console.log("🖥️ EmployeeDashboard: Role:", role, "Loading:", isLoading);

    // ✅ Show loading state until authentication is fully resolved
    if (isLoading || role === undefined) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    // ✅ Prevent false negative by ensuring role is checked AFTER loading
    if (!role) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Please log in to access the dashboard.</p>
            </div>
        );
    }

    const typedRole = role as Role;

    return (
        <div>
            <h2 className="text-2xl font-bold">Welcome to {typedRole.charAt(0).toUpperCase() + typedRole.slice(1).toLowerCase()} Dashboard</h2>
            <p className="text-gray-600">Manage Tasks, inventory, EOD Report and more.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {dashboardCards[typedRole]?.map((card) => (
                    <Card key={card.link} title={card.title} description={card.description} link={card.link} />
                ))}
            </div>
        </div>
    );
}
