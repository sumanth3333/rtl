"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/services/api/errorHandler";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (username: string | undefined, password: string | undefined) => Promise<void>;
    updating: boolean;
}

export default function CredentialUpdateModal({ isOpen, onClose, onUpdate, updating }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) { return null; }

    const handleClose = () => {
        setUsername("");
        setPassword("");
        setShowPassword(false);
        setError(null);
        onClose();
    };

    const handleSave = async () => {
        if (!username.trim() && !password) {
            setError("Enter a new username, a new password, or both.");
            return;
        }
        setError(null);
        try {
            await onUpdate(username.trim() || undefined, password || undefined);
            handleClose();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to update credentials.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Company Credentials</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Leave a field blank to keep its current value. To see the current values first, use View Credentials instead.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            New Username <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            New Password <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Any active verification code will be invalidated once you save.
                    </p>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={updating}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={updating}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                    >
                        {updating ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
