"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import apiClient from "@/services/api/apiClient";
import { useEmployee } from "@/hooks/useEmployee";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Input } from "@/components/ui/Input";

export default function EodRemarksPage() {
    const today = format(new Date(), "yyyy-MM-dd");
    const { employee, store } = useEmployee();

    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState({
        remarksDate: today,
        numberOfWalkins: 0,
        numberOfBillPayments: 0,
        howManyEdgeAccountsAccessed: 0,
        howManyEdgeAccountsNotAccessed: 0,
        howManyGoogleReviewsTaken: 0,
    });

    const fetchRemarks = async () => {
        if (!employee || !store) { return };
        try {
            const res = await apiClient.get("/employee/fetchEmployeeEodRemarks", {
                params: {
                    employeeNtid: employee.employeeNtid,
                    dealerStoreId: store.dealerStoreId,
                },
            });
            setRemarks((prev) => ({
                ...prev,
                ...res.data,
            }));
        } catch (err) {
            // it's okay if data doesn't exist yet
        }
    };

    useEffect(() => {
        fetchRemarks();
    }, [employee, store]);

    const handleChange = (key: string, value: string | number) => {
        setRemarks((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!employee || !store) {
            toast.error("Missing employee or store context.");
            return;
        }

        try {
            setLoading(true);
            await apiClient.post("/employee/saveEodRemarks", {
                ...remarks,
                dealerStoreId: store.dealerStoreId,
                employeeNtid: employee.employeeNtid,
            });
            toast.success("EOD remarks saved successfully.");
        } catch (err) {
            toast.error("Failed to save EOD remarks.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">End-of-Day Remarks</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    type="number"
                    label="Number of Walk-ins"
                    value={remarks.numberOfWalkins}
                    onChange={(e) => handleChange("numberOfWalkins", Number(e.target.value))}
                />
                <Input
                    type="number"
                    label="Bill Payments"
                    value={remarks.numberOfBillPayments}
                    onChange={(e) => handleChange("numberOfBillPayments", Number(e.target.value))}
                />
                <Input
                    type="number"
                    label="Edge Accounts Accessed"
                    value={remarks.howManyEdgeAccountsAccessed}
                    onChange={(e) => handleChange("howManyEdgeAccountsAccessed", Number(e.target.value))}
                />
                <Input
                    type="number"
                    label="Edge Accounts Not Accessed"
                    value={remarks.howManyEdgeAccountsNotAccessed}
                    onChange={(e) => handleChange("howManyEdgeAccountsNotAccessed", Number(e.target.value))}
                />
                <Input
                    type="number"
                    label="Google Reviews Taken"
                    value={remarks.howManyGoogleReviewsTaken}
                    onChange={(e) => handleChange("howManyGoogleReviewsTaken", Number(e.target.value))}
                />
            </div>

            <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Submit EOD Remarks"}
            </Button>
        </div>
    );
}
