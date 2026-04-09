import apiClient from "@/services/api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";

export type StoreAssurantSummary = {
    store: { dealerStoreId: string; storeName: string };
    statusResponse: {
        claims: any[];
        pendings: any[];
        returns: any[];
        success: any[];
    };
};

export type StoreReturnDevices = {
    store: { dealerStoreId: string; storeName: string };
    returnDevices: {
        employeeNtid: string;
        imei: string;
        phoneNumber: string;
        accountPin: string;
        activatedDate: string;
        returnedDate?: string;
    }[];
};

export const fetchCompanyAssurantStatus = async (companyName: string): Promise<StoreAssurantSummary[]> => {
    const response = await apiClient.get(API_ROUTES.COMPANY_ASSURANT_STATUS, { params: { companyName } });
    return response.data ?? [];
};

export const fetchCompanyReturnDevices = async (companyName: string): Promise<StoreReturnDevices[]> => {
    const response = await apiClient.get(API_ROUTES.COMPANY_RETURN_DEVICES, { params: { companyName } });
    return response.data ?? [];
};
