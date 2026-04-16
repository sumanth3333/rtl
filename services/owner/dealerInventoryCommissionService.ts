import { API_ROUTES } from "@/constants/apiRoutes";
import {
    DealerInventoryCommissionSavePayload,
    DealerInventoryCommissionValues,
} from "@/types/dealerInventoryCommission";
import apiClient from "../api/apiClient";

const DEALER_INVENTORY_COMMISSION_ROUTES =
    API_ROUTES.DEALER_INVENTORY_COMMISSION ?? {
        SAVE: "/dealer-inventory-commission/save",
        UPDATE: "/dealer-inventory-commission/update",
        GET: "/dealer-inventory-commission/get",
    };

export const getDealerInventoryCommission = async (
    companyName: string
): Promise<DealerInventoryCommissionValues> => {
    const response = await apiClient.get<DealerInventoryCommissionValues>(
        DEALER_INVENTORY_COMMISSION_ROUTES.GET,
        { params: { companyName } }
    );
    return response.data;
};

export const saveDealerInventoryCommission = async (
    payload: DealerInventoryCommissionSavePayload
) => {
    await apiClient.post(DEALER_INVENTORY_COMMISSION_ROUTES.SAVE, payload);
};

export const updateDealerInventoryCommission = async (
    payload: DealerInventoryCommissionSavePayload
) => {
    await apiClient.put(DEALER_INVENTORY_COMMISSION_ROUTES.UPDATE, payload);
};
