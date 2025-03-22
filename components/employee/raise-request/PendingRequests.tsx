import { StorePendingRequests } from "@/types/requestTypes";

interface PendingRequestsProps {
    pendingRequests: StorePendingRequests; // <- not an array
}

export default function PendingRequests({ pendingRequests }: PendingRequestsProps) {
    if (!pendingRequests || !pendingRequests.pendings) {
        return null;
    }
    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📌 Pending Requests</h3>

            <h4 className="text-md font-semibold text-blue-600 dark:text-blue-400 mb-2">
                🏪 {pendingRequests.store.storeName} ({pendingRequests.store.dealerStoreId})
            </h4>

            {pendingRequests.pendings.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No pending requests.</p>
            ) : (
                <ul className="space-y-2">
                    {pendingRequests.pendings.map((req) => (
                        <li
                            key={req.id}
                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                        >
                            <div className="font-medium text-gray-800 dark:text-white">{req.itemDescription}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Requested by <strong>{req.requestedBy}</strong> on {req.requestedDate} at {req.requestedTime}
                            </div>
                            <div className="mt-1 text-sm">
                                <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium ${req.priority === "HIGH"
                                        ? "bg-red-500"
                                        : req.priority === "MEDIUM"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                >
                                    {req.priority}
                                </span>{" "}
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Status: {req.status}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
