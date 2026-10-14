import apiClient from "../api/apiClient";
import { DateRangeMetricsResponse } from "@/types/metricReportTypes";

export async function fetchDateRangeMetrics(
    companyName: string,
    fromDate: string,
    toDate: string
): Promise<DateRangeMetricsResponse> {
    const response = await apiClient.get<DateRangeMetricsResponse>(
        "/company/viewDateRangeMetricsForStoresAndEmployees",
        {
            params: { companyName, fromDate, toDate },
        }
    );
    return response.data;
}
