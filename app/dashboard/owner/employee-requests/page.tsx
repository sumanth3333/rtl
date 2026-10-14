"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { fetchCorrectionRequests, reviewCorrectionRequest } from "@/services/correctionRequestService";
import { ApiError } from "@/services/api/errorHandler";
import { CorrectionRequest, CorrectionStatus } from "@/types/employeeVerification";

const STATUS_TABS: CorrectionStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "CONFLICTED"];

const STATUS_BADGE: Record<CorrectionStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    CONFLICTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const fieldLabel = (name: string) => name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function EmployeeRequestsPage() {
    const [status, setStatus] = useState<CorrectionStatus>("PENDING");
    const [requests, setRequests] = useState<CorrectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<CorrectionRequest | null>(null);
    const [comments, setComments] = useState("");
    const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);

    const load = async (s: CorrectionStatus) => {
        setLoading(true);
        setError(null);
        try {
            setRequests(await fetchCorrectionRequests(s));
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to load correction requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(status);
        setSelected(null);
    }, [status]);

    const openRequest = (req: CorrectionRequest) => {
        setSelected(req);
        setComments(req.ownerComments ?? "");
    };

    const handleReview = async (approve: boolean) => {
        if (!selected) { return; }
        setSubmitting(approve ? "approve" : "reject");
        try {
            const updated = await reviewCorrectionRequest(selected.requestId, { approve, comments: comments.trim() });
            toast.success(approve ? "Request approved." : "Request rejected.");
            setSelected(null);
            setRequests((prev) => prev.filter((r) => r.requestId !== updated.requestId));
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Failed to submit your review. Please try again.");
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5">
            <div className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-indigo-500" />
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Employee Requests</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review corrections employees have requested to their clock times and sales.
                    </p>
                </div>
            </div>

            <div className="inline-flex flex-wrap rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setStatus(tab)}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${status === tab
                            ? "bg-indigo-600 text-white"
                            : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">Loading requests...</p>
            ) : !error && requests.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">No {status.toLowerCase()} requests.</p>
            ) : !error && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="py-3 px-4">Request</th>
                                <th className="py-3 px-4">Employee</th>
                                <th className="py-3 px-4">Store</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Reason</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {requests.map((req) => (
                                <tr key={req.requestId} className="text-gray-800 dark:text-gray-200">
                                    <td className="py-3 px-4 font-medium">#{req.requestId}</td>
                                    <td className="py-3 px-4">{req.employeeId}</td>
                                    <td className="py-3 px-4">{req.storeId}</td>
                                    <td className="py-3 px-4">{req.date}</td>
                                    <td className="py-3 px-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => openRequest(req)}
                                            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Request #{selected.requestId}</h2>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[selected.status]}`}>
                                    {selected.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Employee #{selected.employeeId} · Store #{selected.storeId} · {selected.date}
                            </p>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto">
                            <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Employee&apos;s reason</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{selected.reason}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Requested changes</p>
                                <div className="space-y-2">
                                    {selected.changes.map((c) => (
                                        <div key={c.id} className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {c.targetKind} · {fieldLabel(c.fieldName)}
                                            </p>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                                                <span className="line-through text-gray-400">{c.originalValue}</span>
                                                {" → "}
                                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.requestedValue}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selected.status === "PENDING" ? (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Comments</label>
                                    <textarea
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={3}
                                        placeholder="Optional note for the employee."
                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            ) : selected.ownerComments ? (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Owner comments</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{selected.ownerComments}</p>
                                </div>
                            ) : null}
                        </div>

                        <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                disabled={!!submitting}
                                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                            >
                                Close
                            </button>
                            {selected.status === "PENDING" && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleReview(false)}
                                        disabled={!!submitting}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-60"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {submitting === "reject" ? "Rejecting..." : "Reject"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleReview(true)}
                                        disabled={!!submitting}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {submitting === "approve" ? "Approving..." : "Approve"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
