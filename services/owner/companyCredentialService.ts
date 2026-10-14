import apiClient from "@/services/api/apiClient";
import {
    CompanyCredentialStatus,
    SaveCompanyCredentialRequest,
    UpdateCompanyCredentialRequest,
    CompanyCredentialOtpRequest,
    VerifyCompanyCredentialOtpRequest,
    CompanyCredentialViewResponse,
} from "@/types/companyCredentialTypes";

// ✅ Every call here lets errors (ApiError, with the backend's message/status) propagate to the caller -
// the OTP flow in particular needs to branch on specific backend messages (wrong code, expired, locked, etc).

export const getCredentialStatus = async (companyName: string): Promise<CompanyCredentialStatus> => {
    const response = await apiClient.get<CompanyCredentialStatus>("/company-credentials/status", {
        params: { companyName },
    });
    return response.data;
};

export const saveCompanyCredentials = async (payload: SaveCompanyCredentialRequest): Promise<string> => {
    const response = await apiClient.post("/company-credentials/save", payload);
    return response.data?.message;
};

export const updateCompanyCredentials = async (payload: UpdateCompanyCredentialRequest): Promise<string> => {
    const response = await apiClient.put("/company-credentials/update", payload);
    return response.data?.message;
};

export const deleteCompanyCredentials = async (companyName: string): Promise<string> => {
    const response = await apiClient.delete("/company-credentials/delete", {
        params: { companyName },
    });
    return response.data?.message;
};

export const requestViewOtp = async (payload: CompanyCredentialOtpRequest): Promise<string> => {
    const response = await apiClient.post("/company-credentials/view/request-otp", payload);
    return response.data?.message;
};

export const verifyViewOtp = async (
    payload: VerifyCompanyCredentialOtpRequest
): Promise<CompanyCredentialViewResponse> => {
    const response = await apiClient.post<CompanyCredentialViewResponse>(
        "/company-credentials/view/verify-otp",
        payload
    );
    return response.data;
};
