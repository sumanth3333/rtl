import React from "react";

interface ReceiveActionsProps {
    selectedDevice: any;
    onActionClick: (actionType: string) => void;
}

export default function ReceiveActions({ selectedDevice, onActionClick }: ReceiveActionsProps) {
    return (
        <div className="flex justify-center mt-4 gap-4">
            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                onClick={() => onActionClick("receive")}
                disabled={!selectedDevice}
            >
                Receive
            </button>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                onClick={() => onActionClick("cancel")}
                disabled={!selectedDevice}
            >
                Cancel Transfer
            </button>
        </div>
    );
}
