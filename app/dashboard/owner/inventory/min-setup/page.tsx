"use client";

import { useState, useEffect } from "react";
import MinQuantityTable from "@/components/owner/inventory/MinQuantityTable";
import apiClient from "@/services/api/apiClient";
import { StoreMinQuantitySetup } from "@/types/minQuantityTypes";
import { useOwner } from "@/hooks/useOwner";
import { useFetchMinQuantitySetup } from "@/hooks/useFetchMinQuantitySetup";
import { updateInventory } from "@/services/owner/inventoryService";

export default function MinQuantitySetupPage() {
    const { companyName } = useOwner();
    const { data: stores, isLoading, error } = useFetchMinQuantitySetup(companyName); // ✅ Use existing fetch hook
    const [storeQuantities, setStoreQuantities] = useState<{ [storeId: string]: { [productId: number]: number } }>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ✅ Initialize `storeQuantities` when stores are fetched
    useEffect(() => {
        if (!stores || stores.length === 0) { return };

        setStoreQuantities(prev => {
            if (Object.keys(prev).length > 0) { return prev }; // ✅ Prevent reset on re-render

            const initialQuantities: { [storeId: string]: { [productId: number]: number } } = {};
            stores.forEach((store: StoreMinQuantitySetup) => {
                initialQuantities[store.store.dealerStoreId] = store.products.reduce((acc, product) => {
                    acc[product.id] = product.quantity;
                    return acc;
                }, {} as { [productId: number]: number });
            });

            console.log("✅ Initialized Quantities:", initialQuantities);
            return initialQuantities;
        });
    }, [stores]);

    // ✅ Handle quantity updates
    const handleQuantityChange = (storeId: string, productId: number, value: number) => {
        setStoreQuantities(prev => ({
            ...prev,
            [storeId]: {
                ...prev[storeId],
                [productId]: isNaN(value) ? 0 : value,
            }
        }));

        console.log(`🔄 Updated Quantities for ${storeId}:`, storeQuantities);
    };

    // ✅ Handle Save (Ensuring latest state)
    const handleSave = async (storeId: string) => {
        setStoreQuantities(prevStoreQuantities => {
            console.log("✅ storeQuantities Before Save:", prevStoreQuantities);

            const selectedStore = stores.find(store => store.store.dealerStoreId === storeId);
            if (!selectedStore) { return prevStoreQuantities };

            const payload = {
                dealerStoreId: storeId,
                companyName,
                products: selectedStore.products.map(product => ({
                    id: product.id,
                    productName: product.productName,
                    quantity: prevStoreQuantities[storeId]?.[product.id] ?? 0, // ✅ Always use latest state
                })),
            };

            console.log("🚀 Final Payload Before Sending:", payload);

            // ✅ Call `updateInventory` with only `payload`
            updateInventory(payload).then(response => {
                if (response.success) {
                    setSuccessMessage(response.message);
                    setTimeout(() => setSuccessMessage(null), 3000);
                } else {
                    console.error(response.message);
                }
            });

            return prevStoreQuantities; // ✅ Preserve state
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">📊 Minimum Quantity Setup</h1>

            {isLoading ? (
                <p className="text-center text-gray-600 dark:text-gray-400">Loading inventory...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <MinQuantityTable
                    stores={stores}
                    storeQuantities={storeQuantities}
                    onQuantityChange={handleQuantityChange}
                    onSave={handleSave}
                />
            )}

            {successMessage && (
                <div className="mt-4 p-3 text-green-800 bg-green-100 border border-green-400 rounded-md text-center">
                    {successMessage}
                </div>
            )}
        </div>
    );
}
