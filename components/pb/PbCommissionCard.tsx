"use client";

import { useEffect, useMemo, useState } from "react";
import type { PbCommission } from "@/types/pb";
import { pbService } from "@/services/pbService";
import { safeNum } from "@/lib/pbFormat";
import { CommissionPreview, FieldRow } from "@/components/pb/PbInputs";

export default function PbCommissionCard({
    companyName,
    onSaved,
}: {
    companyName: string;
    onSaved?: () => void;
}) {
    const [commission, setCommission] = useState<PbCommission | null>(null);
    const [draft, setDraft] = useState<PbCommission>({
        minimumPerformanceBonusWithoutRetention: 0,
        maximumPerformanceBonusWithoutRetention: 0,
        minimumPerformanceBonusWithRetention: 0,
        maximumPerformanceBonusWithRetention: 0,
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        setMsg(null);
        try {
            const res = await pbService.viewCommission(companyName);
            setCommission(res.data);
            setDraft(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to load commission settings.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName]);

    const validation = useMemo(() => {
        const minNo = safeNum(draft.minimumPerformanceBonusWithoutRetention);
        const maxNo = safeNum(draft.maximumPerformanceBonusWithoutRetention);
        const minWith = safeNum(draft.minimumPerformanceBonusWithRetention);
        const maxWith = safeNum(draft.maximumPerformanceBonusWithRetention);

        if ([minNo, maxNo, minWith, maxWith].some((n) => n < 0)) { return "Values cannot be negative."; }
        if (minNo > maxNo) { return "Minimum (Without Retention) cannot be greater than Maximum."; }
        if (minWith > maxWith) { return "Minimum (With Retention) cannot be greater than Maximum."; }
        return null;
    }, [draft]);

    async function save() {
        if (validation) {
            setError(validation);
            return;
        }
        setSaving(true);
        setError(null);
        setMsg(null);

        try {
            await pbService.setPbCommission({ ...draft, companyName });
            setMsg("Performance bonus commission saved.");
            await load();
            onSaved?.();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to save PB commission.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section
            className="
        rounded-2xl border border-gray-200/70 dark:border-gray-800/70
        bg-white/80 dark:bg-gray-950/40 backdrop-blur-xl
        shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]
      "
        >
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">PB Commission Settings</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Define min/max bonuses for scenarios with and without retention.
                        </p>
                    </div>

                    <button
                        onClick={save}
                        disabled={saving || loading}
                        className="
              inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
              text-white bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              disabled:opacity-60 disabled:cursor-not-allowed
              shadow-md shadow-blue-600/20
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950
            "
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                        {error}
                    </div>
                )}
                {msg && (
                    <div className="mt-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
                        {msg}
                    </div>
                )}

                <div className="mt-5 space-y-4">
                    <FieldRow
                        title="Without Retention"
                        leftValue={draft.minimumPerformanceBonusWithoutRetention}
                        rightValue={draft.maximumPerformanceBonusWithoutRetention}
                        onLeftChange={(v) => setDraft((d) => ({ ...d, minimumPerformanceBonusWithoutRetention: safeNum(v) }))}
                        onRightChange={(v) => setDraft((d) => ({ ...d, maximumPerformanceBonusWithoutRetention: safeNum(v) }))}
                    />

                    <FieldRow
                        title="With Retention"
                        leftValue={draft.minimumPerformanceBonusWithRetention}
                        rightValue={draft.maximumPerformanceBonusWithRetention}
                        onLeftChange={(v) => setDraft((d) => ({ ...d, minimumPerformanceBonusWithRetention: safeNum(v) }))}
                        onRightChange={(v) => setDraft((d) => ({ ...d, maximumPerformanceBonusWithRetention: safeNum(v) }))}
                    />

                    <CommissionPreview commission={commission} />

                    {loading && <div className="text-sm text-gray-600 dark:text-gray-400">Loading commission settings...</div>}
                </div>
            </div>
        </section>
    );
}
