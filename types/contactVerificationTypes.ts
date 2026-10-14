export type WhatsappDeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "VERIFIED";

// ✅ email/phoneNumber/emailOtpSubmitted/whatsappOtpSubmitted are only present when that
// channel was part of the request, and the *Submitted flags reflect actual delivery success
// (not just "was requested") - e.g. a requested email send that fails to go out can still
// come back with emailOtpSubmitted: false or omitted.
export interface SendContactOtpResponse {
    requestId: string;
    email?: string;
    phoneNumber?: string;
    emailOtpSubmitted?: boolean;
    whatsappOtpSubmitted?: boolean;
    otpValiditySeconds: number;
    message: string;
}

export interface VerifyEmailOtpResponse {
    requestId: string;
    emailVerified: boolean;
    message: string;
}

export interface VerifyPhoneOtpResponse {
    requestId: string;
    phoneNumberVerified: boolean;
    message: string;
}

export interface WhatsappStatusResponse {
    requestId: string;
    whatsappStatus: WhatsappDeliveryStatus;
    phoneNumberVerified: boolean;
    message: string;
}

export interface ConfirmContactUpdateResponse {
    employeeNtid: string;
    email: string | null;
    phoneNumber: string | null;
    message: string;
}

export interface CurrentContactDetails {
    employeeNtid: string;
    employeeName: string;
    email: string;
    phoneNumber: string;
    emailVerified: boolean;
    phoneNumberVerified: boolean;
}
