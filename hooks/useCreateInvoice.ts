"use client";

import { useState } from "react";
import useUpgradePhonesService from "@/services/upgrades/upgradePhonesService";
import { InvoiceData } from "@/types/invoiceTypes";

export function useCreateInvoice() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { createInvoice } = useUpgradePhonesService();

    const createNewInvoice = async (invoiceData: InvoiceData) => {
        try {
            setIsSubmitting(true);
            await createInvoice(invoiceData);
        } catch (err) {
            setError("Failed to create invoice");
        } finally {
            setIsSubmitting(false);
        }
    };

    return { createNewInvoice, isSubmitting, error };
}
