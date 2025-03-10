"use client";

import { fetchInventory, InventoryItem } from "@/services/inventory/inventoryService";
import { useState, useEffect } from "react";

export function useFetchInventory(dealerStoreId: string) {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!dealerStoreId) { return; }

        const fetchAvailableInventory = async () => {
            try {
                const data = await fetchInventory(dealerStoreId);
                setInventory(data.products);
            } catch (err) {
                setError("Failed to fetch inventory");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailableInventory();
    }, [dealerStoreId]);

    return { inventory, isLoading, error };
}
