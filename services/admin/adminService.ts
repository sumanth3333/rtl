import apiClient from "../api/apiClient";
import { Company } from "@/schemas/schema";
import { API_ROUTES } from "@/constants/apiRoutes";

export const createCompany = async (companyData: Company) => {
    return await apiClient.post(API_ROUTES.CREATE_COMPANY, companyData);
};
