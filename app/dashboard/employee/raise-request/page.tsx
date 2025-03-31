"use client";

import { useState, useEffect } from "react";
import { useEmployee } from "@/hooks/useEmployee";
import apiClient from "@/services/api/apiClient";
import RaiseRequestForm from "@/components/employee/raise-request/RaiseRequestForm";
import PendingRequests from "@/components/employee/raise-request/PendingRequests";
import { PendingRequest, StorePendingRequests } from "@/types/requestTypes";

export default function RaiseRequestPage() {
    const { employee, store } = useEmployee();
    const [pendingRequests, setPendingRequests] = useState<StorePendingRequests | null>(null);

    const employeeNtid = employee?.employeeNtid;
    const dealerStoreId = store?.dealerStoreId
    // ✅ Fetch Pending Requests
    useEffect(() => {
        if (!employeeNtid || !dealerStoreId) {
            return;
        }
        const fetchPendingRequests = async () => {
            try {
                const response = await apiClient.get(`/requestItem/pendingsInStore?dealerStoreId=${dealerStoreId}`);
                setPendingRequests(response.data);
            } catch (error) {
                console.error("❌ Error fetching pending requests:", error);
            }
        };
        fetchPendingRequests();
    }, [dealerStoreId, employeeNtid]);

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Raise a Work Request</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
                Submit any requests related to store needs or issues.
            </p>

            {/* ✅ Raise Request Form */}
            <RaiseRequestForm employeeNtid={employeeNtid} dealerStoreId={dealerStoreId} />

            {pendingRequests && <PendingRequests pendingRequests={pendingRequests} />}

        </div>
    );
}
