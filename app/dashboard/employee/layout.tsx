"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import Header from "@/components/ui/home/Header";
import Footer from "@/components/ui/home/Footer";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // ✅ Detect screen size on mount & resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsCollapsed(false); // Always expanded on large screens
            }
        };
        handleResize(); // Initialize on mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-all duration-300">

            {/* ✅ Sidebar with `isMobile` Prop */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} />

            {/* ✅ Main Content */}
            <div
                className={`relative flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out
                ${isMobile ? "pl-0" : isCollapsed ? "md:pl-0" : "md:pl-0"}`}
            >
                <Header title="Dashboard" onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
                <main className="relative flex-1 overflow-auto p-6">
                    <div className="relative p-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
