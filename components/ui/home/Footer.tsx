"use client";

export default function Footer() {
    return (
        <footer className="w-full bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-[#0c1220] dark:via-[#0e1628] dark:to-[#0c1220] text-gray-600 dark:text-gray-300 text-center py-4 border-t border-gray-200 dark:border-gray-700 shadow-inner">
            <p className="text-sm">
                © {new Date().getFullYear()} <span className="font-semibold text-gray-900 dark:text-white">Pro People Tech LLC</span>. All rights reserved.
            </p>
        </footer>
    );
}
