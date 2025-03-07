"use client";

import apiClient from "../api/apiClient";
import { useEmployee } from "@/hooks/useEmployee";
import { InvoiceData } from "@/types/invoiceTypes";
import { SaleRequest, TransferRequest } from "@/types/upgradePhoneTypes";

const useUpgradePhonesService = () => {
    const { employee, store } = useEmployee();

    // ✅ Safe function to check employee/store before calling APIs
    const ensureContext = () => {
        if (!employee || !store) {
            throw new Error("❌ Employee or Store details are missing from context.");
        }
        return { employeeNtid: employee.employeeNtid, dealerStoreId: store.dealerStoreId };
    };

    // ✅ API: Create Invoice
    const createInvoice = async (invoiceData: InvoiceData) => {
        try {
            const { employeeNtid } = ensureContext();
            console.log(`${employeeNtid} ${invoiceData}`)
            const response = await apiClient.post("/upgradePhones/invoice", {
                ...invoiceData,
                employeeNtid,
            });
            return response.data;
        } catch (error: unknown) {
            console.error("❌ Error creating invoice:", error);
            throw error;
        }
    };

    // ✅ API: Fetch Available Devices
    const fetchAvailableUpgrades = async () => {
        try {
            const { employeeNtid } = ensureContext();
            const response = await apiClient.get(`/upgradePhones/inStores/${employeeNtid}`);
            return response.data;
        } catch (error: unknown) {
            console.error("❌ Error fetching available upgrades:", error);
            throw error;
        }
    };

    // ✅ API: Save Sale
    const saveSale = async (saleRequest: SaleRequest) => {
        try {
            const response = await apiClient.post("/upgradePhones/sale", saleRequest);
            return response.data;
        } catch (error: unknown) {
            console.error("❌ Error saving sale:", error);
            throw error;
        }
    };

    // ✅ API: Transfer Device
    const transferDevice = async (transferRequest: TransferRequest) => {
        try {
            const { dealerStoreId } = ensureContext();
            const response = await apiClient.post("/upgradePhones/transfer", {
                ...transferRequest,
                fromStoreId: dealerStoreId,
            });
            return response.data;
        } catch (error: unknown) {
            console.error("❌ Error transferring device:", error);
            throw error;
        }
    };

    const fetchSoldDevicesAPI = async (dealerStoreId: string, start: string, end: string) => {
        try {
            const response = await apiClient.post("/upgradePhones/previouslySold", {
                dealerStoreId,
                start,
                end,
            });

            if (response.status !== 200) {
                throw new Error("Failed to fetch sold devices");
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching sold devices:", error);
            throw error;
        }
    };

    return { createInvoice, fetchAvailableUpgrades, saveSale, transferDevice, fetchSoldDevicesAPI };
};

export default useUpgradePhonesService;
