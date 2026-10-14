"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, Store as StoreIcon, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api/errorHandler";
import {
    confirmStoreDeletion,
    fetchStoreDeletionApproval,
    rejectStoreDeletion,
} from "@/services/storeDeletionService";
import { StoreDeletionApprovalResponse, StoreDeletionAuthorizationState } from "@/types/storeDeletion";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";

const STORE_DELETION_TOKEN_KEY = "storeDeletionToken";

const formatDateTime = (value?: string) => {
    if (!value) { return "—"; }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) { return value; }
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function StoreDeletionAuthorizationPage() {
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();

    const [state, setState] = useState<StoreDeletionAuthorizationState>("loading");
    const [review, setReview] = useState<StoreDeletionApprovalResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resultMessage, setResultMessage] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

    const clearToken = () => {
        try {
            sessionStorage.removeItem(STORE_DELETION_TOKEN_KEY);
        } catch {
            // sessionStorage unavailable - nothing further to clean up
        }
    };

    useEffect(() => {
        if (authLoading) { return; }
        if (!isAuthenticated) { return; } // middleware will redirect; avoid firing the API call pre-auth

        let token: string | null = null;
        try {
            token = sessionStorage.getItem(STORE_DELETION_TOKEN_KEY);
        } catch {
            token = null;
        }

        if (!token) {
            setState("terminal_error");
            setErrorMessage("This authorization link is invalid or has already been used. Please use the link from the most recent deletion-processed email.");
            return;
        }

        const loadReview = async () => {
            setState("loading");
            try {
                const data = await fetchStoreDeletionApproval(token as string);
                if (data.status !== "WAITING_FOR_COMPANY_APPROVAL") {
                    clearToken();
                    setState("terminal_error");
                    setErrorMessage(`This request is no longer awaiting approval (current status: ${data.status}).`);
                    return;
                }
                setReview(data);
                setState("ready");
            } catch (err) {
                clearToken();
                setState("terminal_error");
                setErrorMessage(err instanceof ApiError ? err.message : "Unable to load this authorization request. The link may be invalid, expired, or already used.");
            }
        };

        loadReview();
    }, [authLoading, isAuthenticated]);

    const handleApprove = async () => {
        let token: string | null = null;
        try {
            token = sessionStorage.getItem(STORE_DELETION_TOKEN_KEY);
        } catch {
            token = null;
        }
        if (!token) {
            setConfirmAction(null);
            setState("terminal_error");
            setErrorMessage("Your authorization session expired. Please use the link from the email again.");
            return;
        }

        setState("approving");
        setConfirmAction(null);
        try {
            const result = await confirmStoreDeletion(token);
            clearToken();
            if (result.status === "DELETED") {
                setResultMessage(result.message || "Store deletion completed successfully.");
                setState("deleted");
            } else if (result.status === "BACKUP_OUTDATED") {
                setResultMessage("The store's data changed since the backup was taken. An administrator needs to re-process this request before it can be authorized again.");
                setState("backup_outdated");
            } else {
                setResultMessage(result.message || `Deletion did not complete (status: ${result.status}).`);
                setState("failed");
            }
        } catch (err) {
            clearToken();
            setErrorMessage(err instanceof ApiError ? err.message : "Approval failed. Please check with your administrator before trying again.");
            setState("terminal_error");
        }
    };

    const handleReject = async () => {
        let token: string | null = null;
        try {
            token = sessionStorage.getItem(STORE_DELETION_TOKEN_KEY);
        } catch {
            token = null;
        }
        if (!token) {
            setConfirmAction(null);
            setState("terminal_error");
            setErrorMessage("Your authorization session expired. Please use the link from the email again.");
            return;
        }

        setState("rejecting");
        setConfirmAction(null);
        try {
            const message = await rejectStoreDeletion(token);
            clearToken();
            setResultMessage(typeof message === "string" && message ? message : "Store deletion request rejected successfully.");
            setState("rejected");
        } catch (err) {
            clearToken();
            setErrorMessage(err instanceof ApiError ? err.message : "Rejecting this request failed. Please try the link again.");
            setState("terminal_error");
        }
    };

    if (role && role.toUpperCase() !== "OWNER") {
        return (
            <PageShell>
                <StatusCard icon={<ShieldAlert className="w-10 h-10 text-rose-500" />} title="Not authorized" tone="rose">
                    Only the account owner can review and authorize store deletion.
                </StatusCard>
            </PageShell>
        );
    }

    return (
        <PageShell>
            {(state === "loading" || authLoading) && (
                <StatusCard icon={<Clock className="w-10 h-10 text-indigo-500 animate-pulse" />} title="Loading authorization request..." tone="indigo">
                    Please wait while we verify your link.
                </StatusCard>
            )}

            {state === "terminal_error" && (
                <StatusCard icon={<XCircle className="w-10 h-10 text-rose-500" />} title="Unable to continue" tone="rose">
                    {errorMessage}
                </StatusCard>
            )}

            {state === "backup_outdated" && (
                <StatusCard icon={<AlertTriangle className="w-10 h-10 text-amber-500" />} title="Backup is out of date" tone="amber">
                    {resultMessage}
                </StatusCard>
            )}

            {state === "failed" && (
                <StatusCard icon={<XCircle className="w-10 h-10 text-rose-500" />} title="Deletion failed" tone="rose">
                    {resultMessage}
                </StatusCard>
            )}

            {state === "deleted" && (
                <StatusCard icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />} title="Store deleted" tone="emerald">
                    {resultMessage}
                </StatusCard>
            )}

            {state === "rejected" && (
                <StatusCard icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />} title="Request rejected" tone="emerald">
                    {resultMessage} No store data was deleted.
                </StatusCard>
            )}

            {(state === "ready" || state === "approving" || state === "rejecting") && review && (
                <div className="relative w-full max-w-xl p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <StoreIcon className="w-7 h-7 text-blue-700 dark:text-blue-300" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Authorize Store Deletion</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Request #{review.requestId} · {review.dealerStoreId}</p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                        Review the backup summary below before deciding. This authorization expires at{" "}
                        <span className="font-semibold">{formatDateTime(review.approvalExpiresAt)}</span>.
                    </p>

                    <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                            Records to be deleted
                        </p>
                        {Object.keys(review.backupSummary?.recordCounts ?? {}).length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No dependent records found.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {Object.entries(review.backupSummary.recordCounts).map(([table, count]) => (
                                    <div key={table} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">{table.replace(/([A-Z])/g, " $1")}</span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => setConfirmAction("reject")}
                            disabled={state !== "ready"}
                            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {state === "rejecting" ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmAction("approve")}
                            disabled={state !== "ready"}
                            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {state === "approving" ? "Deleting..." : "Approve & Delete Store"}
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmAction === "approve"}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleApprove}
                title="Permanently delete this store?"
                message={`This will permanently delete "${review?.dealerStoreId}" and all of its associated records. This cannot be undone from here.`}
                confirmText="Yes, Delete Store"
                cancelText="Cancel"
            />
            <ConfirmationModal
                isOpen={confirmAction === "reject"}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleReject}
                title="Reject this deletion request?"
                message="The store will not be deleted. This authorization link will no longer be usable."
                confirmText="Reject Request"
                cancelText="Cancel"
            />
        </PageShell>
    );
}

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex items-center justify-center min-h-screen px-6 md:px-12 py-10
            bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9]
            dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#334155]">
            <div className="absolute inset-0 before:absolute before:inset-0 before:bg-grid-light dark:before:bg-grid-dark before:bg-opacity-10 before:bg-fixed" />
            <div className="relative w-full flex items-center justify-center">{children}</div>
        </div>
    );
}

function StatusCard({
    icon,
    title,
    tone,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    tone: "indigo" | "rose" | "amber" | "emerald";
    children: React.ReactNode;
}) {
    const toneClass = {
        indigo: "border-indigo-200 dark:border-indigo-800",
        rose: "border-rose-200 dark:border-rose-800",
        amber: "border-amber-200 dark:border-amber-800",
        emerald: "border-emerald-200 dark:border-emerald-800",
    }[tone];

    return (
        <div className={`w-full max-w-md p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl shadow-xl border ${toneClass} text-center`}>
            <div className="flex justify-center">{icon}</div>
            <h1 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{children}</p>
        </div>
    );
}
