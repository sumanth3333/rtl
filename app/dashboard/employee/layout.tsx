"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import Header from "@/components/ui/home/Header";
import Footer from "@/components/ui/home/Footer";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size on mount & resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsCollapsed(false); // Always expanded on large screens
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-all duration-300">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} />

            <div className="relative flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
                <Header title="Dashboard" onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />

                <main className={`relative flex-1 overflow-auto ${isMobile ? "p-2" : "p-6"}`}>
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}
