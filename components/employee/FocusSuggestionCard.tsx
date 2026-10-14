"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { FocusSuggestion } from "@/types/storeGoalStrategy";
import { iconForMetric } from "./metricIcons";

interface Props {
    focusSuggestions: FocusSuggestion[];
    loading?: boolean;
}

const FOCUS_ITEM_LABELS: Record<string, string> = {
    ACTIVATIONS: "Activations",
    BTS: "Tablets & BTS",
    HSI: "Home Internet (HSI)",
    MIGRATIONS: "T-Mobile Migrations",
    ACCESSORIES: "Accessories",
    UPGRADES: "Upgrades",
};

const TIP_LABELS: Record<string, string> = {
    ACTIVATIONS: "Activations",
    BTS: "BTS",
    HSI: "HSI",
    MIGRATIONS: "Migrations",
    ACCESSORIES: "Accessories",
    UPGRADES: "Upgrades",
};

const formatFocusItem = (item: string) =>
    item
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

const labelFor = (focusItem: string) => FOCUS_ITEM_LABELS[focusItem] ?? formatFocusItem(focusItem);
const tipLabelFor = (focusItem: string) => TIP_LABELS[focusItem] ?? formatFocusItem(focusItem);

const urgencyTheme = (pct: number) => {
    if (pct >= 80) {
        return {
            border: "border-emerald-300 dark:border-emerald-700",
            badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
            bar: "bg-emerald-500",
            link: "text-emerald-700 dark:text-emerald-300",
        };
    }
    if (pct >= 40) {
        return {
            border: "border-indigo-300 dark:border-indigo-700",
            badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
            bar: "bg-indigo-500",
            link: "text-indigo-700 dark:text-indigo-300",
        };
    }
    return {
        border: "border-rose-300 dark:border-rose-700",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
        bar: "bg-rose-500",
        link: "text-rose-700 dark:text-rose-300",
    };
};

export default function FocusSuggestionCard({ focusSuggestions, loading }: Props) {
    const sorted = useMemo(
        () => [...(focusSuggestions ?? [])].sort((a, b) => a.achievementPercentage - b.achievementPercentage),
        [focusSuggestions]
    );
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 animate-pulse h-20" />
                ))}
            </div>
        );
    }

    if (sorted.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-4 h-4" />
                Today&apos;s Focus
            </p>

            <div className="space-y-2">
                {sorted.map((suggestion, index) => {
                    const label = labelFor(suggestion.focusItem);
                    const tipLabel = tipLabelFor(suggestion.focusItem);
                    const Icon = iconForMetric(suggestion.focusItem);
                    const theme = urgencyTheme(suggestion.achievementPercentage);
                    const pct = Math.max(0, Math.min(100, suggestion.achievementPercentage));
                    const isExpanded = expandedItem === suggestion.focusItem;

                    return (
                        <div
                            key={suggestion.focusItem}
                            className={`rounded-xl border-2 ${theme.border} bg-white dark:bg-gray-900 p-3 min-[1200px]:p-4 flex flex-col min-[1200px]:flex-row min-[1200px]:items-center gap-3`}
                        >
                            <div className="flex items-center gap-3 min-[1200px]:w-60 shrink-0">
                                <Icon className="w-6 h-6 shrink-0 text-gray-700 dark:text-gray-300" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">{label}</span>
                                        {index === 0 && (
                                            <span className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-0.5 tracking-wide">
                                                TOP PRIORITY
                                            </span>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold mt-0.5 ${theme.badge}`}>
                                        {suggestion.achievementPercentage.toFixed(0)}% of pace
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setExpandedItem(isExpanded ? null : suggestion.focusItem)}
                                    className={`flex items-center gap-1.5 text-sm font-semibold ${theme.link} hover:underline`}
                                >
                                    {isExpanded ? "Hide" : "View"} {tipLabel} Sales Tip
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                                {isExpanded && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5">
                                        {suggestion.message}
                                    </p>
                                )}
                                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mt-2">
                                    <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
