"use client";

import { useContext, useEffect, useState } from "react";
import { OwnerContext } from "@/contexts/OwnerContext";
import { Store } from "@/schemas/storeSchema";
import ManagePage from "@/components/ui/ManagePage";
import StoreForm from "@/components/owner/StoreForm";
import { addStore, getStores, getManagers } from "@/services/owner/ownerService";
import apiClient from "@/services/api/apiClient";
import StoreTimingsModal from "@/components/ui/modals/StoreTimingsModal";

export default function ManageStores() {
    const { companyName } = useContext(OwnerContext);
    const [stores, setStores] = useState<Store[]>([]);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [storeTimings, setStoreTimings] = useState<
        { dealerStoreId: string; storeTimings: { weekdayId: number; openTime: string; closeTime: string }[] }[]
    >([]);

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
        const updatedStores = await addStore(companyName, newStore);
        setStores(updatedStores);
        setLoading(false);
    };

    const handleTimingsSave = async () => {
        await fetchAllData(); // Refresh all store data after modal save
        setSelectedStoreId(null); // Close modal
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
                    <button
                        type="button"
                        onClick={() => setSelectedStoreId(store.dealerStoreId)}
                        className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                    >
                        Set Timings
                    </button>
                )}
            />
        </>
    );
}
