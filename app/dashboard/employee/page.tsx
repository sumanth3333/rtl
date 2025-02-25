"use client";

import Card from "@/components/ui/card/Card";
import { dashboardCards, Role } from "@/config/roleConfig";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeeDashboard() {
    const { role, isLoading } = useAuth();

    console.log("🖥️ EmployeeDashboard: Role:", role, "Loading:", isLoading);

    // Loading state until authentication is fully resolved
    if (isLoading || role === undefined) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-base sm:text-lg animate-pulse">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    // If user is not authenticated
    if (!role) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-base sm:text-lg">
                    Please log in to access the dashboard.
                </p>
            </div>
        );
    }

    const typedRole = role as Role;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <header className="mb-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Welcome to {typedRole.charAt(0).toUpperCase() + typedRole.slice(1).toLowerCase()} Dashboard
                </h2>
                <p className="mt-1 text-sm sm:text-base md:text-lg text-gray-600">
                    Manage Tasks, Inventory, EOD Report and more.
                </p>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardCards[typedRole]?.map((card) => (
                    <Card
                        key={card.link}
                        title={card.title}
                        description={card.description}
                        link={card.link}
                    />
                ))}
            </section>
        </main>
    );
}
