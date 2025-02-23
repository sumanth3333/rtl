"use client";

import TransferList from "@/components/upgrades/TransferList";
import UpgradePhonesLayout from "../layout";
import { useFetchTransfersAndReceives } from "@/hooks/useFetchTransfersAndReceives";
import ReceiveList from "@/components/upgrades/ReceiveList";

export default function TransfersAndReceivesPage() {
    const { transfers, receives, isLoading, error, setReceives } = useFetchTransfersAndReceives();

    const updateReceivesState = (updatedDeviceImei: string) => {
        setReceives((prevReceives) => prevReceives.filter((device) => device.imei !== updatedDeviceImei));
    };

    if (isLoading) return <p className="text-center text-gray-700">Loading...</p>;
    if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

    return (
        <div className="p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔄 Pending Transfers & Receives</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and manage pending device transfers.
            </p>

            {/* Transfers List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">📤 Pending Transfers</h2>
                <TransferList transfers={transfers} />
            </div>

            {/* Receives List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">📥 Pending Receives</h2>
                <ReceiveList receives={receives} updateReceivesState={updateReceivesState} />
            </div>
        </div>
    );
}
