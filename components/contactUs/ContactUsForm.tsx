"use client";

import { useState } from "react";
import { CheckCircle2, LifeBuoy } from "lucide-react";

import { ApiError } from "@/services/api/errorHandler";
import { ContactRequest, ContactRequestSeverity } from "@/types/contactUsTypes";
import { SEVERITY_META } from "./severityStyles";

const SEVERITY_HINTS: Record<ContactRequestSeverity, string> = {
    LOW: "Minor issue, no rush",
    MEDIUM: "Affects my work, not blocking",
    HIGH: "Blocking my work",
    CRITICAL: "Urgent - needs immediate attention",
};

const SEVERITY_OPTIONS: ContactRequestSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const MIN_CONCERN_LENGTH = 10;

const formatDateTime = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

interface ContactUsFormProps {
    requesterLabel: string;
    requesterSubLabel?: string;
    onSubmit: (input: { concern: string; severity: ContactRequestSeverity }) => Promise<ContactRequest>;
    onSubmitted?: (result: ContactRequest) => void;
}

export default function ContactUsForm({ requesterLabel, requesterSubLabel, onSubmit, onSubmitted }: ContactUsFormProps) {
    const [concern, setConcern] = useState("");
    const [severity, setSeverity] = useState<ContactRequestSeverity | "">("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<ContactRequest | null>(null);

    const canSubmit = concern.trim().length >= MIN_CONCERN_LENGTH && severity !== "";

    const handleSubmit = async () => {
        if (concern.trim().length < MIN_CONCERN_LENGTH || severity === "") { return; }
        setSubmitting(true);
        setError(null);
        try {
            const result = await onSubmit({ concern: concern.trim(), severity });
            setSubmitted(result);
            onSubmitted?.(result);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to submit your request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSubmitted(null);
        setConcern("");
        setSeverity("");
        setError(null);
    };

    if (submitted) {
        return (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Request submitted</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Our team has been notified and will follow up as soon as possible.
                    </p>
                </div>
                <div className="inline-flex flex-col items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] px-4 py-2.5 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Reference #{submitted.requestId}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Submitted {formatDateTime(submitted.requestedAt)}</span>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Submit another request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
                <div className="rounded-lg p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                    <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Submitting as</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{requesterLabel}</p>
                    {requesterSubLabel && <p className="text-xs text-gray-400 dark:text-gray-500">{requesterSubLabel}</p>}
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">What's going on?</label>
                <textarea
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    rows={5}
                    placeholder="Describe the issue you're running into - what you were trying to do, and what happened instead."
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                    {concern.trim().length < MIN_CONCERN_LENGTH ? `At least ${MIN_CONCERN_LENGTH} characters` : `${concern.trim().length} characters`}
                </p>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">How urgent is this?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SEVERITY_OPTIONS.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setSeverity(opt)}
                            title={SEVERITY_HINTS[opt]}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors text-left ${severity === opt
                                ? SEVERITY_META[opt].tone
                                : "border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                        >
                            {SEVERITY_META[opt].label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? "Submitting…" : "Submit Request"}
            </button>
        </div>
    );
}
