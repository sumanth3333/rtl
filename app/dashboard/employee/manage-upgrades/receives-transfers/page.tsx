"use client";

import TransferList from "@/components/upgrades/TransferList";
import { useFetchTransfersAndReceives } from "@/hooks/useFetchTransfersAndReceives";
import ReceiveList from "@/components/upgrades/ReceiveList";

export default function TransfersAndReceivesPage() {
    const { transfers, receives, isLoading, error, setReceives } = useFetchTransfersAndReceives();

    const updateReceivesState = (updatedDeviceImei: string) => {
        setReceives((prevReceives) => prevReceives.filter((device) => device.imei !== updatedDeviceImei));
    };

    if (isLoading) {
        return <p className="text-center text-gray-700">Loading...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500">Error: {error}</p>;
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 shadow-sm rounded-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
                🔄 Pending Transfers & Receives
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
                View and manage pending device transfers.
            </p>

            {/* Transfers List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    📤 Pending Transfers
                </h2>
                <TransferList transfers={transfers} />
            </div>

            {/* Receives List */}
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    📥 Pending Receives
                </h2>
                <ReceiveList receives={receives} updateReceivesState={updateReceivesState} />
            </div>
        </div>
    );
}
