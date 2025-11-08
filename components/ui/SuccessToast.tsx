"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function SuccessToast({
    message,
    onClose,
    duration = 3000,
    position = "top-right",
}: {
    message: string;
    onClose: () => void;
    duration?: number;
    position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}) {
    // Auto-hide after `duration`
    useEffect(() => {
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [onClose, duration]);

    if (!message) { return null; }

    // Position presets
    const pos =
        position === "top-right"
            ? "top-4 right-4"
            : position === "top-center"
                ? "top-4 left-1/2 -translate-x-1/2"
                : position === "bottom-right"
                    ? "bottom-4 right-4"
                    : "bottom-4 left-1/2 -translate-x-1/2";

    const toast = (
        <div
            className={`fixed ${pos} z-[10000] pointer-events-none`}
            aria-live="polite"
            aria-atomic="true"
        >
            <div
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-green-300
                   bg-green-50/95 text-green-900 shadow-lg px-4 py-3 max-w-md w-max"
                role="status"
            >
                {/* Icon */}
                <svg
                    className="h-5 w-5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 10-1.214-.882l-3.21 4.427-1.53-1.53a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.624-4.231z"
                        clipRule="evenodd"
                    />
                </svg>

                <div className="text-sm font-medium">{message}</div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="ml-2 text-green-800/70 hover:text-green-900 focus:outline-none"
                    aria-label="Dismiss notification"
                >
                    ×
                </button>
            </div>
        </div>
    );

    return typeof document !== "undefined" ? createPortal(toast, document.body) : null;
}
