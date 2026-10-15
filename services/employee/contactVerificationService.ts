import apiClient from "../api/apiClient";
import {
    SendContactOtpResponse,
    VerifyEmailOtpResponse,
    VerifyPhoneOtpResponse,
    WhatsappStatusResponse,
    ConfirmContactUpdateResponse,
    CurrentContactDetails,
} from "@/types/contactVerificationTypes";

const BASE = "/employee/contact-verification";

// ✅ Secure-code gated - same PIN used at clock-in - since this reveals the employee's
// currently saved email/phone and their verification state.
export const getCurrentContactDetails = async (
    employeeNtid: string,
    secureCode: string
): Promise<CurrentContactDetails> => {
    const response = await apiClient.post<CurrentContactDetails>(`${BASE}/current-details`, {
        employeeNtid,
        secureCode,
    });
    return response.data;
};

// ✅ email and/or phoneNumber - whichever channel(s) are omitted are not part of this request
// and cannot later be verified/confirmed under its requestId. secureCode is required here too
// (same PIN as current-details), not just at whatsapp-status.
export const sendContactVerificationOtp = async (
    employeeNtid: string,
    secureCode: string,
    email?: string,
    phoneNumber?: string
): Promise<SendContactOtpResponse> => {
    const response = await apiClient.post<SendContactOtpResponse>(`${BASE}/send-otp`, {
        employeeNtid,
        secureCode,
        ...(email ? { email } : {}),
        ...(phoneNumber ? { phoneNumber } : {}),
    });
    return response.data;
};

export const verifyEmailOtp = async (
    employeeNtid: string,
    requestId: string,
    otp: string
): Promise<VerifyEmailOtpResponse> => {
    const response = await apiClient.post<VerifyEmailOtpResponse>(`${BASE}/verify-email`, {
        employeeNtid,
        requestId,
        otp,
    });
    return response.data;
};

// ✅ Named verify-phone by the backend controller even though the OTP travels over WhatsApp.
export const verifyWhatsappOtp = async (
    employeeNtid: string,
    requestId: string,
    otp: string
): Promise<VerifyPhoneOtpResponse> => {
    const response = await apiClient.post<VerifyPhoneOtpResponse>(`${BASE}/verify-phone`, {
        employeeNtid,
        requestId,
        otp,
    });
    return response.data;
};

export const getWhatsappVerificationStatus = async (
    employeeNtid: string,
    requestId: string,
    secureCode: string
): Promise<WhatsappStatusResponse> => {
    const response = await apiClient.post<WhatsappStatusResponse>(`${BASE}/whatsapp-status`, {
        employeeNtid,
        requestId,
        secureCode,
    });
    return response.data;
};

export const confirmContactVerification = async (
    employeeNtid: string,
    requestId: string,
    secureCode: string
): Promise<ConfirmContactUpdateResponse> => {
    const response = await apiClient.post<ConfirmContactUpdateResponse>(`${BASE}/confirm`, {
        employeeNtid,
        requestId,
        secureCode,
    });
    return response.data;
};
