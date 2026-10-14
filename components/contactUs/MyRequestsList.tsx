"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";

import { fetchMyContactRequests } from "@/services/contactUsService";
import { ApiError } from "@/services/api/errorHandler";
import { ContactRequest } from "@/types/contactUsTypes";
import { SeverityBadge, StatusBadge } from "./badges";

const formatDateTime = (value?: string | null) => {
    if (!value) { return "—"; }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

interface MyRequestsListProps {
    employeeNtid?: string;
    companyName?: string;
    refreshKey?: number;
}

export default function MyRequestsList({ employeeNtid, companyName, refreshKey }: MyRequestsListProps) {
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!employeeNtid && !companyName) { return; }
        let cancelled = false;
        setLoading(true);
        setError(null);
        const params = employeeNtid ? { employeeNtid } : { companyName: companyName as string };
        fetchMyContactRequests(params)
            .then((data) => { if (!cancelled) { setRequests(data); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load your previous requests."); } })
            .finally(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [employeeNtid, companyName, refreshKey]);

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-[64px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                {error}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 py-2">
                <Inbox className="w-3.5 h-3.5" /> No previous requests yet.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {requests.map((req) => (
                <div key={req.requestId} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] p-3">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <StatusBadge status={req.status} />
                        <SeverityBadge severity={req.severity} />
                        <span className="text-xs text-gray-400 dark:text-gray-500">#{req.requestId}</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{req.concern}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Submitted {formatDateTime(req.requestedAt)}</p>
                    {req.status === "RESOLVED" && req.resolution && (
                        <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400">✓ {req.resolution}</p>
                    )}
                    {req.status === "NOT_RESOLVED" && req.nonResolutionReason && (
                        <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400">✗ {req.nonResolutionReason}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
