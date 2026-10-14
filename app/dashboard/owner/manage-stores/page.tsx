"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { OwnerContext } from "@/contexts/OwnerContext";
import { Store } from "@/schemas/storeSchema";
import ManagePage from "@/components/ui/ManagePage";
import StoreForm from "@/components/owner/StoreForm";
import { addStore, getStores, getManagers } from "@/services/owner/ownerService";
import apiClient from "@/services/api/apiClient";
import { ApiError } from "@/services/api/errorHandler";
import StoreTimingsModal from "@/components/ui/modals/StoreTimingsModal";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";
import { requestStoreDeletion } from "@/services/storeDeletionService";

export default function ManageStores() {
    const { companyName } = useContext(OwnerContext);
    const [stores, setStores] = useState<Store[]>([]);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [storeTimings, setStoreTimings] = useState<
        { dealerStoreId: string; storeTimings: { weekdayId: number; openTime: string; closeTime: string }[] }[]
    >([]);

    // ✅ Store deletion request flow - confirm -> request -> local "already requested" marker
    // (there's no per-store status endpoint, so this only survives the current session).
    const [deletionTarget, setDeletionTarget] = useState<Store | null>(null);
    const [deletionSubmitting, setDeletionSubmitting] = useState(false);
    const [deletionSuccess, setDeletionSuccess] = useState<{ dealerStoreId: string; requestId: number } | null>(null);
    const [requestedDeletionIds, setRequestedDeletionIds] = useState<Set<string>>(new Set());

    const fetchAllData = async () => {
        if (!companyName) { return; }
        setLoading(true);
        try {
            const [storesData, managersData, timingsRes] = await Promise.all([
                getStores(companyName),
                getManagers(companyName),
                apiClient.get("/store/fetchStoreTimings", {
                    params: { companyName },
                }),
            ]);
            setStores(storesData);
            setManagers(managersData);
            setStoreTimings(timingsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [companyName]);

    const handleAdd = async (newStore: Store) => {
        if (!companyName) { return; }
        setLoading(true);
        try {
            const updatedStores = await addStore(companyName, newStore);
            setStores(updatedStores);
        } finally {
            setLoading(false);
        }
    };

    const handleTimingsSave = async () => {
        await fetchAllData(); // Refresh all store data after modal save
        setSelectedStoreId(null); // Close modal
    };

    const handleConfirmDeletionRequest = async () => {
        if (!deletionTarget) { return; }
        setDeletionSubmitting(true);
        try {
            const result = await requestStoreDeletion(deletionTarget.dealerStoreId);
            setRequestedDeletionIds((prev) => new Set(prev).add(deletionTarget.dealerStoreId));
            setDeletionSuccess({ dealerStoreId: deletionTarget.dealerStoreId, requestId: result.requestId });
            setDeletionTarget(null);
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Failed to submit the deletion request. Please try again.");
        } finally {
            setDeletionSubmitting(false);
        }
    };

    return (
        <>
            {selectedStoreId && (
                <StoreTimingsModal
                    dealerStoreId={selectedStoreId}
                    existingTimings={
                        storeTimings.find((s) => s.dealerStoreId === selectedStoreId)?.storeTimings
                    }
                    onClose={() => setSelectedStoreId(null)}
                    onSave={handleTimingsSave} // 🔄 Trigger auto-refresh
                />
            )}

            <ConfirmationModal
                isOpen={!!deletionTarget}
                onClose={() => setDeletionTarget(null)}
                onConfirm={handleConfirmDeletionRequest}
                title="Request Store Deletion"
                message={`This creates a deletion request for "${deletionTarget?.storeName}" (${deletionTarget?.dealerStoreId}). The store is NOT deleted now — an administrator must process the request, and you'll then get an email to review and authorize (or reject) the final deletion.`}
                confirmText="Request Deletion"
                cancelText="Cancel"
                isLoadingConfirm={deletionSubmitting}
            />

            <SuccessModal
                isOpen={!!deletionSuccess}
                onClose={() => setDeletionSuccess(null)}
                title="Deletion Requested"
                message={`Request #${deletionSuccess?.requestId} created for ${deletionSuccess?.dealerStoreId}. An administrator will process it next, and you'll receive an email to review and authorize the final deletion.`}
            />

            <ManagePage
                title={`Manage Stores - ${companyName}`}
                data={stores}
                isLoading={loading}
                columns={[
                    { key: "dealerStoreId", label: "Store ID" },
                    { key: "storeName", label: "Store Name" },
                    { key: "storeManager", label: "Store Manager" },
                ]}
                onAdd={() => { }}
                onEdit={() => { }}
                onDelete={() => { }}
                addForm={<StoreForm onSubmit={handleAdd} />}
                managers={managers}
                renderActions={(store) => (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedStoreId(store.dealerStoreId)}
                            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                        >
                            Set Timings
                        </button>
                        {requestedDeletionIds.has(store.dealerStoreId) ? (
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded">
                                Deletion Requested
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setDeletionTarget(store)}
                                className="text-sm bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded"
                            >
                                Request Deletion
                            </button>
                        )}
                    </div>
                )}
            />
        </>
    );
}
