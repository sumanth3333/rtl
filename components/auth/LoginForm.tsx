"use client";

import { useLogin } from "@/hooks/useLogin"; // ✅ Import updated hook
import InputField from "@/components/ui/InputField"; // ✅ Import enhanced input field
import Button from "@/components/ui/Button"; // ✅ Import enhanced button

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const { register, handleSubmit, errors, errorMessage, onSubmit, isLoading } = useLogin(onLoginSuccess);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm">
            {/* ✅ Username / Store ID */}
            <InputField
                label="Username or Store ID"
                type="text"
                placeholder="Enter Username or Store ID"
                {...register("userName")}
                error={errors.userName?.message}
            />

            {/* ✅ Password / Employee NTID */}
            <InputField
                label="Password or Employee NTID"
                type="password"
                placeholder="Enter Password or NTID"
                {...register("password")}
                error={errors.password?.message}
            />

            {/* ✅ Display Error Messages */}
            {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

            {/* ✅ Full-Width Submit Button */}
            <Button
                text="Login"
                type="submit"
                variant="black"
                isLoading={isLoading}
                className="w-full" // ✅ Ensures button is full width
            />
        </form>
    );
}
