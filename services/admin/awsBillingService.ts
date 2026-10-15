import apiClient from "../api/apiClient";
import { API_ROUTES } from "@/constants/apiRoutes";
import { AwsBillingInvoices, AwsBillingOverview, AwsServicesBreakdown, AwsUsageBreakdown } from "@/types/awsBillingTypes";

export const fetchAwsBillingOverview = async (month: string): Promise<AwsBillingOverview> => {
    const response = await apiClient.get<AwsBillingOverview>(API_ROUTES.AWS_BILLING.OVERVIEW, {
        params: { month },
    });
    return response.data;
};

export const fetchAwsBillingServices = async (month: string): Promise<AwsServicesBreakdown> => {
    const response = await apiClient.get<AwsServicesBreakdown>(API_ROUTES.AWS_BILLING.SERVICES, {
        params: { month },
    });
    return response.data;
};

export const fetchAwsBillingUsage = async (month: string): Promise<AwsUsageBreakdown> => {
    const response = await apiClient.get<AwsUsageBreakdown>(API_ROUTES.AWS_BILLING.USAGE, {
        params: { month },
    });
    return response.data;
};

export const fetchAwsBillingInvoices = async (month: string): Promise<AwsBillingInvoices> => {
    const response = await apiClient.get<AwsBillingInvoices>(API_ROUTES.AWS_BILLING.INVOICES, {
        params: { month },
    });
    return response.data;
};
