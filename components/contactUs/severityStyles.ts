import { ContactRequestSeverity, ContactRequestStatus } from "@/types/contactUsTypes";

export const SEVERITY_META: Record<ContactRequestSeverity, { label: string; tone: string }> = {
    LOW: {
        label: "Low",
        tone: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300",
    },
    MEDIUM: {
        label: "Medium",
        tone: "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    },
    HIGH: {
        label: "High",
        tone: "border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    },
    CRITICAL: {
        label: "Critical",
        tone: "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    },
};

export const STATUS_META: Record<ContactRequestStatus, { label: string; tone: string }> = {
    NEW: {
        label: "New",
        tone: "border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
    },
    IN_PROGRESS: {
        label: "In Progress",
        tone: "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    },
    RESOLVED: {
        label: "Resolved",
        tone: "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    },
    NOT_RESOLVED: {
        label: "Not Resolved",
        tone: "border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    },
};
