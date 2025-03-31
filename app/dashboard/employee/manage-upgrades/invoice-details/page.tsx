"use client";

import InvoiceDetailsDisplay from "@/components/upgrades/InvoiceDetailsDisplay";
import InvoiceSearchForm from "@/components/upgrades/InvoiceSearchForm";
import { getInvoiceByImei } from "@/services/upgrades/upgradePhonesService";
import { useState } from "react";

export default function InvoiceDetailsPage() {
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (imei: string) => {
        setLoading(true);
        setError("");
        try {
            const response = await getInvoiceByImei(imei);
            //console.log(response);
            setInvoiceData(response);
        } catch (err: unknown) {
            let errorMessage = "Invoice not found or invalid IMEI."; // Default error

            // ✅ Handle Axios errors properly
            if (err && typeof err === "object" && "response" in err) {
                errorMessage = (err as any).response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setInvoiceData(null);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">🔍 Find Invoice Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please enter the IMEI to retrieve invoice details.</p>

            {/* Search Form */}
            <InvoiceSearchForm onSearch={handleSearch} />

            {/* Loading State */}
            {loading && <p className="text-blue-500 text-center mt-4">Fetching details...</p>}

            {/* Error Message */}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {/* Invoice Details Display */}
            {invoiceData && <InvoiceDetailsDisplay invoice={invoiceData} />}
        </div>
    );
}
