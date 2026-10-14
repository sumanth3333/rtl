import axios from "axios";
import { handleApiError } from "./errorHandler";

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// The WhatsApp late-opening reporting service lives under a different base path (/api) than
// the rest of the backend (/v1), so it gets its own client instead of reusing apiClient.
const whatsappApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Timezone": userTimezone,
    },
    withCredentials: true,
});

whatsappApiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(handleApiError(error))
);

export default whatsappApiClient;
