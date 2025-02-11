"use client";

import Card from "@/components/ui/Card";
import { dashboardCards, Role } from "@/config/roleConfig";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeDashboard() {
    const { role, isLoading } = useAuth();

    console.log("🖥️ AdminDashboard: Role:", role, "Loading:", isLoading);

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

    const typedRole = role as Role;

    return (
        <div>
            <h2 className="text-2xl font-bold">Welcome to your {typedRole.charAt(0).toUpperCase() + typedRole.slice(1).toLowerCase()} Dashboard</h2>
            <p className="text-gray-600">Manage Companies, Stores, Invoices, and Payments.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {dashboardCards[typedRole]?.map((card) => (
                    <Card key={card.link} title={card.title} description={card.description} link={card.link} />
                ))}
            </div>
        </div>
    );
}
