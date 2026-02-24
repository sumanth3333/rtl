import { MtdMetrics } from "@/services/owner/ownerService";

type Props = {
    metrics: MtdMetrics | null;
    loading?: boolean;
};

const cards = [
    { key: "totalActivations", label: "Activations", accent: "from-blue-500/15 to-blue-500/0 dark:from-blue-500/10 dark:to-transparent", text: "text-blue-700 dark:text-blue-200" },
    { key: "totalUpgrades", label: "Upgrades", accent: "from-amber-500/15 to-amber-500/0 dark:from-amber-500/10 dark:to-transparent", text: "text-amber-700 dark:text-amber-200" },
    { key: "totalAccessories", label: "Accessories $", accent: "from-emerald-500/15 to-emerald-500/0 dark:from-emerald-500/10 dark:to-transparent", text: "text-emerald-700 dark:text-emerald-200" },
    { key: "totalHsi", label: "HSI", accent: "from-indigo-500/15 to-indigo-500/0 dark:from-indigo-500/10 dark:to-transparent", text: "text-indigo-700 dark:text-indigo-200" },
    { key: "totalBts", label: "BTS", accent: "from-teal-500/15 to-teal-500/0 dark:from-teal-500/10 dark:to-transparent", text: "text-teal-700 dark:text-teal-200" },
    { key: "totalMigrations", label: "Migrations", accent: "from-fuchsia-500/15 to-fuchsia-500/0 dark:from-fuchsia-500/10 dark:to-transparent", text: "text-fuchsia-700 dark:text-fuchsia-200" },
    { key: "totalFreeLines", label: "Free Lines", accent: "from-rose-500/15 to-rose-500/0 dark:from-rose-500/10 dark:to-transparent", text: "text-rose-700 dark:text-rose-200" },
];

function fmt(n: number | undefined) {
    if (n === undefined || n === null) { return "—" };
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function fmtMoney(n: number | undefined) {
    if (n === undefined || n === null) { return "—" };
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function MtdMetricsCards({ metrics, loading }: Props) {
    return (
        <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">MTD Overview</p>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Company-wide metrics</h2>
                </div>
                {loading && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading…</span>
                )}
            </div>

            {/* Layout rule: show 3 columns by default (3+4), expand to 7 on large screens */}
            <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
                {cards.map((card) => {
                    const value = metrics?.[card.key as keyof MtdMetrics];
                    const display = card.key === "totalAccessories" ? fmtMoney(value as number | undefined) : fmt(value as number | undefined);

                    return (
                        <div
                            key={card.key}
                            className="relative overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#101827] px-2 py-2 sm:px-3 sm:py-2.5 shadow-sm"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} aria-hidden />
                            <div className="relative space-y-1">
                                <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className={`text-sm sm:text-base lg:text-xl font-semibold tabular-nums ${card.text}`}>
                                    {display}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
