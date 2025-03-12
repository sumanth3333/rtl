"use client";

import { useEffect, useState } from "react";
import { CompanyPayStructure, PayFrequency, Threshold } from "@/types/companyTypes";
import { updateCompanyPayStructure } from "@/services/owner/paycheckService";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import CommissionTable from "@/components/owner/paycheck/company-commission/CommissionTable";
import PayFrequencySelect from "@/components/owner/paycheck/company-commission/PayFrequencySelect";
import { useOwner } from "@/hooks/useOwner";

export default function CompanyPayStructurePage() {

    const { companyName } = useOwner();

    useEffect(() => {
        if (companyName) {
            return;
        }
    }, [companyName]);

    console.log(companyName);
    const [payStructure, setPayStructure] = useState<CompanyPayStructure>({
        company: { companyName: companyName }, // Replace with dynamic company name later
        payFrequency: "WEEKLY",
        thresholds: [
            { itemType: "Boxes", min: 1, threshold: 30, payAmount: 3 }
        ],
    });

    const [saving, setSaving] = useState<boolean>(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            payStructure.company.companyName = companyName;
            console.log(payStructure);
            await updateCompanyPayStructure(payStructure);
            toast.success("✅ Pay structure updated successfully!");
        } catch (error) {
            toast.error("❌ Failed to save pay structure.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Company Pay Structure</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
                Configure your payment frequency & commission structure.
            </p>

            {/* ✅ Select Pay Frequency */}
            <PayFrequencySelect
                selected={payStructure.payFrequency}
                onChange={(value: PayFrequency) => setPayStructure((prev) => ({ ...prev, payFrequency: value }))}
            />

            {/* ✅ Commission Table */}
            <CommissionTable
                thresholds={payStructure.thresholds}
                setThresholds={(updatedThresholds) => setPayStructure((prev) => ({ ...prev, thresholds: updatedThresholds }))}
            />

            {/* ✅ Save Button */}
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} isLoading={saving} variant="primary">
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
