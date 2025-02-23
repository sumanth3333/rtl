"use client";

import React, { useState } from "react";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import SuccessModal from "@/components/ui/modals/SuccessModal";
import { useReceiveActions } from "@/hooks/useReceiveActions";
import { useEmployee } from "@/hooks/useEmployee"; // ✅ Using Employee Context
import ReceiveRow from "./ReceiveRow";
import { Receive } from "@/types/transferTypes";

interface ReceiveListProps {
    receives: Receive[];
    updateReceivesState: (imei: string) => void;
}

export default function ReceiveList({ receives, updateReceivesState }: ReceiveListProps) {
    const [selectedDevice, setSelectedDevice] = useState<Receive | null>(null);
    const [actionType, setActionType] = useState<string>("");
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const { handleReceive, handleCancel } = useReceiveActions();
    const { employee, store } = useEmployee(); // ✅ Fetch Employee & Store Details
    const [successMessage, setSuccessMessage] = useState("");

    const handleRowSelection = (device: Receive) => {
        setSelectedDevice((prev) => (prev?.imei === device.imei ? null : device));
    };

    const handleActionClick = (type: string) => {
        if (!selectedDevice) return alert("Please select a device first.");
        setActionType(type);
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedDevice || !employee || !store) return;

        try {
            if (actionType === "receive") {
                const payload = {
                    employeeNtid: employee.employeeNtid, // ✅ Get from context
                    receivingDealerStoreId: store.dealerStoreId, // ✅ Get from context
                    imei: selectedDevice.imei,
                };

                await handleReceive(payload);
                setSuccessMessage("Device successfully received!");
            } else {
                await handleCancel(selectedDevice.imei);
                setSuccessMessage("Transfer successfully canceled!");
            }

            updateReceivesState(selectedDevice.imei);
            setSelectedDevice(null);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error(`Failed to ${actionType} device:`, error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsConfirmationModalOpen(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded shadow-md p-4">
            <table className="w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-700 text-white">
                        <th className="border px-4 py-2">Select</th>
                        <th className="border px-4 py-2">Device Name</th>
                        <th className="border px-4 py-2">IMEI</th>
                        <th className="border px-4 py-2">Transferred From</th>
                        <th className="border px-4 py-2">Transferred By</th>
                        <th className="border px-4 py-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {receives.length > 0 ? (
                        receives.map((receive) => (
                            <ReceiveRow
                                key={receive.imei}
                                device={receive}
                                isSelected={selectedDevice?.imei === receive.imei}
                                onSelect={() => handleRowSelection(receive)}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center py-4 text-gray-500">
                                No pending receives.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ✅ Action Buttons */}
            <div className="flex justify-center mt-4 space-x-4">
                <button
                    onClick={() => handleActionClick("receive")}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition ${selectedDevice
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    disabled={!selectedDevice}
                >
                    ✅ Receive
                </button>
                <button
                    onClick={() => handleActionClick("cancel")}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition ${selectedDevice
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    disabled={!selectedDevice}
                >
                    ❌ Cancel Transfer
                </button>
            </div>

            {/* ✅ Modals */}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onConfirm={handleConfirmAction}
                onClose={() => setIsConfirmationModalOpen(false)}
                title={`Confirm ${actionType}`}
                message={`Are you sure you want to ${actionType} this device transfer?`}
            />
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Success"
                message={successMessage}
            />
        </div>
    );
}
