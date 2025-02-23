class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export const handleApiError = (error: any) => {
    console.error("🚨 API Error:", error?.response?.data || error.message);

    if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
            console.error("🔒 Unauthorized: Redirecting to login.");
        } else if (status === 500) {
            console.error("🔥 Internal Server Error!");
        }

        return new ApiError(data?.message || "API Request Failed", status, data);
    }

    return new ApiError("Network Error", 500);
};
