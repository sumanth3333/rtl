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
        if (!companyName) { return };

        const fetchData = async () => {
            try {
                const storesList = await getStores(companyName);
                setStores(storesList);

                const res = await apiClient.get("/company/fetchCompensation", {
                    params: {
                        companyName,
                        month: selectedMonth,
                    },
                });

                const existingComp: Record<string, string> = {};
                for (const item of res.data || []) {
                    existingComp[item.dealerStoreId] = item.compensationEarned?.toString() ?? "";
                }

                setCompensations(existingComp);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to fetch stores or compensation.");
            }
        };

        fetchData();
    }, [companyName, selectedMonth]);

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

    const totalCompensation = stores.reduce((sum, store) => {
        const value = parseFloat(compensations[store.dealerStoreId] || "0");
        return sum + (isNaN(value) ? 0 : value);
    }, 0);

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
                            <tr className="bg-gray-100 dark:bg-gray-800 font-semibold border-t">
                                <td className="p-3 text-right" colSpan={2}>Total Compensation</td>
                                <td className="p-3">${totalCompensation.toFixed(2)}</td>
                            </tr>
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
