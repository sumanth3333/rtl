import apiClient from "./api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { ContactRequest, ContactUsSubmitPayload } from "@/types/contactUsTypes";

export const submitContactUsRequest = async (payload: ContactUsSubmitPayload): Promise<ContactRequest> => {
    const response = await apiClient.post<ContactRequest>(API_ROUTES.CONTACT_US.SUBMIT, payload);
    return response.data;
};

export const fetchMyContactRequests = async (
    params: { employeeNtid: string } | { companyName: string }
): Promise<ContactRequest[]> => {
    const response = await apiClient.get<ContactRequest[]>(API_ROUTES.CONTACT_US.MY_REQUESTS, { params });
    return response.data ?? [];
};
