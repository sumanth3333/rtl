// services/owner/pendingRequestsService.ts
import apiClient from "@/services/api/apiClient";

export const fetchCompanyPendingRequests = async (companyName: string) => {
    const response = await apiClient.get(
        `/company/viewPendingItemsRequestedByEmployeeInStore?companyName=${encodeURIComponent(companyName)}`
    );
    return response.data;
};

export const markRequestAsCompleted = async (id: number) => {
    const response = await apiClient.post(`/company/requestItemStatus?id=${id}`);
    console.log(response)
    return response.status === 200;
};
