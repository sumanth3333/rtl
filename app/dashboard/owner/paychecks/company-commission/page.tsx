"use client";

import { useEffect, useState } from "react";
import { CompanyPayStructure, PayFrequency, Threshold } from "@/types/companyTypes";
import { fetchCompanyPayStructure, updateCompanyPayStructure } from "@/services/owner/paycheckService";
import Button from "@/components/ui/Button";
import CommissionTable from "@/components/owner/paycheck/company-commission/CommissionTable";
import PayFrequencySelect from "@/components/owner/paycheck/company-commission/PayFrequencySelect";
import { useOwner } from "@/hooks/useOwner";
import PreactivationDeductionTable from "@/components/owner/paycheck/company-commission/PreactivationDeductionTable";

export default function CompanyPayStructurePage() {
    const { companyName } = useOwner();
    const [payStructure, setPayStructure] = useState<CompanyPayStructure>({
        company: { companyName: companyName },
        payFrequency: "WEEKLY",
        thresholds: [{ itemType: "Boxes", minimumThreshold: 1, threshold: 30, payAmount: 3 }],
    });

    const [saving, setSaving] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
    }, [payStructure.thresholds]);


    useEffect(() => {
        const loadPayStructure = async () => {
            if (!companyName) { return };

            try {
                const existingPayStructure = await fetchCompanyPayStructure(companyName);
                if (existingPayStructure) {
                    setPayStructure(existingPayStructure);
                }
            } catch (error) {
                console.error("❌ Error fetching pay structure:", error);
            }
        };

        loadPayStructure();
    }, [companyName]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null); // Clear previous message before saving

        try {
            payStructure.company.companyName = companyName;
            await updateCompanyPayStructure(payStructure);

            setMessage({ text: "✅ Pay structure updated successfully!", type: "success" });
        } catch (error) {
            console.error("❌ Save Error:", error); // Debugging log
            setMessage({ text: "❌ Failed to save pay structure. Please try again.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Company Pay Structure</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">Configure your payment frequency & commission structure.</p>

            {/* ✅ Select Pay Frequency */}
            <PayFrequencySelect
                selected={payStructure.payFrequency}
                onChange={(value: PayFrequency) => setPayStructure((prev) => ({ ...prev, payFrequency: value }))}
            />
            <PreactivationDeductionTable
                thresholds={payStructure.thresholds}
                setThresholds={(updatedThresholds: Threshold[]) =>
                    setPayStructure((prev) => ({ ...prev, thresholds: updatedThresholds }))
                }
            />
            {/* ✅ Commission Table */}
            <CommissionTable
                thresholds={payStructure.thresholds.filter(
                    (t) => !["PERCENTAGE", "INVOICE", "PERBOX"].includes(t.itemType)
                )}
                setThresholds={(commissionThresholds) => {
                    const preactThreshold = payStructure.thresholds.find((t) =>
                        ["PERCENTAGE", "INVOICE", "PERBOX"].includes(t.itemType)
                    );
                    setPayStructure((prev) => ({
                        ...prev,
                        thresholds: preactThreshold
                            ? [...commissionThresholds, preactThreshold]
                            : commissionThresholds,
                    }));
                }}
            />


            {/* ✅ Save Button & Message */}
            <div className="mt-6 flex flex-col items-end">
                <Button onClick={handleSave} isLoading={saving} variant="primary">
                    Save Settings
                </Button>

                {/* ✅ Success/Error Message Below Button */}
                {message && (
                    <div
                        className={`mt-3 px-4 py-2 rounded-md text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
