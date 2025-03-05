"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import Header from "@/components/ui/home/Header";
import Footer from "@/components/ui/home/Footer";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
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
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
            {/* ✅ Sidebar with `isMobile` Prop */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} />

            {/* ✅ Main Content */}
            <div className="relative flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
                <Header title="Dashboard" onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />

                {/* ✅ High-End Content Section */}
                <main className="relative flex-1 overflow-auto p-4 md:p-6">
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 p-4 md:p-6">
                        {children}
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
