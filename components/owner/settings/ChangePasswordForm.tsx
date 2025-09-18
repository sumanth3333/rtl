"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/api/apiClient";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { playNotificationSound } from "@/utils/playNotificationSound";
import { useOwner } from "@/hooks/useOwner";

function PasswordInput({
    value,
    onChange,
    show,
    toggleShow,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    toggleShow: () => void;
    placeholder: string;
}) {
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 pr-10 rounded-md bg-white dark:bg-gray-800 border dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={toggleShow} className="absolute inset-y-0 right-3 flex items-center">
                {show ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                    <EyeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
            </button>
        </div>
    );
}

export default function ChangePasswordForm() {
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { ownerEmail } = useOwner();

    const isPasswordStrong = (password: string) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);

    useEffect(() => {
        // Live error validation
        if (!oldPwd || !newPwd || !confirmPwd) {
            setFormError("All fields are required.");
        } else if (!isPasswordStrong(newPwd)) {
            setFormError("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
        } else if (oldPwd === newPwd) {
            setFormError("New password must be different from current password.");
        } else if (newPwd !== confirmPwd) {
            setFormError("Passwords do not match.");
        } else {
            setFormError(null);
        }
    }, [oldPwd, newPwd, confirmPwd]);

    const handleSubmit = async () => {
        if (formError) { return; }

        try {
            const response = await apiClient.post("/company/changePassword", {
                userName: ownerEmail,
                currentPassword: oldPwd,
                password: newPwd,
            });
            toast.success("Password changed successfully.");
            playNotificationSound();
            setOldPwd("");
            setNewPwd("");
            setConfirmPwd("");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err.message ||
                "Error changing password.";

            setFormError(msg);
        }

    };

    return (
        <div className="space-y-4">
            <PasswordInput
                value={oldPwd}
                onChange={setOldPwd}
                show={showOld}
                toggleShow={() => setShowOld(!showOld)}
                placeholder="Current Password"
            />
            <PasswordInput
                value={newPwd}
                onChange={setNewPwd}
                show={showNew}
                toggleShow={() => setShowNew(!showNew)}
                placeholder="New Password"
            />
            <PasswordInput
                value={confirmPwd}
                onChange={setConfirmPwd}
                show={showConfirm}
                toggleShow={() => setShowConfirm(!showConfirm)}
                placeholder="Confirm New Password"
            />

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <button
                onClick={handleSubmit}
                disabled={!!formError}
                className={`w-full mt-2 py-3 rounded-lg font-semibold transition ${formError
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
            >
                Update Password
            </button>
        </div>
    );
}
