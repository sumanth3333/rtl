
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/services/api/apiClient";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SetupPasswordClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isPasswordValid = (pwd: string): boolean => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!token) {
            setError("Invalid or missing token.");
            return;
        }

        if (!isPasswordValid(password)) {
            setError("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post("setupPassword/verify", { token, password });
            setSuccess("✅ Password setup successful! Redirecting...");
            setTimeout(() => router.push("/auth/login"), 2000);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen px-6 md:px-12 
            bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9] 
            dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#334155]">

            <div className="absolute inset-0 before:absolute before:inset-0 before:bg-grid-light dark:before:bg-grid-dark before:bg-opacity-10 before:bg-fixed" />

            <div className="relative w-full max-w-md p-8 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl 
                rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50">

                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
                    Setup Your <span className="text-blue-900 dark:text-blue-300">Password</span>
                </h1>

                <p className="text-center text-gray-700 dark:text-gray-400 mt-2 text-sm">
                    Create a secure password to access your account.
                </p>

                <div className="mt-8 space-y-4">
                    {/* Password Field */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full p-3 pr-10 rounded-md bg-white dark:bg-gray-800 border dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            aria-label="Toggle Password Visibility"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center"
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full p-3 pr-10 rounded-md bg-white dark:bg-gray-800 border dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            aria-label="Toggle Confirm Password Visibility"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center"
                        >
                            {showConfirm ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>
                    </div>

                    {/* Validation/Error Messages */}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-500">{success}</p>}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                    >
                        {loading ? "Setting up..." : "Create Account"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Powered by <span className="font-semibold text-blue-700 dark:text-blue-300">EasyDoers Inc.</span>
                </p>
            </div>
        </div>
    );
}
