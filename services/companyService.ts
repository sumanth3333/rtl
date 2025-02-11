import apiClient from "./apiClient";
import { Company } from "@/types/schema";
import { API_ROUTES } from "@/constants/apiRoutes";

export const createCompany = async (companyData: Company) => {
    return await apiClient.post(API_ROUTES.CREATE_COMPANY, companyData);
};
