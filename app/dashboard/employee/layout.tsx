"use client";
import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
    const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 900);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
            {/* ✅ Sidebar - Always Visible in Collapsed Mode */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* ✅ Main Content - Adjust for Sidebar */}
            <div
                className={`relative flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out
                ${isMobile ? "pl-16" : isCollapsed ? "md:pl-1" : "md:pl-1"}`}
            >
                <Header title="Dashboard" />
                <main className="relative flex-1 p-6 overflow-auto">
                    <div className="relative p-10 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-3xl pointer-events-auto">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

