import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { ContactRequest } from "@/types/contactUsTypes";

export const fetchNewContactRequests = async (): Promise<ContactRequest[]> => {
    const response = await apiClient.get<ContactRequest[]>(API_ROUTES.ADMIN_CONTACT_US.NEW);
    return response.data ?? [];
};

export const fetchInProgressContactRequests = async (): Promise<ContactRequest[]> => {
    const response = await apiClient.get<ContactRequest[]>(API_ROUTES.ADMIN_CONTACT_US.IN_PROGRESS);
    return response.data ?? [];
};

export const fetchResolvedContactRequests = async (): Promise<ContactRequest[]> => {
    const response = await apiClient.get<ContactRequest[]>(API_ROUTES.ADMIN_CONTACT_US.RESOLVED);
    return response.data ?? [];
};

export const fetchNotResolvedContactRequests = async (): Promise<ContactRequest[]> => {
    const response = await apiClient.get<ContactRequest[]>(API_ROUTES.ADMIN_CONTACT_US.NOT_RESOLVED);
    return response.data ?? [];
};

// No dedicated count endpoint exists - the sidebar badge derives this from the NEW list.
export const fetchNewContactRequestsCount = async (): Promise<number> => {
    try {
        const newRequests = await fetchNewContactRequests();
        return newRequests.length;
    } catch (error) {
        console.error("Error fetching new support request count:", error);
        return 0;
    }
};

export const fetchContactRequestsByCompany = async (companyId: number): Promise<ContactRequest[]> => {
    const response = await apiClient.get<ContactRequest[]>(`${API_ROUTES.ADMIN_CONTACT_US.BASE}/company/${companyId}`);
    return response.data ?? [];
};

// ✅ These three mutate an existing ticket (vs. /contact-us/submit which creates one), so the
// backend expects PUT, not POST - confirmed by a 405 ("Supported methods: PUT") on /resolve.
export const claimContactRequest = async (id: number): Promise<ContactRequest> => {
    const response = await apiClient.put<ContactRequest>(`${API_ROUTES.ADMIN_CONTACT_US.BASE}/${id}/in-progress`);
    return response.data;
};

export const resolveContactRequest = async (id: number, resolution: string): Promise<ContactRequest> => {
    const response = await apiClient.put<ContactRequest>(`${API_ROUTES.ADMIN_CONTACT_US.BASE}/${id}/resolve`, { resolution });
    return response.data;
};

export const markContactRequestNotResolved = async (id: number, nonResolutionReason: string): Promise<ContactRequest> => {
    const response = await apiClient.put<ContactRequest>(`${API_ROUTES.ADMIN_CONTACT_US.BASE}/${id}/not-resolved`, { nonResolutionReason });
    return response.data;
};
