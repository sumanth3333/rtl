import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/services/authService"; // ✅ API call
import { useAuth } from "@/hooks/useAuth"; // ✅ Import authentication state

// ✅ Define validation schema
const loginSchema = z.object({
    userName: z.string().min(6, "Valid Store ID is required"),
    password: z.string().min(6, "Valid Employee NTID is required"),
});

// ✅ Define TypeScript type
type LoginData = z.infer<typeof loginSchema>;

export function useLogin(onLoginSuccess: () => void) {
    const [errorMessage, setErrorMessage] = useState("");
    const { refreshAuth } = useAuth(); // ✅ Get function to refresh authentication state
    const [isLoading, setIsLoading] = useState(false); // ✅ Add loading state

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    // ✅ Handle login request
    const onSubmit = async (data: LoginData) => {
        setIsLoading(true); // ✅ Start loading when submitting
        setErrorMessage("");
        try {
            const response = await login(data.userName, data.password);
            console.log(`log in response is ${JSON.stringify(response.data)}`);

            if (response.status === 200) {
                console.log("✅ Login successful! Refreshing auth state...");

                // ✅ Refresh authentication state
                await refreshAuth();

                // ✅ Redirect after auth state updates
                onLoginSuccess();
            } else {
                setErrorMessage("Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("🚨 Login error:", error);
            setErrorMessage("Please check your details.");
        } finally {
            setIsLoading(false); // ✅ Stop loading when done
        }
    };

    return { register, handleSubmit, errors, errorMessage, onSubmit, isLoading };
}
