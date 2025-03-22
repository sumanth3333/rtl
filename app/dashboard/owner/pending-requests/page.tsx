"use client";

import { fetchCompanyPendingRequests, markRequestAsCompleted } from "@/services/requests/pendingRequestsService";
import { StorePendingRequests } from "@/types/requestTypes";
import { useEffect, useState } from "react";

const companyName = "Panjaab Enterprises LLC";

export default function OwnerPendingRequestsPage() {
    const [pendingRequests, setPendingRequests] = useState<StorePendingRequests[]>([]);
    const [loading, setLoading] = useState(false);

    const loadPendingRequests = async () => {
        setLoading(true);
        try {
            const data = await fetchCompanyPendingRequests(companyName);
            setPendingRequests(data);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id: number) => {
        try {
            const success = await markRequestAsCompleted(id);
            if (success) {
                await loadPendingRequests(); // Refresh list after completion
            }
        } catch (error) {
            console.error("Error marking request as completed:", error);
        }
    };

    useEffect(() => {
        loadPendingRequests();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                Company Pending Requests
            </h1>

            {loading ? (
                <p className="text-center text-blue-500">Loading pending requests...</p>
            ) : (
                <div className="space-y-6">
                    {pendingRequests.map((storeReq) => (
                        <div key={storeReq.store.dealerStoreId}>
                            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                🏪 {storeReq.store.storeName} ({storeReq.store.dealerStoreId})
                            </h2>

                            {storeReq.pendings.length === 0 ? (
                                <p className="text-gray-500">No pending requests.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {storeReq.pendings.map((req) => (
                                        <li
                                            key={req.id}
                                            className="p-4 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{req.itemDescription}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Requested by {req.requestedBy} on {req.requestedDate} at {req.requestedTime}
                                                </div>
                                                <span
                                                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full text-white font-medium ${req.priority === "HIGH"
                                                        ? "bg-red-500"
                                                        : req.priority === "MEDIUM"
                                                            ? "bg-yellow-500"
                                                            : "bg-green-500"
                                                        }`}
                                                >
                                                    {req.priority}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleComplete(req.id)}
                                                className="ml-4 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                                            >
                                                Mark Complete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
