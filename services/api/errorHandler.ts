export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

// ✅ Backends disagree on error shape (message, error, errors[], plain string, etc.)
// so try each in order instead of only ever reading `data.message`.
const extractMessage = (data: any): string | null => {
    if (!data) {
        return null;
    }
    if (typeof data === "string" && data.trim()) {
        return data;
    }

    if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
    }
    if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
    }
    if (typeof data.detail === "string" && data.detail.trim()) {
        return data.detail;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors
            .map((e: any) => {
                if (typeof e === "string") {
                    return e;
                }
                return e?.defaultMessage || e?.message || (e?.field ? `${e.field}: invalid value` : null);
            })
            .filter(Boolean)
            .join(" — ") || null;
    }

    if (data.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors).filter((v) => typeof v === "string");
        if (messages.length > 0) {
            return messages.join(" — ");
        }
    }

    return null;
};

export const handleApiError = (error: any) => {
    console.error("🚨 API Error:", error?.response?.data || error.message);

    if (error.response) {
        const { status, data, statusText } = error.response;

        if (status === 401) {
            console.error("🔒 Unauthorized: Redirecting to login.");
        } else if (status === 500) {
            console.error("🔥 Internal Server Error!");
        }

        const message = extractMessage(data) || statusText || `Request failed with status ${status}`;
        return new ApiError(message, status, data);
    }

    if (error.request) {
        return new ApiError("Could not reach the server. Please check your connection and try again.", 0);
    }

    return new ApiError(error.message || "Something went wrong. Please try again.", 0);
};
