"use client";

import type { PbCommission } from "@/types/pb";

export function CurrencyInput({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                $
            </span>
            <input
                inputMode="decimal"
                value={String(value ?? "")}
                onChange={(e) => onChange(e.target.value)}
                className="
          w-full rounded-xl border border-gray-300/70 dark:border-gray-800/70
          bg-white/90 dark:bg-gray-950/40
          pl-7 pr-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100
          shadow-sm outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        "
                placeholder="0.00"
            />
        </div>
    );
}

export function FieldRow({
    title,
    leftValue,
    rightValue,
    onLeftChange,
    onRightChange,
}: {
    title: string;
    leftValue: number;
    rightValue: number;
    onLeftChange: (v: string) => void;
    onRightChange: (v: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-950/10 p-4">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Minimum</label>
                    <CurrencyInput value={leftValue} onChange={onLeftChange} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Maximum</label>
                    <CurrencyInput value={rightValue} onChange={onRightChange} />
                </div>
            </div>
        </div>
    );
}

export function CommissionPreview({ commission }: { commission: PbCommission | null }) {
    const c = commission ?? {
        minimumPerformanceBonusWithoutRetention: 0,
        maximumPerformanceBonusWithoutRetention: 0,
        minimumPerformanceBonusWithRetention: 0,
        maximumPerformanceBonusWithRetention: 0,
    };

    const money = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n || 0));

    return (
        <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/70 dark:bg-gray-900/30 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Current Saved Values</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/10 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Min PB (No Retention)
                    </div>
                    <div className="mt-1 font-bold text-gray-900 dark:text-gray-100">{money(c.minimumPerformanceBonusWithoutRetention)}</div>
                </div>

                <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/10 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Max PB (No Retention)
                    </div>
                    <div className="mt-1 font-bold text-gray-900 dark:text-gray-100">{money(c.maximumPerformanceBonusWithoutRetention)}</div>
                </div>

                <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/10 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Min PB (With Retention)
                    </div>
                    <div className="mt-1 font-bold text-gray-900 dark:text-gray-100">{money(c.minimumPerformanceBonusWithRetention)}</div>
                </div>

                <div className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/10 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Max PB (With Retention)
                    </div>
                    <div className="mt-1 font-bold text-gray-900 dark:text-gray-100">{money(c.maximumPerformanceBonusWithRetention)}</div>
                </div>
            </div>
        </div>
    );
}
