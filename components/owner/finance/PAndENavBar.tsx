"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PAndENavBarProps {
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
}

const LINKS = [
    { name: "Expenses", href: "/dashboard/owner/finance" },
    { name: "Update Compensation", href: "/dashboard/owner/finance/compensation" },
    { name: "Profit Lookup", href: "/dashboard/owner/finance/profit" },
    { name: "Performance Bonus", href: "/dashboard/owner/finance/pb-forecast" },
] as const;


export default function PAndENavBar({ selectedMonth, setSelectedMonth }: PAndENavBarProps) {
    const pathname = usePathname();

    return (
        <section className="relative">
            {/* Premium container */}
            <nav
                className="
          relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800/70
          bg-white/80 dark:bg-gray-950/50 backdrop-blur-xl
          shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]
        "
                aria-label="Profit & Expenses Navigation"
            >
                {/* subtle header stripe */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400" />

                <div className="p-4 sm:p-5 lg:p-6">
                    {/* Top row: Title + Month */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Title block */}
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                                    Profits & Expenses
                                </h1>
                            </div>

                            {/* compact month on very small screens */}
                            <div className="lg:hidden">
                                <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                            </div>
                        </div>

                        {/* Month picker on desktop/tablet */}
                        <div className="hidden lg:flex lg:justify-end">
                            <MonthPicker selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-4 sm:my-5 h-px bg-gray-200/70 dark:bg-gray-800/70" />

                    {/* Links: wraps cleanly on every breakpoint */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {LINKS.map((link) => {
                            const isActive =
                                pathname === link.href ||
                                (link.href !== "/dashboard/owner/finance" && pathname.startsWith(link.href + "/"));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={[
                                        "group relative inline-flex items-center justify-center",
                                        "rounded-full px-4 py-2 sm:px-5 sm:py-2.5",
                                        "text-sm sm:text-[15px] font-semibold",
                                        "transition-all duration-200",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                                        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
                                        // sizing & wrapping stability
                                        "min-w-[140px] sm:min-w-[170px] text-center",
                                        isActive
                                            ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20 dark:from-blue-500 dark:to-indigo-500"
                                            : "text-gray-800 dark:text-gray-100 bg-gray-100/80 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-900 dark:hover:border-gray-700",
                                    ].join(" ")}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <span className="truncate">{link.name}</span>
                                    {/* subtle active/hover glow */}
                                    <span
                                        className={[
                                            "pointer-events-none absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                                            "inset-0 rounded-full",
                                            !isActive ? "shadow-[0_0_0_6px_rgba(59,130,246,0.10)] dark:shadow-[0_0_0_6px_rgba(59,130,246,0.12)]" : "",
                                        ].join(" ")}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </section>
    );
}

function MonthPicker({
    selectedMonth,
    setSelectedMonth,
}: {
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Select Month
            </span>

            <div className="relative">
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="
            w-[170px] sm:w-[190px]
            rounded-xl border border-gray-300/70 dark:border-gray-800/70
            bg-white/90 dark:bg-gray-950/40
            px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100
            shadow-sm
            outline-none
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          "
                />
                {/* subtle input highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/40 dark:ring-white/5" />
            </div>
        </div>
    );
}
