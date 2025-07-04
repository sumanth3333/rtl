"use client";

import { useState, useEffect } from "react";
import { fetchInventory, InventoryItem, updateInventory } from "@/services/inventory/inventoryService";
import InventoryTable from "@/components/employee/inventory/InventoryTable";
import { useEmployee } from "@/hooks/useEmployee";
import { fetchCompanyNameByNtid } from "@/services/employee/employeeService";
import { useFetchCurrentInventory } from "@/hooks/useFetchCurrentInventory";
import InventorySearch from "@/components/employee/inventory/InventorySearch";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [updatedPerson, setUpdatedPerson] = useState<string | null>(null);
    const [updatedTime, setUpdatedTime] = useState<string | null>(null);
    const [updatedDate, setUpdatedDate] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false); // ✅ Success state
    const { store, employee } = useEmployee();

    const dealerStoreId = store?.dealerStoreId || "";
    const employeeNtid = employee?.employeeNtid || "";
    const [companyName, setCompanyName] = useState<string>("");


    useEffect(() => {
        if (!employeeNtid) { return; }

        const fetchData = async () => {
            try {
                const data = await fetchCompanyNameByNtid(employeeNtid);
                setCompanyName(data);
            } catch (err) {
                setError("Failed to fetch companyName. " + err);
            }
        };

        fetchData();
    }, [employeeNtid]);


    const { data, isLoading, overallInventory } = useFetchCurrentInventory(companyName);
    console.log(data);

    // ✅ Fetch Inventory on Page Load
    useEffect(() => {
        if (!store) { return };
        const loadInventory = async () => {
            try {
                const data = await fetchInventory(dealerStoreId);
                setInventory(data.products);
                setUpdatedPerson(data.updatedPerson);
                setUpdatedTime(data.updatedTime);
                setUpdatedDate(data.updatedDate);
            } catch (err) {
                setError("Failed to load inventory." + err);
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
    }, [dealerStoreId, store, employee]);

    // ✅ Handle Save Action
    const handleSave = async (
        updatedProducts: { id: number; productName: string; quantity: number }[]
    ) => {
        try {
            await updateInventory(dealerStoreId, updatedProducts, employeeNtid);
            setInventory(updatedProducts);
            setUpdateSuccess(true); // ✅ Show success message
            setTimeout(() => {
                setUpdateSuccess(false); // ✅ Hide message
                location.reload();       // ✅ Refresh the page after 3 seconds
            }, 3000);
        } catch (error) {
            setError("Failed to update inventory. " + error);
        }
    };


    return (
        <main className="w-full min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 py-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-all duration-300">
            {/* ✅ Page Header */}
            <header className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Store Inventory
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Last Updated by <span className="font-semibold text-gray-700 dark:text-gray-300">{updatedPerson}</span> on <span className="font-semibold">{updatedDate}</span> at <span className="font-semibold">{updatedTime}</span>
                    </p>
                </div>
            </header>

            {data && data.length > 0 && (
                <InventorySearch data={data} />
            )}

            {/* ✅ Inventory Content */}
            <section className="w-full">
                {loading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">Loading inventory...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <>
                        {/* ✅ Success Message (Displays after update) */}
                        {updateSuccess && (
                            <p className="mt-4 text-green-600 dark:text-green-400 text-sm text-center font-semibold">
                                ✅ Inventory updated successfully!
                            </p>
                        )}
                        <InventoryTable inventory={inventory} dealerStoreId={dealerStoreId} onSubmit={handleSave} />

                    </>
                )}
            </section>
        </main>
    );
}
