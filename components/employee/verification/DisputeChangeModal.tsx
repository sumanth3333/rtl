"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { submitDateRangeChangeRequest } from "@/services/employeeVerificationService";
import { ApiError } from "@/services/api/errorHandler";
import { ChangeInput, DateRangeRequest, StoreDayRecord } from "@/types/employeeVerification";

interface Props {
    date: string;
    store: StoreDayRecord;
    baseRequest: DateRangeRequest;
    onClose: () => void;
    onSubmitted: (date: string, dealerStoreId: string) => void;
}

const toInputTime = (value?: string | null) => (value ? value.slice(0, 5) : "");
const toApiTime = (value: string) => (value.length === 5 ? `${value}:00` : value);

type FieldToggle = {
    key: string;
    label: string;
    checked: boolean;
    targetKind: "WORK" | "SALE";
    targetId: number;
    fieldName: string;
    kind: "time" | "number";
    originalDisplay: string;
    value: string;
};

export default function DisputeChangeModal({ date, store, baseRequest, onClose, onSubmitted }: Props) {
    // Every work session is disputable, complete or not - an open session (no clock-out yet)
    // is exactly the kind of thing an employee needs to correct.
    const workSessions = [
        ...store.actualWork.map((w) => ({ entry: w, suffix: "" })),
        ...store.incompleteWork.map((w) => ({ entry: w, suffix: " (Incomplete)" })),
        ...store.salesCreditWork.map((w) => ({ entry: w, suffix: " (Credit)" })),
    ];

    const initialFields: FieldToggle[] = [
        ...workSessions.flatMap(({ entry: w, suffix }) => [
            {
                key: `work-${w.workId}-in`,
                label: `Clock In${suffix}`,
                checked: false,
                targetKind: "WORK" as const,
                targetId: w.workId,
                fieldName: "CLOCK_IN_TIME",
                kind: "time" as const,
                originalDisplay: toInputTime(w.clockInTime) || "—",
                value: toInputTime(w.clockInTime),
            },
            {
                key: `work-${w.workId}-out`,
                label: `Clock Out${suffix}`,
                checked: false,
                targetKind: "WORK" as const,
                targetId: w.workId,
                fieldName: "CLOCK_OUT_TIME",
                kind: "time" as const,
                originalDisplay: toInputTime(w.clockOutTime) || "Not clocked out",
                value: toInputTime(w.clockOutTime),
            },
        ]),
        ...store.regularSales.flatMap((s) => [
            { key: `sale-${s.saleId}-act`, label: "Activations", checked: false, targetKind: "SALE" as const, targetId: s.saleId, fieldName: "ACTIVATIONS", kind: "number" as const, originalDisplay: String(s.activations), value: String(s.activations) },
            { key: `sale-${s.saleId}-upg`, label: "Upgrades", checked: false, targetKind: "SALE" as const, targetId: s.saleId, fieldName: "UPGRADES", kind: "number" as const, originalDisplay: String(s.upgrades), value: String(s.upgrades) },
            { key: `sale-${s.saleId}-bts`, label: "BTS", checked: false, targetKind: "SALE" as const, targetId: s.saleId, fieldName: "BTS", kind: "number" as const, originalDisplay: String(s.bts), value: String(s.bts) },
            { key: `sale-${s.saleId}-hsi`, label: "HSI", checked: false, targetKind: "SALE" as const, targetId: s.saleId, fieldName: "HSI", kind: "number" as const, originalDisplay: String(s.hsi), value: String(s.hsi) },
            { key: `sale-${s.saleId}-promo`, label: "Promotional Lines", checked: false, targetKind: "SALE" as const, targetId: s.saleId, fieldName: "PROMOTIONAL_LINES", kind: "number" as const, originalDisplay: String(s.promotionalLines), value: String(s.promotionalLines) },
        ]),
    ];

    const [fields, setFields] = useState<FieldToggle[]>(initialFields);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleField = (key: string) => {
        setFields((prev) => prev.map((f) => (f.key === key ? { ...f, checked: !f.checked } : f)));
    };

    const updateValue = (key: string, value: string) => {
        setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
    };

    const selectedFields = fields.filter((f) => f.checked);
    const canSubmit = selectedFields.length > 0 && reason.trim().length > 0 && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) { return; }
        setSubmitting(true);
        setError(null);
        try {
            const changes: ChangeInput[] = selectedFields.map((f) => ({
                targetKind: f.targetKind,
                targetId: f.targetId,
                fieldName: f.fieldName,
                requestedValue: f.kind === "time" ? toApiTime(f.value) : f.value,
            }));

            await submitDateRangeChangeRequest({
                ...baseRequest,
                fromDate: date,
                toDate: date,
                changes: [
                    {
                        date,
                        dealerStoreId: store.dealerStoreId,
                        snapshotHash: store.snapshotHash,
                        reason: reason.trim(),
                        changes,
                    },
                ],
            });

            onSubmitted(date, store.dealerStoreId);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to submit the correction request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Request a Correction</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{store.storeName} ({store.dealerStoreId}) · {date}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Check each field you believe is wrong and enter the correct value. Your owner will review this before anything changes.
                    </p>

                    <div className="space-y-2">
                        {fields.map((f) => (
                            <div key={f.key} className={`rounded-md border px-3 py-2 ${f.checked ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                    <input type="checkbox" checked={f.checked} onChange={() => toggleField(f.key)} className="rounded" />
                                    {f.label}
                                    <span className="text-xs font-normal text-gray-400">(current: {f.originalDisplay || "—"})</span>
                                </label>
                                {f.checked && (
                                    <input
                                        type={f.kind === "time" ? "time" : "number"}
                                        value={f.value}
                                        onChange={(e) => updateValue(f.key, e.target.value)}
                                        className="mt-2 w-full sm:w-40 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
                                    />
                                )}
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No editable fields found for this day.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Explain what's wrong and why the requested values are correct."
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 px-3 py-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Submitting..." : "Submit Correction Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}
