"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RotateCcw, Trash2 } from "lucide-react";
import { ApiError } from "@/services/api/errorHandler";
import {
    adminProcessStoreDeletion,
    fetchDeletedStoreRequests,
    fetchPendingStoreDeletionRequests,
    restoreStoreDeletion,
} from "@/services/storeDeletionService";
import { DeletedStoreRequest, StoreDeletionPendingRequest } from "@/types/storeDeletion";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";

const formatDateTime = (value?: string) => {
    if (!value) { return "—"; }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) { return value; }
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function AdminStoresPage() {
    const [pending, setPending] = useState<StoreDeletionPendingRequest[]>([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [pendingError, setPendingError] = useState<string | null>(null);

    const [deleted, setDeleted] = useState<DeletedStoreRequest[]>([]);
    const [deletedLoading, setDeletedLoading] = useState(true);
    const [deletedError, setDeletedError] = useState<string | null>(null);

    const [processTarget, setProcessTarget] = useState<StoreDeletionPendingRequest | null>(null);
    const [processSubmitting, setProcessSubmitting] = useState(false);
    const [processSuccess, setProcessSuccess] = useState<string | null>(null);

    const [restoreTarget, setRestoreTarget] = useState<DeletedStoreRequest | null>(null);
    const [restoreSubmitting, setRestoreSubmitting] = useState(false);
    const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

    const loadPending = async () => {
        setPendingLoading(true);
        setPendingError(null);
        try {
            setPending(await fetchPendingStoreDeletionRequests());
        } catch (err) {
            setPendingError(err instanceof ApiError ? err.message : "Failed to load pending deletion requests.");
        } finally {
            setPendingLoading(false);
        }
    };

    const loadDeleted = async () => {
        setDeletedLoading(true);
        setDeletedError(null);
        try {
            setDeleted(await fetchDeletedStoreRequests());
        } catch (err) {
            setDeletedError(err instanceof ApiError ? err.message : "Failed to load deleted stores.");
        } finally {
            setDeletedLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
        loadDeleted();
    }, []);

    const handleConfirmProcess = async () => {
        if (!processTarget) { return; }
        setProcessSubmitting(true);
        try {
            const result = await adminProcessStoreDeletion(processTarget.requestId);
            setPending((prev) => prev.filter((r) => r.requestId !== processTarget.requestId));
            setProcessTarget(null);
            setProcessSuccess(
                `Request #${result.requestId} processed — status is now ${result.status}. The owner has been emailed a review/authorization link.`
            );
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Failed to process this deletion request.");
        } finally {
            setProcessSubmitting(false);
        }
    };

    const handleConfirmRestore = async () => {
        if (!restoreTarget) { return; }
        setRestoreSubmitting(true);
        try {
            const result = await restoreStoreDeletion(restoreTarget.requestId);
            setDeleted((prev) => prev.filter((r) => r.requestId !== restoreTarget.requestId));
            setRestoreTarget(null);
            setRestoreSuccess(result.message || `Store ${result.dealerStoreId} restored successfully.`);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Failed to restore this store.");
        } finally {
            setRestoreSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Manage Stores</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Process owner-submitted store deletion requests and restore stores within their retention window.
                </p>
            </div>

            {/* Pending deletion requests */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" /> Pending Deletion Requests
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Processing builds a backup and emails the owner a one-time authorization link. The store is not deleted at this step.
                </p>

                {pendingError && (
                    <div className="mt-4 rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                        {pendingError}
                    </div>
                )}

                {pendingLoading ? (
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">Loading pending requests...</p>
                ) : !pendingError && pending.length === 0 ? (
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">No pending deletion requests.</p>
                ) : !pendingError && (
                    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="py-3 px-4">Request ID</th>
                                    <th className="py-3 px-4">Store</th>
                                    <th className="py-3 px-4">Company</th>
                                    <th className="py-3 px-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {pending.map((req) => (
                                    <tr key={req.requestId} className="text-gray-800 dark:text-gray-200">
                                        <td className="py-3 px-4 font-medium">#{req.requestId}</td>
                                        <td className="py-3 px-4">{req.storeName}</td>
                                        <td className="py-3 px-4">{req.companyName}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setProcessTarget(req)}
                                                className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded"
                                            >
                                                Process
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Deleted stores / restore */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-600" /> Deleted Stores
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Restorable until each store&apos;s retention deadline passes.
                </p>

                {deletedError && (
                    <div className="mt-4 rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                        {deletedError}
                    </div>
                )}

                {deletedLoading ? (
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">Loading deleted stores...</p>
                ) : !deletedError && deleted.length === 0 ? (
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">No deleted stores.</p>
                ) : !deletedError && (
                    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="py-3 px-4">Store ID</th>
                                    <th className="py-3 px-4">Deleted At</th>
                                    <th className="py-3 px-4">Restore Deadline</th>
                                    <th className="py-3 px-4">Records</th>
                                    <th className="py-3 px-4">Tables</th>
                                    <th className="py-3 px-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {deleted.map((req) => (
                                    <tr key={req.requestId} className="text-gray-800 dark:text-gray-200">
                                        <td className="py-3 px-4 font-medium">{req.dealerStoreId}</td>
                                        <td className="py-3 px-4">{formatDateTime(req.deletedAt)}</td>
                                        <td className="py-3 px-4">{formatDateTime(req.restoreDeadline)}</td>
                                        <td className="py-3 px-4 tabular-nums">{req.totalRecords}</td>
                                        <td className="py-3 px-4 tabular-nums">{req.totalTables}</td>
                                        <td className="py-3 px-4 text-right">
                                            {req.canRestore ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setRestoreTarget(req)}
                                                    className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded"
                                                >
                                                    Restore
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">Not restorable</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <ConfirmationModal
                isOpen={!!processTarget}
                onClose={() => setProcessTarget(null)}
                onConfirm={handleConfirmProcess}
                title="Process this deletion request?"
                message={`This builds a backup for "${processTarget?.storeName}" (${processTarget?.companyName}) and emails the owner a one-time authorization link. The store is not deleted until the owner approves.`}
                confirmText="Process Request"
                cancelText="Cancel"
                isLoadingConfirm={processSubmitting}
            />
            <SuccessModal
                isOpen={!!processSuccess}
                onClose={() => setProcessSuccess(null)}
                title="Request Processed"
                message={processSuccess ?? ""}
            />

            <ConfirmationModal
                isOpen={!!restoreTarget}
                onClose={() => setRestoreTarget(null)}
                onConfirm={handleConfirmRestore}
                title="Restore this store?"
                message={`This restores "${restoreTarget?.dealerStoreId}" and all of its associated records.`}
                data={restoreTarget ? { totalRecords: restoreTarget.totalRecords, totalTables: restoreTarget.totalTables } : null}
                confirmText="Restore Store"
                cancelText="Cancel"
                isLoadingConfirm={restoreSubmitting}
            />
            <SuccessModal
                isOpen={!!restoreSuccess}
                onClose={() => setRestoreSuccess(null)}
                title="Store Restored"
                message={restoreSuccess ?? ""}
            />
        </div>
    );
}
