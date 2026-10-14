export interface SecureCodeStatus {
    secureCodeSetup: boolean;
}

export interface SecureCodeValidationResult {
    codeValidation: boolean;
    message: string;
}

export interface SecureCodeResetOtpSent {
    message: string;
    otpValiditySeconds: number;
    otpSent: boolean;
}

export interface SecureCodeResetOtpVerified {
    resetTokenValiditySeconds: number;
    resetToken: string;
    otpVerified: boolean;
}

export interface SecureCodeResetConfirmed {
    secureCodeAvailable: boolean;
    secureCodeReset: boolean;
}
