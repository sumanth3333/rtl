"use client";

import { useEffect } from "react";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export default function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
    // Auto-close modal after 3 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all duration-300 scale-95 animate-fade-in">
                <div className="flex items-center space-x-3">
                    <span className="text-green-600 dark:text-green-400 text-2xl">✔</span>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{message}</p>

                <div className="mt-5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
