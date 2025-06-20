"use client";

import { useEmployee } from "@/hooks/useEmployee";
import apiClient from "@/services/api/apiClient";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Remainder {
    id?: number;
    customerName: string;
    remainderMessage: string;
    contact: string;
    followupDate: string;
    postedDate?: string;
}

interface ExistingRemainder {
    raisedBy: {
        employeeNtid: string;
        employeeName: string;
    };
    raisedFrom: {
        dealerStoreId: string;
        storeName: string;
    };
    remainders: Remainder[];
}

export default function RemaindersPage() {
    const { employee, store } = useEmployee();
    const [newRemainders, setNewRemainders] = useState<Remainder[]>([
        { customerName: "", remainderMessage: "", contact: "", followupDate: "" },
    ]);
    const [existingRemainders, setExistingRemainders] = useState<ExistingRemainder[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRemainders = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/remainder/fetchAllRemainderForStore", {
                params: { dealerStoreId: store?.dealerStoreId },
            });
            setExistingRemainders(res.data || []);
        } catch (err) {
            toast.error("Failed to fetch reminders");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!store && !employee) {
            return;
        }
        fetchRemainders();
    }, [store?.dealerStoreId]);

    const isToday = (dateStr: string) => {
        const today = new Date();
        const date = new Date(dateStr);
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    const addRemainderRow = () => {
        setNewRemainders([
            ...newRemainders,
            { customerName: "", remainderMessage: "", contact: "", followupDate: "" },
        ]);
    };

    const handleInputChange = (index: number, field: keyof Remainder, value: string) => {
        const updated = [...newRemainders];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setNewRemainders(updated);
    };


    const saveRemainders = async () => {
        try {
            await apiClient.post("/employee/remainders", {
                employeeNtid: employee?.employeeNtid,
                dealerStoreId: store?.dealerStoreId,
                remainders: newRemainders,
            });
            toast.success("Reminders saved successfully!");
            setNewRemainders([{ customerName: "", remainderMessage: "", contact: "", followupDate: "" }]);
            fetchRemainders();
        } catch (err) {
            toast.error("Failed to save reminders");
            console.error(err);
        }
    };

    const markAsDone = async (id: number) => {
        try {
            await apiClient.post("/remainder/markAsCompleted", null, {
                params: { id },
            });
            toast.success("Reminder marked as completed");
            fetchRemainders();
        } catch (err) {
            toast.error("Failed to mark as completed");
            console.error(err);
        }
    };


    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Remainders & Follow-up's</h1>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Reminders</h2>
                {newRemainders.map((rem, idx) => (
                    <div
                        key={idx}
                        className="grid gap-6 mb-6 border rounded-lg bg-white dark:bg-gray-900 p-6 shadow-sm relative"
                    >
                        {newRemainders.length > 1 && (
                            <button
                                onClick={() => {
                                    const updated = [...newRemainders];
                                    updated.splice(idx, 1);
                                    setNewRemainders(updated);
                                }}
                                className="absolute top-3 right-3 text-sm text-red-600 hover:underline"
                            >
                                Remove
                            </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-white"
                                    value={rem.customerName}
                                    onChange={(e) => handleInputChange(idx, "customerName", e.target.value)}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-white"
                                    value={rem.contact}
                                    onChange={(e) => handleInputChange(idx, "contact", e.target.value)}
                                    placeholder="Enter contact number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Message
                            </label>
                            <textarea
                                rows={3}
                                className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-white resize-none"
                                value={rem.remainderMessage}
                                onChange={(e) => handleInputChange(idx, "remainderMessage", e.target.value)}
                                placeholder="Enter detailed message..."
                            />
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Follow-up Date
                            </label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-white"
                                value={rem.followupDate}
                                onChange={(e) => handleInputChange(idx, "followupDate", e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <div className="flex gap-4">
                    <button
                        onClick={addRemainderRow}
                        className="px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200"
                    >
                        Add Another Reminder
                    </button>
                    <button
                        onClick={saveRemainders}
                        className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>


            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Existing Reminders</h2>
                {loading ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : existingRemainders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No reminders found for this store.</p>
                ) : (
                    existingRemainders.map((entry, i) => {
                        const sortedReminders = [...entry.remainders].sort(
                            (a, b) => new Date(a.followupDate).getTime() - new Date(b.followupDate).getTime()
                        );

                        const formatPhone = (phone: string) => {
                            if (!phone || phone.length !== 10) { return } phone;
                            return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
                        };

                        return (
                            <div key={i} className="mb-6 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                                <div className="px-5 py-4 border-b bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        {entry.raisedFrom.storeName} — {entry.raisedBy.employeeName}
                                    </h3>
                                </div>
                                <div className="divide-y">
                                    {sortedReminders.map((r) => (
                                        <div
                                            key={r.id}
                                            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start p-5 bg-white dark:bg-gray-900"
                                        >
                                            <div className="md:col-span-3">
                                                <p className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {r.customerName} — {formatPhone(r.contact)}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {r.remainderMessage}
                                                </p>
                                            </div>

                                            <div className="text-sm text-gray-600 dark:text-gray-300 md:col-span-1 space-y-2">
                                                <div>
                                                    <span className="text-xs font-semibold uppercase text-gray-500">Follow-up Date</span>
                                                    <div className={`mt-1 inline-block px-2 py-1 rounded text-sm font-semibold
                                                            ${isToday(r.followupDate)
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                                        }`}
                                                    >
                                                        {r.followupDate}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-xs font-semibold uppercase text-gray-500">Posted</span>
                                                    <p>{r.postedDate}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-start md:justify-end items-center md:col-span-1">
                                                <button
                                                    onClick={() => r.id && markAsDone(r.id)}
                                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                                >
                                                    Mark as Done
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}
