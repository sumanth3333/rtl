"use client";

import { useContext, useEffect, useState } from "react";
import { OwnerContext } from "@/contexts/OwnerContext";
import { Store } from "@/schemas/storeSchema";
import ManagePage from "@/components/ui/ManagePage";
import StoreForm from "@/components/owner/StoreForm";
import { addStore, getStores, getManagers } from "@/services/owner/ownerService";

export default function ManageStores() {
    const { companyName } = useContext(OwnerContext);
    const [stores, setStores] = useState<Store[]>([]);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!companyName) return;

        setLoading(true);
        Promise.all([getStores(companyName), getManagers(companyName)])
            .then(([storesData, managersData]) => {
                setStores(storesData);
                setManagers(managersData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [companyName]);

    const handleAdd = async (newStore: Store) => {
        if (!companyName) return;
        setLoading(true);
        const updatedStores = await addStore(companyName, newStore);
        setStores(updatedStores);
        setLoading(false);
    };

    return (
        <ManagePage
            title={`Manage Stores - ${companyName}`}
            data={stores}
            isLoading={loading}
            columns={[
                { key: "dealerStoreId", label: "Store ID" },
                { key: "storeName", label: "Store Name" },
            ]}
            onAdd={() => { }}
            onEdit={(store) => console.log("Edit store:", store)}
            onDelete={(id) => console.log("Delete store with ID:", id)}
            addForm={<StoreForm onSubmit={handleAdd} />}
            managers={managers}
        />
    );
}
