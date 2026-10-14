"use client";

import { useState } from "react";
import { Loader2, Lock, X } from "lucide-react";

import {
    claimContactRequest,
    markContactRequestNotResolved,
    resolveContactRequest,
} from "@/services/admin/contactUsAdminService";
import { ApiError } from "@/services/api/errorHandler";
import { ContactRequest } from "@/types/contactUsTypes";
import { RequestTypeTag, SeverityBadge, StatusBadge } from "@/components/contactUs/badges";

const formatDateTime = (value?: string | null) => {
    if (!value) { return "—"; }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-gray-100 text-right">{children}</span>
        </div>
    );
}

export function ContactRequestDetailModal({
    request,
    onClose,
    onUpdated,
}: {
    request: ContactRequest;
    onClose: () => void;
    onUpdated: (updated: ContactRequest) => void;
}) {
    const [current, setCurrent] = useState(request);
    const [claiming, setClaiming] = useState(false);
    const [resolution, setResolution] = useState("");
    const [resolving, setResolving] = useState(false);
    const [nonResolutionReason, setNonResolutionReason] = useState("");
    const [markingNotResolved, setMarkingNotResolved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClaim = async () => {
        setClaiming(true);
        setError(null);
        try {
            const updated = await claimContactRequest(current.requestId);
            setCurrent(updated);
            onUpdated(updated);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to claim this request.");
        } finally {
            setClaiming(false);
        }
    };

    const handleResolve = async () => {
        if (resolution.trim().length === 0) { return; }
        setResolving(true);
        setError(null);
        try {
            const updated = await resolveContactRequest(current.requestId, resolution.trim());
            setCurrent(updated);
            onUpdated(updated);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to resolve this request.");
        } finally {
            setResolving(false);
        }
    };

    const handleNotResolved = async () => {
        if (nonResolutionReason.trim().length === 0) { return; }
        setMarkingNotResolved(true);
        setError(null);
        try {
            const updated = await markContactRequestNotResolved(current.requestId, nonResolutionReason.trim());
            setCurrent(updated);
            onUpdated(updated);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to mark this request as not resolved.");
        } finally {
            setMarkingNotResolved(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={current.status} />
                        <SeverityBadge severity={current.severity} />
                        <RequestTypeTag type={current.requestType} />
                        <span className="text-xs text-gray-400 dark:text-gray-500">#{current.requestId}</span>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {error && (
                        <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                            {error}
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3.5">
                        <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Concern</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{current.concern}</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <Row label="Requester">{current.requesterName}</Row>
                        <Row label="Requested User">{current.requestedUser}</Row>
                        <Row label="Company">{current.companyName ?? "—"}</Row>
                        {current.contactDetailsVisible ? (
                            <>
                                <Row label="Email">{current.requesterEmail ?? "—"}</Row>
                                <Row label="Phone">{current.requesterPhone ?? "—"}</Row>
                            </>
                        ) : (
                            <div className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-400 dark:text-gray-500">
                                <Lock className="w-3 h-3" /> Contact details become visible after you claim this ticket.
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <Row label="Requested At">{formatDateTime(current.requestedAt)}</Row>
                        <Row label="Assigned Admin">{current.assignedAdminUsername ?? "—"}</Row>
                        <Row label="Started At">{formatDateTime(current.startedAt)}</Row>
                        <Row label="Closed At">{formatDateTime(current.closedAt)}</Row>
                        <Row label="Time Spent">{current.timeSpent ?? "—"}</Row>
                    </div>

                    {current.status === "NEW" && (
                        <button
                            type="button"
                            onClick={handleClaim}
                            disabled={claiming}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {claiming && <Loader2 className="w-4 h-4 animate-spin" />}
                            {claiming ? "Claiming…" : "Start Working On This"}
                        </button>
                    )}

                    {current.status === "IN_PROGRESS" && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Resolution</label>
                                <textarea
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    rows={3}
                                    placeholder="What was done to resolve this?"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleResolve}
                                    disabled={resolving || resolution.trim().length === 0}
                                    className="mt-2 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {resolving ? "Resolving…" : "Mark Resolved"}
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Not Resolved Reason</label>
                                <textarea
                                    value={nonResolutionReason}
                                    onChange={(e) => setNonResolutionReason(e.target.value)}
                                    rows={3}
                                    placeholder="Why can't this be resolved right now?"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleNotResolved}
                                    disabled={markingNotResolved || nonResolutionReason.trim().length === 0}
                                    className="mt-2 w-full rounded-md border border-rose-300 dark:border-rose-800 px-4 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50"
                                >
                                    {markingNotResolved ? "Saving…" : "Mark Not Resolved"}
                                </button>
                            </div>
                        </div>
                    )}

                    {current.status === "RESOLVED" && current.resolution && (
                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5">
                            <p className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1">Resolution</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{current.resolution}</p>
                        </div>
                    )}

                    {current.status === "NOT_RESOLVED" && current.nonResolutionReason && (
                        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 p-3.5">
                            <p className="text-[10px] uppercase tracking-wide text-rose-700 dark:text-rose-400 mb-1">Not Resolved Reason</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{current.nonResolutionReason}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
