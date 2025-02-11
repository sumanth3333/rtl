"use client";

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-center py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm">
                © {new Date().getFullYear()} <span className="font-semibold text-gray-900 dark:text-white">EasyDoers</span>. All rights reserved.
            </p>
        </footer>
    );
}
