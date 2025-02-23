"use client";

import { useLogin } from "@/hooks/useLogin"; // ✅ Import updated hook
import InputField from "@/components/ui/InputField"; // ✅ Import enhanced input field
import Button from "@/components/ui/Button"; // ✅ Import enhanced button
import { motion } from "framer-motion";

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const { register, handleSubmit, errors, errorMessage, onSubmit, isLoading } = useLogin(onLoginSuccess);

    return (
        <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6 w-full max-w-sm mx-auto"
        >
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

            {/* ✅ Password / Employee NTID Field */}
            <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <InputField
                    label="Password or Employee NTID"
                    type="password"
                    placeholder="Enter Password or NTID"
                    {...register("password")}
                    error={errors.password?.message}
                />
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
