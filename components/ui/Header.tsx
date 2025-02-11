"use client";

import { useLogout } from "@/hooks/useLogout";
import Button from "@/components/ui/Button"; // ✅ Your existing button component
import { PowerIcon } from "@heroicons/react/24/outline";

export default function Header({ title }: { title: string }) {
    const logout = useLogout();

    return (
        <header className="relative flex items-center justify-between px-6 md:px-10 py-4 
            bg-transparent backdrop-blur-md shadow-none transition-all duration-300">

            {/* ✅ Left - Unselectable Logo (Styled for Perfection) */}
            <div className="text-lg font-semibold tracking-widest text-gray-900 dark:text-gray-100 
                select-none pointer-events-none uppercase px-3 py-1 border border-gray-900 dark:border-gray-100 
                rounded-md">
                <span className="hidden max-[920px]:inline">RTL</span>
                <span className="max-[920px]:hidden">RealTime Logging</span>
            </div>

            {/* ✅ Center - Dynamic Title (Perfectly Centered) */}
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl 
                font-bold tracking-wide text-gray-900 dark:text-gray-100 transition-all duration-300">
                {title}
            </h1>

            {/* ✅ Right - Logout Button */}
            <button
                onClick={logout}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 
                    transition-all shadow-md hover:shadow-lg text-white"
                aria-label="Logout"
            >
                <PowerIcon className="w-6 h-6" />
            </button>
        </header>
    );
}
