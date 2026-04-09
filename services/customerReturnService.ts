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
    return response.data ?? [];
};
