"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import {
    getDealerInventoryCommission,
    saveDealerInventoryCommission,
    updateDealerInventoryCommission,
} from "@/services/owner/dealerInventoryCommissionService";
import { DealerInventoryCommissionValues } from "@/types/dealerInventoryCommission";

const EMPTY_VALUES: DealerInventoryCommissionValues = {
    perBoxCommission: 0,
    perReactivation: 0,
    perByod: 0,
};

type FieldKey = keyof DealerInventoryCommissionValues;

export default function DealerInventoryCommissionForm() {
    const { companyName } = useOwner();
    const [values, setValues] = useState<DealerInventoryCommissionValues>(EMPTY_VALUES);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasExistingConfig, setHasExistingConfig] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) { return; }

        const load = async () => {
            setLoading(true);
            setError(null);
            setMessage(null);
            try {
                const data = await getDealerInventoryCommission(companyName);
                setValues({
                    perBoxCommission: Number(data?.perBoxCommission ?? 0),
                    perReactivation: Number(data?.perReactivation ?? 0),
                    perByod: Number(data?.perByod ?? 0),
                });
                setHasExistingConfig(true);
            } catch (err: any) {
                const message = String(err?.message || "").toLowerCase();
                const isNotFound = err?.status === 404 || message.includes("not found");
                if (isNotFound) {
                    setValues(EMPTY_VALUES);
                    setHasExistingConfig(false);
                    return;
                }
                setError(err?.message || "Failed to load inventory commission settings.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [companyName]);

    const onChange = (key: FieldKey, raw: string) => {
        const parsed = Number(raw);
        setValues((prev) => ({
            ...prev,
            [key]: Number.isFinite(parsed) ? parsed : 0,
        }));
    };

    const canSubmit = useMemo(
        () => companyName && !saving && values.perBoxCommission >= 0 && values.perReactivation >= 0 && values.perByod >= 0,
        [companyName, saving, values]
    );

    const onSubmit = async () => {
        if (!companyName || !canSubmit) { return; }
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            if (hasExistingConfig) {
                await updateDealerInventoryCommission({ companyName, ...values });
                setMessage("Inventory commission updated.");
            } else {
                await saveDealerInventoryCommission({ companyName, ...values });
                setMessage("Inventory commission saved.");
                setHasExistingConfig(true);
            }
        } catch (err: any) {
            setError(err?.message || "Failed to save inventory commission settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 p-4">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                    Set fixed dealer per box commission values. Current company:{" "}
                    <span className="font-semibold">{companyName || "N/A"}</span>
                </p>
            </div>

            {loading && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                    Loading commission settings...
                </div>
            )}

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200 px-3 py-2 text-sm">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 px-3 py-2 text-sm">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Per Box Commission</span>
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={values.perBoxCommission}
                        onChange={(e) => onChange("perBoxCommission", e.target.value)}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                </label>
                <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Per Reactivation</span>
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={values.perReactivation}
                        onChange={(e) => onChange("perReactivation", e.target.value)}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                </label>
                <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Per BYOD</span>
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={values.perByod}
                        onChange={(e) => onChange("perByod", e.target.value)}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                    />
                </label>
            </div>

            <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="w-full md:w-auto rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {saving ? "Saving..." : hasExistingConfig ? "Update Commission" : "Save Commission"}
            </button>
        </div>
    );
}
