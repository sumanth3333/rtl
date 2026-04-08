import apiClient from "./api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import {
    AssurantStatusResponse,
    AssurantSaveClaimPayload,
    AssurantReceivePayload,
    AssurantReturnLabelPayload,
    AssurantReturnPayload,
} from "@/types/assurant";
import { AxiosProgressEvent } from "axios";

export const isAuthorizedForAssurant = async (employeeNtid: string): Promise<boolean> => {
    const response = await apiClient.get("/employee/isAuthorizedForAssurant", {
        params: { employeeNtid },
    });
    return Boolean(response.data);
};

export const fetchAssurantStatuses = async (dealerStoreId: string): Promise<AssurantStatusResponse> => {
    const response = await apiClient.get(API_ROUTES.ASSURANT.STATUS, {
        params: { dealerStoreId },
    });
    return response.data ?? { claims: [], pendings: [], returns: [], success: [] };
};

export const saveAssurantClaim = async (payload: AssurantSaveClaimPayload) => {
    const response = await apiClient.post(API_ROUTES.ASSURANT.SAVE_CLAIM, payload);
    return response.data;
};

export const receiveAssurantDevice = async (payload: AssurantReceivePayload) => {
    const response = await apiClient.post(API_ROUTES.ASSURANT.RECEIVE, payload);
    return response.data;
};

export const uploadAssurantReturnLabel = async (
    file: File,
    payload: AssurantReturnLabelPayload,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assurantLabelRequest", JSON.stringify({
        returningImei: payload.returningImei,
        employeeNtid: payload.employeeNtid,
    }));

    const response = await apiClient.post(API_ROUTES.ASSURANT.UPLOAD_LABEL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
    });
    return response.data;
};

export const returnAssurantDevice = async (payload: AssurantReturnPayload) => {
    const response = await apiClient.post(API_ROUTES.ASSURANT.RETURN, payload);
    return response.data;
};
