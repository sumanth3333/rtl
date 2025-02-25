"use client";

import { useState } from "react";
import { Device, Store } from "@/types/upgradePhoneTypes";
import useUpgradePhonesService from "@/services/upgrades/upgradePhonesService";
import { useEmployee } from "@/hooks/useEmployee";

interface ActionFormProps {
    formType: "sale" | "transfer";
    device: Device;
    storeIds: Store[];
    closeForm: () => void;
}

export default function ActionForm({ formType, device, storeIds, closeForm }: ActionFormProps) {
    const { employee, store } = useEmployee();
    const { saveSale, transferDevice } = useUpgradePhonesService();
    const [formData, setFormData] = useState({ customerPhone: "", price: "", transferTo: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (!employee || !store) {
                throw new Error("❌ Employee or Store details are missing. Please try logging in again.");
            }

            if (formType === "sale") {
                if (!formData.customerPhone || !formData.price) {
                    throw new Error("❌ Customer Phone and Price are required.");
                }

                await saveSale({
                    employeeNtid: employee.employeeNtid,
                    dealerStoreId: store.dealerStoreId,
                    soldTo: formData.customerPhone,
                    soldPrice: parseFloat(formData.price),
                    product: {
                        productName: device.productName,
                        imei: device.imei ?? "",
                        phoneNumber: device.phoneNumber ?? "",
                    },
                });

                setSuccess("✅ Device sold successfully!");
            } else if (formType === "transfer") {
                if (!formData.transferTo) {
                    throw new Error("❌ Please select a store to transfer to.");
                }

                await transferDevice({
                    employeeNtid: employee.employeeNtid,
                    imei: device.imei ?? "",
                    targetDealerStoreId: formData.transferTo,
                });

                setSuccess("✅ Device transferred successfully!");
            }

            setTimeout(() => {
                closeForm();
                window.location.reload(); // Refresh data after success
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "❌ An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                {formType === "sale" && (
                    <>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                Customer Phone
                            </label>
                            <input
                                type="text"
                                name="customerPhone"
                                value={formData.customerPhone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                required
                            />
                        </div>
                    </>
                )}

                {formType === "transfer" && (
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Transfer To
                        </label>
                        <select
                            name="transferTo"
                            value={formData.transferTo}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            required
                        >
                            <option value="">Select Store</option>
                            {storeIds.map((store) => (
                                <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                    {store.storeName} ({store.dealerStoreId})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                    <button
                        type="submit"
                        className={`w-full sm:w-auto px-4 py-2 rounded text-white transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Submit"}
                    </button>
                    <button
                        type="button"
                        onClick={closeForm}
                        className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
