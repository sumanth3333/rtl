import { API_ROUTES } from "@/constants/apiRoutes";
import apiClient from "./api/apiClient";
import {
    MagentaInStoreViewResponse,
    MagentaOrderCancellationPayload,
    MagentaOrderCompletedPayload,
    MagentaSaveOrderPayload,
    MagentaStoreSummary,
} from "@/types/magenta";

const EMPTY_MAGENTA_VIEW: MagentaInStoreViewResponse = {
    counts: {
        totalOrdersCount: 0,
        cancelledCount: 0,
        sucessOrdersCount: 0,
    },
    orders: [],
    cancellations: [],
    successOrders: [],
};

export const saveMagentaOrder = async (payload: MagentaSaveOrderPayload) => {
    const response = await apiClient.post(API_ROUTES.MAGENTA.SAVE, payload);
    return response.data;
};

export const completeMagentaOrder = async (payload: MagentaOrderCompletedPayload) => {
    const response = await apiClient.post(API_ROUTES.MAGENTA.ORDER_COMPLETED, null, {
        params: payload,
    });
    return response.data;
};

export const cancelMagentaOrder = async (payload: MagentaOrderCancellationPayload) => {
    const response = await apiClient.post(API_ROUTES.MAGENTA.ORDER_CANCELLATION, null, {
        params: payload,
    });
    return response.data;
};

export const fetchMagentaInStoreView = async (dealerStoreId: string): Promise<MagentaInStoreViewResponse> => {
    const response = await apiClient.get(API_ROUTES.MAGENTA.IN_STORE_VIEW, {
        params: { dealerStoreId },
    });
    return response.data ?? EMPTY_MAGENTA_VIEW;
};

export const fetchCompanyMagentaOrders = async (companyName: string): Promise<MagentaStoreSummary[]> => {
    const response = await apiClient.get(API_ROUTES.MAGENTA.COMPANY_VIEW, {
        params: { companyName },
    });
    return Array.isArray(response.data) ? response.data : [];
};
