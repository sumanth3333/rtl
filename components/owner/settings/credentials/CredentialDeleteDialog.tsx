"use client";

import { useState } from "react";
import { ApiError } from "@/services/api/errorHandler";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
    deleting: boolean;
}

export default function CredentialDeleteDialog({ isOpen, onClose, onDelete, deleting }: Props) {
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) { return null; }

    const handleDelete = async () => {
        setError(null);
        try {
            await onDelete();
            onClose();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to delete credentials.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-rose-200 dark:border-rose-800">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete saved credentials?</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                        This permanently removes the saved company username and password.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        You will need to add them again to use this feature.
                    </p>
                    {error && (
                        <p className="text-sm text-rose-600 dark:text-rose-400 mt-3">{error}</p>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-60"
                    >
                        {deleting ? "Deleting..." : "Delete Credentials"}
                    </button>
                </div>
            </div>
        </div>
    );
}
