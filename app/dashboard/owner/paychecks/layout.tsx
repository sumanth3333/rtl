"use client";

import PaycheckNavbar from "@/components/owner/paycheck/PaycheckNavbar";

export default function PaycheckLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-all duration-300">
            {/* ✅ Navbar (Only Added Here) */}
            <PaycheckNavbar />

            {/* ✅ Main Content (Starts Below Navbar) */}
            <section className="w-full mx-auto px-4 sm:px-6 md:px-8 py-6 mt-14">
                {children}
            </section>
        </main>
    );
}
