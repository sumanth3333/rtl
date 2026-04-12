import apiClient from "@/services/api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";

export type StoreAssurantSummary = {
    store: { dealerStoreId: string; storeName: string };
    statusResponse: {
        claims: AssurantCompanyDeviceStatus[];
        pendings: AssurantCompanyDeviceStatus[];
        returns: AssurantCompanyDeviceStatus[];
        success: AssurantCompanyDeviceStatus[];
    };
};

export type AssurantCompanyDeviceStatus = {
    imei: string;
    customerName?: string;
    customerNumber?: string;
    customerPhoneNumber?: string;
    claimedBy?: string;
    receivedBy?: string;
    labelBy?: string;
    returnBy?: string;
    claimedDate?: string;
    receivedDate?: string;
    labelCreatedDate?: string;
    returnedDate?: string;
    viewLablel?: string;
    viewLabel?: string;
    received: boolean;
    returned: boolean;
    labelCreated: boolean;
};

export type StoreReturnDevices = {
    store: { dealerStoreId: string; storeName: string };
    returnDevices: {
        employeeNtid: string;
        imei: string;
        deviceName: string;
        phoneNumber: string;
        accountPin: string;
        activatedDate: string;
        returnedDate?: string;
        refundedAmount?: number | null;
        refundPaymentType?: "cash" | "card" | null;
    }[];
};

export const fetchCompanyAssurantStatus = async (companyName: string): Promise<StoreAssurantSummary[]> => {
    const response = await apiClient.get(API_ROUTES.COMPANY_ASSURANT_STATUS, { params: { companyName } });
    const data = Array.isArray(response.data) ? response.data : [];
    const normalizeItem = (item: any): AssurantCompanyDeviceStatus => ({
        imei: item?.imei ?? "",
        customerName: item?.customerName,
        customerNumber: item?.customerNumber ?? item?.customerPhoneNumber,
        customerPhoneNumber: item?.customerPhoneNumber ?? item?.customerNumber,
        claimedBy: item?.claimedBy,
        receivedBy: item?.receivedBy,
        labelBy: item?.labelBy,
        returnBy: item?.returnBy,
        claimedDate: item?.claimedDate,
        receivedDate: item?.receivedDate,
        labelCreatedDate: item?.labelCreatedDate,
        returnedDate: item?.returnedDate,
        viewLablel: item?.viewLablel ?? item?.viewLabel,
        viewLabel: item?.viewLabel ?? item?.viewLablel,
        received: Boolean(item?.received),
        returned: Boolean(item?.returned),
        labelCreated: Boolean(item?.labelCreated),
    });
    const mapBucket = (bucket: any) => (Array.isArray(bucket) ? bucket.map(normalizeItem) : []);
    return data.map((store: any) => ({
        store: {
            dealerStoreId: store?.store?.dealerStoreId ?? "",
            storeName: store?.store?.storeName ?? "",
        },
        statusResponse: {
            claims: mapBucket(store?.statusResponse?.claims),
            pendings: mapBucket(store?.statusResponse?.pendings),
            returns: mapBucket(store?.statusResponse?.returns),
            success: mapBucket(store?.statusResponse?.success),
        },
    }));
};

export const fetchCompanyReturnDevices = async (companyName: string): Promise<StoreReturnDevices[]> => {
    const response = await apiClient.get(API_ROUTES.COMPANY_RETURN_DEVICES, { params: { companyName } });
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((store: any) => ({
        store: {
            dealerStoreId: store?.store?.dealerStoreId ?? "",
            storeName: store?.store?.storeName ?? "",
        },
        returnDevices: Array.isArray(store?.returnDevices)
            ? store.returnDevices.map((item: any) => ({
                employeeNtid: item?.employeeNtid ?? "",
                imei: item?.imei ?? "",
                deviceName: item?.deviceName ?? "",
                phoneNumber: item?.phoneNumber ?? "",
                accountPin: item?.accountPin ?? "",
                activatedDate: item?.activatedDate ?? "",
                returnedDate: item?.returnedDate,
                refundedAmount: item?.refundedAmount ?? item?.amountRefunded ?? null,
                refundPaymentType: item?.refundPaymentType ?? null,
            }))
            : [],
    }));
};
