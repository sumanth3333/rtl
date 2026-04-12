import { API_ROUTES } from "@/constants/apiRoutes";
import apiClient from "./api/apiClient";
import {
    MagentaInStoreViewResponse,
    MagentaOrder,
    MagentaCancellation,
    MagentaOrderCancellationPayload,
    MagentaOrderCompletedPayload,
    MagentaSaveOrderPayload,
    MagentaSuccessOrder,
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

const normalizeOrder = (item: any): MagentaOrder => ({
    customerName: item?.customerName,
    numberOfLines: Number(item?.numberOfLines ?? 0),
    phoneNumber: item?.phoneNumber ?? "",
    accountPin: item?.accountPin ?? "",
    accountNumber: item?.accountNumber ?? "",
    transferPin: item?.transferPin ?? "",
    transferPinValidity: item?.transferPinValidity ?? "",
    orderDate: item?.orderDate ?? "",
    orderId: item?.orderId ?? "",
    newAccountNumber: item?.newAccountNumber ?? "",
    newAccountPin: item?.newAccountPin,
    instructions: item?.instructions,
    cancelled: Boolean(item?.cancelled),
    completed: Boolean(item?.completed),
});

const normalizeCancellation = (item: any): MagentaCancellation => ({
    customerName: item?.customerName,
    numberOfLines: Number(item?.numberOfLines ?? 0),
    phoneNumber: item?.phoneNumber ?? "",
    cancelledEmployeeName: item?.cancelledEmployeeName ?? "",
    cancelledDate: item?.cancelledDate ?? "",
    cancelledReason: item?.cancelledReason ?? "",
    cancelled: Boolean(item?.cancelled),
});

const normalizeSuccessOrder = (item: any): MagentaSuccessOrder => ({
    customerName: item?.customerName,
    numberOfLines: Number(item?.numberOfLines ?? 0),
    phoneNumber: item?.phoneNumber ?? "",
    temporaryNumber: item?.temporaryNumber,
    completedDate: item?.completedDate ?? "",
    completedEmployeeName: item?.completedEmployeeName ?? "",
    cancelled: Boolean(item?.cancelled),
});

const normalizeMagentaView = (payload: any): MagentaInStoreViewResponse => {
    const counts = payload?.counts ?? {};
    const successCount = Number(counts?.sucessOrdersCount ?? counts?.successOrdersCount ?? 0);
    return {
        counts: {
            totalOrdersCount: Number(counts?.totalOrdersCount ?? 0),
            cancelledCount: Number(counts?.cancelledCount ?? 0),
            sucessOrdersCount: successCount,
            successOrdersCount: successCount,
        },
        orders: Array.isArray(payload?.orders) ? payload.orders.map(normalizeOrder) : [],
        cancellations: Array.isArray(payload?.cancellations) ? payload.cancellations.map(normalizeCancellation) : [],
        successOrders: Array.isArray(payload?.successOrders) ? payload.successOrders.map(normalizeSuccessOrder) : [],
    };
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
    return response.data ? normalizeMagentaView(response.data) : EMPTY_MAGENTA_VIEW;
};

export const fetchCompanyMagentaOrders = async (companyName: string): Promise<MagentaStoreSummary[]> => {
    const response = await apiClient.get(API_ROUTES.MAGENTA.COMPANY_VIEW, {
        params: { companyName },
    });
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((item: any) => ({
        store: {
            dealerStoreId: item?.store?.dealerStoreId ?? "",
            storeName: item?.store?.storeName ?? "",
        },
        magentaDetails: normalizeMagentaView(item?.magentaDetails ?? {}),
    }));
};
