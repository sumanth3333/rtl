"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AvailableDevicesTable from "@/components/upgrades/AvailableDevicesTable";
import { useFetchAvailableDevices } from "@/hooks/useFetchAvailableDevices";
import { useEmployee } from "@/hooks/useEmployee";
import { Store } from "@/types/upgradePhoneTypes";

export default function AvailableDevicesPage() {
    const { store } = useEmployee();
    const { devices, stores, isLoading, error } = useFetchAvailableDevices();
    const [selectedStore, setSelectedStore] = useState<string | null>(null);

    // ✅ Ensure store is loaded before setting selectedStore
    useEffect(() => {
        if (store) {setSelectedStore(store.dealerStoreId);}
    }, [store]);

    // ✅ Exclude selected store from the stores list
    const otherStores = stores.filter((s) => s.dealerStoreId !== selectedStore);

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-screen px-6 sm:px-10 md:px-16 lg:px-32 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-all duration-300 flex flex-col"
        >
            {/* ✅ Page Title */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl font-bold text-center tracking-tight mb-8"
            >
                📱 Available Devices
            </motion.h1>

            {/* ✅ Content Section */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full max-w-5xl mx-auto"
            >
                {/* ✅ Store Selector */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="flex justify-center mb-6"
                >
                    <select
                        value={selectedStore || ""}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        disabled={!selectedStore}
                        className="w-full max-w-md border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                    >
                        <option value="" disabled>Select a Store</option>
                        {stores.map((store: Store) => (
                            <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                {store.storeName} - {store.dealerStoreId}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* ✅ Table or Loading/Error Message */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                >
                    {isLoading || !store ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">Loading devices...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <AvailableDevicesTable
                            devices={devices.filter(d => d.storeId === selectedStore)}
                            storeIds={otherStores}
                        />
                    )}
                </motion.div>
            </motion.section>
        </motion.main>
    );
}
