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
        <div className="relative flex min-h-screen bg-white dark:bg-slate-900 transition-all duration-300">
            {/* subtle dotted overlay for texture */}
            <div className="pointer-events-none absolute inset-0 opacity-0" />
            {/* ✅ Sidebar with `isMobile` Prop (sticky so it never scrolls away) */}
            <div className="sticky top-0 h-screen z-50">
                <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobile={isMobile} />
            </div>

            {/* ✅ Main Content */}
            <div className="relative flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out">
                <Header title="Dashboard" onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />

                <main className="relative flex-1 overflow-auto px-2 py-2 sm:px-2 sm:py-2 lg:px-2 lg:py-2">
                    <div className="max-w-screen-xl mx-auto w-full">
                        <div className="bg-white dark:bg-slate-900 p-1 sm:p-2 lg:p-2">
                            {children}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
