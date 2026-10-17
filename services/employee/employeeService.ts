import { EodSubmissionRequest, MultiEmployeeSalesResponse } from "@/types/employeeSchema";
import apiClient from "../api/apiClient";
import { Todo } from "@/types/todos";
import { LateOpeningStatus } from "@/types/lateOpeningTypes";
import { ClockInLocation } from "@/types/employeeTypes";
import {
    SecureCodeStatus,
    SecureCodeValidationResult,
    SecureCodeResetOtpSent,
    SecureCodeResetOtpVerified,
    SecureCodeResetConfirmed,
} from "@/types/secureCodeTypes";

export const getSecureCodeStatus = async (employeeNtid: string): Promise<SecureCodeStatus> => {
    const response = await apiClient.get<SecureCodeStatus>("/employee/secureCode/status", {
        params: { employeeNtid },
    });
    return response.data;
};

export const setupSecureCode = async (employeeNtid: string, secureCode: string): Promise<SecureCodeStatus> => {
    const response = await apiClient.post<SecureCodeStatus>("/employee/setupSecureCode", null, {
        params: { employeeNtid, secureCode },
    });
    return response.data;
};

// ✅ codeValidation=false is a normal response (wrong code, mismatched employee, not configured) - not an HTTP error
export const validateSecureCode = async (employeeNtid: string, secureCode: string): Promise<SecureCodeValidationResult> => {
    const response = await apiClient.post<SecureCodeValidationResult>("/employee/validateSecureCode", null, {
        params: { employeeNtid, secureCode },
    });
    return response.data;
};

// ✅ Forgot-secure-code flow: send-otp -> verify-otp (returns a short-lived resetToken) -> confirm
export const sendSecureCodeResetOtp = async (employeeNtid: string): Promise<SecureCodeResetOtpSent> => {
    const response = await apiClient.post<SecureCodeResetOtpSent>("/employee/secure-code/reset/send-otp", {
        employeeNtid,
    });
    return response.data;
};

export const verifySecureCodeResetOtp = async (
    employeeNtid: string,
    otp: string
): Promise<SecureCodeResetOtpVerified> => {
    const response = await apiClient.post<SecureCodeResetOtpVerified>("/employee/secure-code/reset/verify-otp", {
        employeeNtid,
        otp,
    });
    return response.data;
};

export const confirmSecureCodeReset = async (
    employeeNtid: string,
    resetToken: string,
    newSecureCode: string
): Promise<SecureCodeResetConfirmed> => {
    const response = await apiClient.post<SecureCodeResetConfirmed>("/employee/secure-code/reset/confirm", {
        employeeNtid,
        resetToken,
        newSecureCode,
    });
    return response.data;
};

export const fetchLateOpeningStatus = async (
    employeeNtid: string,
    dealerStoreId: string
): Promise<LateOpeningStatus> => {
    const response = await apiClient.get<LateOpeningStatus>("/employee/late-opening/status", {
        params: { employeeNtid, dealerStoreId },
    });
    return response.data;
};

export const clockInEmployee = async (
    employeeNtid: string,
    dealerStoreId: string,
    location: ClockInLocation
) => {
    // ✅ Let location-validation errors (ApiError, with distance/message details) propagate to the caller
    const response = await apiClient.post(`/employee/clockin`, {
        employeeNtid,
        dealerStoreId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyMeters: location.accuracyMeters,
    });

    return response.data || {};
};

// ✅ One request covering every employee credited for this store/date (self, coworkers, and cross-store credits)
export const submitEodReport = async (data: EodSubmissionRequest) => {
    try {
        const response = await apiClient.post("/sale/saveSaleDetails", data);
        return response.data; // Return the API response if needed
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === "string") {
            errorMessage = error;
        } else if (error && typeof error === "object" && "response" in error) {
            errorMessage =
                (error as any).response?.data?.message || "API request failed";
        }

        console.error("❌ Failed to Submit EOD Report:", errorMessage);
        throw new Error(errorMessage); // Re-throw error for UI handling
    }
};

// ✅ Full company employee roster, used to pick who gets cross-store sales credit
export const getCompanyEmployees = async (
    companyName: string
): Promise<{ employeeNtid: string; employeeName: string }[]> => {
    const response = await apiClient.get("/company/viewAllEmployeesUnderTheCompany", {
        params: { companyName },
    });
    return response.data?.employees || [];
};

export const getEodDetails = async (dealerStoreId: string, employeeNtid: string) => {
    try {
        const response = await apiClient.get("/sale/fetchSubmittedSale", {
            params: {
                dealerStoreId,
                employeeNtid
            }
        });
        console.log(response);
        return response.data; // Return the API response if needed
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === "string") {
            errorMessage = error;
        } else if (error && typeof error === "object" && "response" in error) {
            errorMessage =
                (error as any).response?.data?.message || "API request failed";
        }
        console.error("❌ Failed to fetch EOD Report details:", errorMessage);
        throw new Error(errorMessage); // Re-throw error for UI handling
    }
};

export const fetchTodos = async (storeId: string) => {
    try {
        const response = await apiClient.get(`/todos/getAssinedTodos?dealerStoreId=${storeId}`);
        if (response.data && Array.isArray(response.data.todos)) {
            return response.data;
        } else {
            console.error("Invalid response format", response.data);
            return { todos: [] }; // ✅ Ensure a fallback empty array
        }
    } catch (error) {
        console.error("API Error fetching todos:", error);
        return { todos: [] }; // ✅ Prevent crash by returning empty array
    }
};


export const updateTodoStatus = async (todoId: number, newStatus: boolean, employeeNtid: string): Promise<Todo> => {
    try {
        const response = await apiClient.put<Todo>("/todos/updateStatus", {
            id: todoId,
            completed: newStatus,
            employeeNtid: employeeNtid,
        });
        return response.data;
    } catch (error: unknown) {
        console.error("❌ API Update Error:", error);
        throw new Error("Failed to update todo status.");
    }
};

export const getAuthorizedStoresAPI = async (employeeNtid: string) => {
    const url = `/employee/authorizedStores/${employeeNtid}`;
    try {
        const response = await apiClient.get(url);

        if (!response.data || typeof response.data !== "object" || !Array.isArray(response.data.stores)) {
            throw new Error("Invalid response format from API.");
        }

        //console.log(`✅ Authorized Stores:`, response.data.stores);
        return response.data; // Returns the full response containing `stores`
    } catch (error: any) {
        console.error("❌ Error fetching authorized stores:", error);
        throw error.response?.data || "An error occurred while fetching stores.";
    }
};

// ✅ Fetch Store Targets based on store ID
export const getStoreTargets = async (dealerStoreId: string) => {
    try {
        const response = await apiClient.get("/store/attainment", {
            params: { dealerStoreId },
        });

        return response.data; // Directly return raw response
    } catch (error) {
        console.error("❌ Error fetching store targets:", error);
        return null;
    }
};

// ✅ Fetch Employee Targets based on employee NTID
export const getEmployeeTargets = async (employeeNtid: string) => {
    try {
        const response = await apiClient.get("/employee/attainment", {
            params: { employeeNtid },
        });

        return response.data; // Directly return raw response
    } catch (error) {
        console.error("❌ Error fetching employee targets:", error);
        return null;
    }
};

export const getPendingTodosCount = async (dealerStoreId: string): Promise<number> => {
    try {
        const response = await apiClient.get("/todos/pendingTodosCount", {
            params: {
                dealerStoreId
            }
        });
        //console.log(response.data);
        return response.data.count || 0;
    } catch (error) {
        console.error("Error fetching pending todos count:", error);
        return 0;
    }
};

export const getEmployeesWorking = async (dealerStoreId: string) => {
    try {
        const response = await apiClient.get(`/store/numberOfEmployeesWorking?dealerStoreId=${dealerStoreId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to fetch employees working:", error);
        throw new Error("Failed to retrieve employees working data.");
    }
};

// ✅ Per-employee breakdown mirroring whatever was last submitted for this store/date - used
// to pre-fill the multi-employee EOD split instead of starting every row at zero.
export const fetchMultiEmployeeSales = async (
    dealerStoreId: string,
    date: string
): Promise<MultiEmployeeSalesResponse> => {
    const response = await apiClient.get<MultiEmployeeSalesResponse>("/sale/fetchMultiEmployeeSales", {
        params: { dealerStoreId, date },
    });
    return response.data;
};

export const fetchCompanyNameByNtid = async (employeeNtid: string) => {
    try {
        const response = await apiClient.get(`/employee/getCompanyName/${employeeNtid}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to fetch companyName", error);
        throw new Error("Failed to fetch companyName");
    }
};

export async function clockOutEmployee(
    employeeNtid: string,
    dealerStoreId: string
) {
    try {
        const response = await apiClient.post(
            "/employee/clockout",
            {
                employeeNtid,
                dealerStoreId,

            }
        );

        return { data: response.data, error: null };
    } catch (error: any) {
        console.error("Clock-out failed:", error);
        return {
            data: null,
            error:
                error?.response?.data?.message ||
                error?.message ||
                "Clock-out failed. Please try again.",
        };
    }
}
