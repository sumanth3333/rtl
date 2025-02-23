"use client";

import { useState, useEffect } from "react";
import { fetchInventory, InventoryItem, updateInventory } from "@/services/inventory/inventoryService";
import InventoryTable from "@/components/employee/inventory/InventoryTable";
import { useEmployee } from "@/hooks/useEmployee";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { store } = useEmployee();

    const dealerStoreId = store?.dealerStoreId || "";

    // ✅ Fetch Inventory on Page Load
    useEffect(() => {
        if (!store) return;
        const loadInventory = async () => {
            try {
                const data = await fetchInventory(dealerStoreId);
                setInventory(data);
            } catch (err) {
                setError("Failed to load inventory.");
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
    }, [dealerStoreId]);

    // ✅ Handle Save Action
    const handleSave = async (updatedProducts: any) => {
        try {
            await updateInventory(dealerStoreId, updatedProducts);
            setInventory(updatedProducts);
        } catch (error) {
            setError("Failed to update inventory.");
        }
    };

    return (
        <main className="w-full min-h-screen px-6 sm:px-10 md:px-16 lg:px-32 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-all duration-300 flex flex-col">

            {/* ✅ Page Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-8">
                Store Inventory
            </h1>

            {/* ✅ Content Section */}
            <section className="w-full max-w-5xl mx-auto">
                {loading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">Loading inventory...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <InventoryTable inventory={inventory} dealerStoreId={dealerStoreId} onSubmit={handleSave} />
                )}
            </section>
        </main>
    );
}
