import apiClient from "./api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { RtposStoreReport } from "@/types/rtposReport";

export const fetchRtposReport = async (companyName: string, start: string, end: string): Promise<RtposStoreReport[]> => {
    const response = await apiClient.get(API_ROUTES.RTPOS_REPORT, {
        params: { companyName, start, end },
    });
    return response.data ?? [];
};

