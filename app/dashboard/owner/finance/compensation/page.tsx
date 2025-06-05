"use client";

import { useEffect, useState } from "react";
import { getStores } from "@/services/owner/ownerService";
import { useOwner } from "@/hooks/useOwner";
import apiClient from "@/services/api/apiClient";
import PAndENavBar from "@/components/owner/finance/PAndENavBar";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { Store } from "@/schemas/storeSchema";

export default function CompensationPage() {
    const { companyName } = useOwner();
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [stores, setStores] = useState<Store[]>([]);
    const [compensations, setCompensations] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchStores = async () => {
            if (!companyName) { return };
            const list = await getStores(companyName);
            setStores(list);
        };
        fetchStores();
    }, [companyName]);

    const handleCompChange = (storeId: string, value: string) => {
        setCompensations((prev) => ({
            ...prev,
            [storeId]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const payload = stores.map((store) => ({
                dealerStoreId: store.dealerStoreId,
                compensationEarned: parseFloat(compensations[store.dealerStoreId] || "0"),
                compensationEarnedMonth: selectedMonth,
            }));

            await apiClient.post("/company/recordCompensation", payload);

            toast.success("Compensations saved successfully.");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to save compensation.");
        }
    };

    return (
        <>
            <PAndENavBar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

            <div className="max-w-5xl mx-auto p-6">
                <p className="text-xl text-center font-bold text-gray-900 dark:text-gray-100 mb-6">
                    {selectedMonth} Store Compensation
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm mt-4 border rounded-lg">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-left">
                            <tr>
                                <th className="p-3">Store Name</th>
                                <th className="p-3">Store ID</th>
                                <th className="p-3">Compensation ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((store) => (
                                <tr key={store.dealerStoreId} className="border-t dark:border-gray-700">
                                    <td className="p-3">{store.storeName}</td>
                                    <td className="p-3">{store.dealerStoreId}</td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
                                            value={compensations[store.dealerStoreId] || ""}
                                            onChange={(e) => handleCompChange(store.dealerStoreId, e.target.value)}
                                            placeholder="Enter amount"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 text-center">
                    <Button onClick={handleSave}>Save Compensation</Button>
                </div>
            </div>
        </>
    );
}
