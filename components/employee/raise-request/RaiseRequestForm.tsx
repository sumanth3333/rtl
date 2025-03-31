import { useState } from "react";
import apiClient from "@/services/api/apiClient";
import RequestItem from "./RequestItem";

interface RaiseRequestFormProps {
    employeeNtid?: string;
    dealerStoreId?: string;
}

export default function RaiseRequestForm({ employeeNtid, dealerStoreId }: RaiseRequestFormProps) {
    const [requestItems, setRequestItems] = useState([{ itemDescription: "", priority: "LOW" }]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    //console.log(employeeNtid, dealerStoreId)
    // ✅ Handle adding new request item
    const addRequestItem = () => {
        setRequestItems([...requestItems, { itemDescription: "", priority: "LOW" }]);
    };

    // ✅ Handle removing a request item
    const removeRequestItem = (index: number) => {
        setRequestItems(requestItems.filter((_, i) => i !== index));
    };

    // ✅ Handle updating request item
    const updateRequestItem = (index: number, field: keyof (typeof requestItems)[0], value: string) => {
        setRequestItems(prevItems =>
            prevItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };


    // ✅ Handle form submission
    const handleSubmit = async () => {
        if (requestItems.some(item => item.itemDescription.trim() === "")) {
            setMessage({ text: "❌ Please fill in all item descriptions.", type: "error" });
            return;
        }

        setLoading(true);
        try {
            await apiClient.post("/employee/requestItem", {
                employeeNtid,
                dealerStoreId,
                requestItems
            });
            setMessage({ text: "✅ Request raised successfully!", type: "success" });
            setRequestItems([{ itemDescription: "", priority: "LOW" }]); // Reset form
        } catch (error) {
            setMessage({ text: "❌ Failed to raise request.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Request Items with Urgency Levels</h3>

            {requestItems.map((item, index) => (
                <RequestItem
                    key={index}
                    index={index}
                    item={item}
                    updateRequestItem={updateRequestItem}
                    removeRequestItem={removeRequestItem}
                />
            ))}

            {/* ✅ Add New Request Button */}
            <button
                onClick={addRequestItem}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                ➕ Add Another Request
            </button>

            {/* ✅ Raise Request Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-6 py-3 text-lg font-semibold rounded-md hover:bg-green-700"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "✅ Raise Request"}
                </button>
            </div>

            {/* ✅ Success/Error Message */}
            {message && (
                <div className={`mt-3 px-4 py-2 rounded-md text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
