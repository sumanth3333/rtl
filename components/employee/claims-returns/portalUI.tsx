import { ReactNode } from "react";

const join = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

type PortalCardTone = "neutral" | "assurant" | "customer";

const CARD_TONE: Record<PortalCardTone, string> = {
    neutral: "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70",
    assurant: "border-cyan-200/70 dark:border-cyan-900/40 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 dark:from-cyan-950/25 dark:via-gray-950 dark:to-emerald-950/20",
    customer: "border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-950/20 dark:via-gray-950 dark:to-sky-950/20",
};

export function PortalCard({ children, tone = "neutral", className }: { children: ReactNode; tone?: PortalCardTone; className?: string }) {
    return (
        <section className={join("rounded-3xl border shadow-sm", CARD_TONE[tone], className)}>
            {children}
        </section>
    );
}

export function PortalHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-600 dark:text-gray-400">{eyebrow}</p>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            {description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
        </div>
    );
}

export function PortalStatTile({ label, value, valueClassName }: { label: string; value: string | number; valueClassName?: string }) {
    return (
        <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/10 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">{label}</p>
            <p className={join("text-lg font-semibold text-gray-900 dark:text-gray-100", valueClassName)}>{value}</p>
        </div>
    );
}

export function PortalTabs<T extends string>({
    tabs,
    active,
    onChange,
}: {
    tabs: { key: T; label: string }[];
    active: T;
    onChange: (value: T) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-2 md:max-w-xl md:mx-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={join(
                        "rounded-xl px-4 py-2.5 text-sm font-semibold border transition",
                        active === tab.key
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "border-gray-300 bg-white text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 hover:border-indigo-300"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

const INPUT_CLASS = "rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-white/90 dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:text-gray-100";

export function PortalInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...rest } = props;
    return <input {...rest} className={join(INPUT_CLASS, className)} />;
}

export function PortalSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    const { className, children, ...rest } = props;
    return (
        <select {...rest} className={join(INPUT_CLASS, "bg-white dark:bg-gray-900", className)}>
            {children}
        </select>
    );
}
