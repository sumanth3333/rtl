import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useOwner } from "./useOwner";
import { useEmployee } from "./useEmployee";
import { ApiError, isServerUnreachable, MAINTENANCE_MESSAGE } from "@/services/api/errorHandler";
import { login } from "@/services/auth/authService";
import { AUTH_BROADCAST_CHANNEL, AUTH_SYNC_EVENT_KEY } from "@/constants/authSync";

const loginSchema = z.object({
    userName: z.string().min(6, "Valid Username or Store ID is required"),
    password: z.string().min(6, "Valid Password or NTID is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export function useLogin(onLoginSuccess: () => void) {
    const [errorMessage, setErrorMessage] = useState("");
    const { refreshAuth } = useAuth(); // ✅ Get function to refresh authentication state
    const [isLoading, setIsLoading] = useState(false); // ✅ Add loading state
    const { setOwnerData } = useOwner(); // ✅ Store owner details
    const { setEmployeeData } = useEmployee();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginData) => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const response = await login(data.userName, data.password);
            if (response.status === 200) {
                await refreshAuth();
                const payload = JSON.stringify({ type: "login", at: Date.now() });
                try {
                    localStorage.setItem(AUTH_SYNC_EVENT_KEY, payload);
                } catch {
                    // no-op
                }
                try {
                    if ("BroadcastChannel" in window) {
                        const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
                        channel.postMessage({ type: "login", at: Date.now() });
                        channel.close();
                    }
                } catch {
                    // no-op
                }
                if (response.data.loginPerson) {
                    setOwnerData(response.data.loginPerson, response.data.loginEmail);
                } else if (response.data.employee) {
                    setEmployeeData(response.data);
                }
                onLoginSuccess();
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error: unknown) {
            console.error("🚨 Login error:", error);

            if (error instanceof ApiError && isServerUnreachable(error)) {
                setErrorMessage(MAINTENANCE_MESSAGE);
            } else if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An unknown error occurred");
            }
        } finally {
            setIsLoading(false); // ✅ Stop loading when done
        }
    };

    return { register, handleSubmit, errors, errorMessage, onSubmit, isLoading };
}
