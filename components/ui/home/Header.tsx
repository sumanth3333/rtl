"use client";

import Link from "next/link";
import { useLogout } from "@/hooks/useLogout";
import { PowerIcon, Bars3Icon } from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Header({ title, onToggleSidebar }: { title: string; onToggleSidebar: () => void }) {
    const logout = useLogout();
    const [isScrolled, setIsScrolled] = useState(false);

    // Detect scroll position
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`flex items-center justify-between px-4 md:px-10 py-4 
                bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700
                transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-none"}`}
        >
            {/* Left: Brand & Sidebar Toggle */}
            <div className="flex items-center gap-4">
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={onToggleSidebar}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700
                        transition-all shadow-md hover:shadow-lg text-gray-900 dark:text-gray-100 flex items-center justify-center
                        sm:hidden"
                    aria-label="Toggle Sidebar"
                >
                    <Bars3Icon className="w-6 h-6" />
                </motion.button>
                <Link href="/" passHref>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-semibold tracking-widest text-gray-900 dark:text-gray-100 uppercase 
                        px-3 py-1 border border-gray-900 dark:border-gray-100 rounded-md transition-all duration-300
                        select-none pointer-events-none"
                    >
                        <span className="hidden sm:inline">RealTime Logging</span>
                        <span className="sm:hidden">RTL</span>
                    </motion.div>
                </Link>
            </div>

            {/* Center: Title */}
            <div className="flex-grow text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="hidden sm:block text-lg md:text-2xl lg:text-3xl font-bold tracking-wide text-gray-900 dark:text-gray-100 transition-all duration-300"
                >
                    {title}
                </motion.h1>
            </div>

            {/* Right: Theme Toggle & Logout */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    onClick={logout}
                    className="p-2 md:p-3 rounded-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 
                        transition-all shadow-md hover:shadow-lg text-white flex items-center justify-center"
                    aria-label="Logout"
                >
                    <PowerIcon className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
            </div>
        </header>
    );
}
