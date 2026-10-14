export interface CompanyCredentialStatus {
    companyName: string;
    credentialsConfigured: boolean;
}

export interface SaveCompanyCredentialRequest {
    companyName: string;
    username: string;
    password: string;
}

export interface UpdateCompanyCredentialRequest {
    companyName: string;
    username?: string;
    password?: string;
}

export interface CompanyCredentialOtpRequest {
    companyName: string;
    latitude: number;
    longitude: number;
}

export interface VerifyCompanyCredentialOtpRequest {
    companyName: string;
    otp: string;
}

export interface CompanyCredentialViewResponse {
    username: string;
    password: string;
}

// ✅ Shape returned by GET /admin/companyCredentials - note userName (capital N), unlike the owner-side DTOs above
export interface AdminCompanyCredential {
    companyName: string;
    userName: string;
    password: string;
}
