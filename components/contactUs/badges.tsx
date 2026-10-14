"use client";

import { ContactRequestSeverity, ContactRequestStatus, ContactRequestType } from "@/types/contactUsTypes";
import { SEVERITY_META, STATUS_META } from "./severityStyles";

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${tone}`}>
            {children}
        </span>
    );
}

export function SeverityBadge({ severity }: { severity: ContactRequestSeverity }) {
    const meta = SEVERITY_META[severity];
    return <Pill tone={meta.tone}>{meta.label}</Pill>;
}

export function StatusBadge({ status }: { status: ContactRequestStatus }) {
    const meta = STATUS_META[status];
    return <Pill tone={meta.tone}>{meta.label}</Pill>;
}

export function RequestTypeTag({ type }: { type: ContactRequestType }) {
    return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            {type === "EMPLOYEE" ? "Employee" : "Company"}
        </span>
    );
}
