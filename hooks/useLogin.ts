import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useOwner } from "./useOwner";
import { useEmployee } from "./useEmployee";
import { AxiosError } from "axios";
import { login } from "@/services/auth/authService";
import { isPhoneDevice } from "@/utils/deviceType";

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

        // 🚨 Determine if the user is an employee by checking for '@' in username
        const isEmployee = !data.userName.includes("@");

        // Block employees on phones (UA-based, not just width)
        if (isEmployee && isPhoneDevice()) {
            setErrorMessage("Employee login is not available on phones. Please use a store tablet.");
            return;
        }
        // 🚨 Block employees from logging in on small screens before making any request
        if (isEmployee && window.innerWidth < 768) {
            setErrorMessage("Employee login is not available on phones. Please use a store tablet.");
            return; // ❌ STOP LOGIN PROCESS HERE
        }

        setIsLoading(true);
        setErrorMessage("");
        try {
            const response = await login(data.userName, data.password);
            if (response.status === 200) {
                await refreshAuth();
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

            // ✅ Correct way to handle Axios errors
            if (error instanceof AxiosError) {
                setErrorMessage(error.response?.data?.message || "An unexpected error occurred");
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
