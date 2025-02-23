"use client";

import { useEffect } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    data?: Record<string, any> | null;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    data = null,
}: ConfirmationModalProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all duration-300 scale-100">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                {message && <p className="text-gray-600 dark:text-gray-300 mt-2">{message}</p>}

                {data && Object.keys(data).length > 0 && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-white">Review Details</h3>
                        <div className="mt-2 space-y-2 text-gray-700 dark:text-gray-300">
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="border-b pb-2">
                                    <h4 className="font-semibold capitalize text-gray-900 dark:text-white">{key.replace(/([A-Z])/g, " $1")}</h4>
                                    {typeof value === "object" && value !== null ? (
                                        Array.isArray(value) ? (
                                            <ul className="list-disc pl-4">
                                                {value.map((item, index) => (
                                                    <li key={index}>{JSON.stringify(item)}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4 mt-1">
                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                    <p key={subKey}>
                                                        <span className="font-medium">{subKey.replace(/([A-Z])/g, " $1")}:</span> {String(subValue)}
                                                    </p>
                                                ))}
                                            </div>
                                        )
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-5 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 bg-teal-900 text-white rounded-md hover:bg-teal-700 transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
