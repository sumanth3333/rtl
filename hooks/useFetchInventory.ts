"use client";

import { fetchInventory, InventoryGrouped, InventoryItem } from "@/services/inventory/inventoryService";
import { useState, useEffect } from "react";

export function useFetchInventory(dealerStoreId: string) {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!dealerStoreId) return;

        const fetchAvailableInventory = async () => {
            try {
                const data = await fetchInventory(dealerStoreId);

                // ✅ Flatten all inStock arrays from all brands
                const allInStock = data.storeInventory.flatMap(
                    (group: InventoryGrouped) => group.inStock
                );

                setInventory(allInStock);
            } catch (err) {
                console.error("❌ Error fetching inventory:", err);
                setError("Failed to fetch inventory");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailableInventory();
    }, [dealerStoreId]);

    return { inventory, isLoading, error };
}
