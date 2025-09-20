"use client";
import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useLogin } from "@/hooks/useLogin";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const { register, handleSubmit, errors, errorMessage, onSubmit, isLoading } = useLogin(onLoginSuccess);
    const [showPassword, setShowPassword] = useState(false);

    // ✅ Track viewport dimensions
    const [viewport, setViewport] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions(); // Set initial value
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 w-full max-w-sm mx-auto"
        >
            {/* ✅ Viewport Info */}
            <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                Viewport: {viewport.width}px × {viewport.height}px
            </div>

            {/* ✅ Username / Store ID Field */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <InputField
                    label="Username or Store ID"
                    type="text"
                    placeholder="Enter Username or Store ID"
                    {...register("userName")}
                    error={errors.userName?.message}
                />
            </motion.div>

            {/* ✅ Password Field */}
            <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <div className="relative">
                    <InputField
                        label="Password or Employee NTID"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password or NTID"
                        {...register("password")}
                        error={errors.password?.message}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 bottom-2.5 md:bottom-3 flex items-center focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        )}
                    </button>
                </div>
            </motion.div>

            {/* ✅ Display Error Messages */}
            {errorMessage && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-red-500 text-sm text-center"
                >
                    {errorMessage}
                </motion.p>
            )}

            {/* ✅ Full-Width Animated Submit Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Button type="submit" variant="black" isLoading={isLoading} className="w-full text-lg py-3 rounded-xl">
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </motion.div>
        </motion.form>
    );
}
