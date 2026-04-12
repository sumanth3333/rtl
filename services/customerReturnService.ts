import apiClient from "./api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { CustomerReturnItem, CustomerReturnPayload } from "@/types/customerReturn";

export const saveCustomerReturn = async (payload: CustomerReturnPayload) => {
    const response = await apiClient.post(API_ROUTES.CUSTOMER_RETURN.SAVE, payload);
    return response.data;
};

export const fetchCustomerReturns = async (dealerStoreId: string): Promise<CustomerReturnItem[]> => {
    const response = await apiClient.get(API_ROUTES.CUSTOMER_RETURN.VIEW, {
        params: { dealerStoreId },
    });
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((item: any) => ({
        employeeNtid: item?.employeeNtid ?? "",
        imei: item?.imei ?? "",
        deviceName: item?.deviceName ?? "",
        phoneNumber: item?.phoneNumber ?? "",
        accountPin: item?.accountPin ?? "",
        activatedDate: item?.activatedDate ?? "",
        returnedDate: item?.returnedDate,
        refundedAmount: item?.refundedAmount ?? item?.amountRefunded ?? null,
        refundPaymentType: item?.refundPaymentType ?? null,
    }));
};
