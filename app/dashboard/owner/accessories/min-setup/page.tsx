// src/app/.../MinQuantitySetupPage.tsx
"use client";

import { useState, useEffect } from "react";
import MinQuantityAccessoriesTable from "@/components/owner/inventory/MinQuantityAccessoriesTable";
import { StoreAccessoriesMinQuantitySetup } from "@/types/minQuantityTypes";
import { useOwner } from "@/hooks/useOwner";
import { useFetchMinQuantitySetup } from "@/hooks/useFetchAccMinQuantitySetup";
import { updateAccessory } from "@/services/owner/inventoryService";
import SuccessToast from "@/components/ui/SuccessToast"; // <-- add

type AccessoryQuantities = { caseQuantity: number; glassQuantity: number };
type StoreQuantities = Record<string, Record<number, AccessoryQuantities>>;

export default function MinQuantitySetupPage() {
    const { companyName } = useOwner();
    const { data: stores, isLoading, error } = useFetchMinQuantitySetup(companyName);

    const [storeQuantities, setStoreQuantities] = useState<StoreQuantities>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    console.log(stores);

    useEffect(() => {
        if (!stores || stores.length === 0) { return; }

        setStoreQuantities((prev) => {
            if (Object.keys(prev).length > 0) { return prev; }
            const initial: StoreQuantities = {};

            (stores as StoreAccessoriesMinQuantitySetup[]).forEach((store) => {
                const sId = store.store.dealerStoreId;
                initial[sId] = store.products.reduce((acc, p) => {
                    acc[p.id] = {
                        caseQuantity: Number.isFinite(p.caseQuantity) ? p.caseQuantity : 0,
                        glassQuantity: Number.isFinite(p.glassQuantity) ? p.glassQuantity : 0,
                    };
                    return acc;
                }, {} as Record<number, AccessoryQuantities>);
            });

            return initial;
        });
    }, [stores]);

    const handleQuantityChange = (
        storeId: string,
        productId: number,
        field: keyof AccessoryQuantities,
        value: number
    ) => {
        const safe = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
        setStoreQuantities((prev) => ({
            ...prev,
            [storeId]: {
                ...prev[storeId],
                [productId]: {
                    ...(prev[storeId]?.[productId] ?? { caseQuantity: 0, glassQuantity: 0 }),
                    [field]: safe,
                },
            },
        }));
    };

    const handleSave = async (storeId: string) => {
        const selectedStore = (stores as StoreAccessoriesMinQuantitySetup[])?.find(
            (s) => s.store.dealerStoreId === storeId
        );
        if (!selectedStore) { return; }

        const accessories = selectedStore.products.map((p) => {
            const local = storeQuantities[storeId]?.[p.id];
            return {
                productName: p.productName,
                caseQuantity:
                    local?.caseQuantity ?? (Number.isFinite(p.caseQuantity) ? p.caseQuantity : 0),
                glassQuantity:
                    local?.glassQuantity ?? (Number.isFinite(p.glassQuantity) ? p.glassQuantity : 0),
            };
        });

        try {
            const payload = { dealerStoreId: storeId, companyName, accessories };
            const response = await updateAccessory(payload);
            if (response?.success) {
                setSuccessMessage(response.message ?? "Updated successfully");
            } else {
                console.error(response?.message ?? "Update failed");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                🧰 Accessories – Minimum Quantity Setup
            </h1>

            {isLoading ? (
                <p className="text-center text-gray-600 dark:text-gray-400">Loading accessories…</p>
            ) : error ? (
                <p className="text-center text-red-500">{String(error)}</p>
            ) : (
                <MinQuantityAccessoriesTable
                    stores={stores as StoreAccessoriesMinQuantitySetup[]}
                    storeQuantities={storeQuantities}
                    onQuantityChange={handleQuantityChange}
                    onSave={handleSave}
                />
            )}

            {/* Floating success toast (always visible) */}
            {successMessage && (
                <SuccessToast
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                    duration={3000}
                    position="top-right" // try "top-center" if you prefer
                />
            )}
        </div>
    );
}
