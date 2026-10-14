"use client";

import { useEffect, useState } from "react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import {
    fetchAvailableStrategies,
    saveNewStrategy,
    updateStrategy,
} from "@/services/admin/salesSprintStrategyService";
import { SalesSprintStrategy } from "@/types/salesSprintStrategyTypes";

type Alert = { type: "success" | "error" | "info"; message: string };
type PhaseField = "sprintOnePercentage" | "sprintTwoPercentage" | "sprintThreePercentage" | "sprintFourPercentage";
type PhaseValues = Record<PhaseField, string>;

const PHASE_FIELDS: { key: PhaseField; label: string }[] = [
    { key: "sprintOnePercentage", label: "Phase 1" },
    { key: "sprintTwoPercentage", label: "Phase 2" },
    { key: "sprintThreePercentage", label: "Phase 3" },
    { key: "sprintFourPercentage", label: "Phase 4" },
];

const emptyPhaseValues: PhaseValues = {
    sprintOnePercentage: "",
    sprintTwoPercentage: "",
    sprintThreePercentage: "",
    sprintFourPercentage: "",
};

const emptyNewForm = { strategyName: "", ...emptyPhaseValues, active: true };

const toStrategyKey = (input: string) =>
    input.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const formatStrategyName = (name: string) =>
    name
        .split("_")
        .filter(Boolean)
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

const sumOf = (values: PhaseValues) =>
    PHASE_FIELDS.reduce((acc, field) => acc + (Number(values[field.key]) || 0), 0);

const percentagesValid = (values: PhaseValues) =>
    PHASE_FIELDS.every((field) => {
        const value = Number(values[field.key]);
        return values[field.key] !== "" && Number.isFinite(value) && value >= 0;
    });

export default function SalesPhaseStrategyPage() {
    const [strategies, setStrategies] = useState<SalesSprintStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState<Alert | null>(null);

    const [newForm, setNewForm] = useState(emptyNewForm);
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<(PhaseValues & { active: boolean }) | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadStrategies();
    }, []);

    const loadStrategies = async () => {
        setLoading(true);
        try {
            const data = await fetchAvailableStrategies();
            setStrategies(data);
        } catch (error) {
            console.error("❌ Error fetching sales phase strategies:", error);
            setAlert({ type: "error", message: "Failed to load strategies." });
        } finally {
            setLoading(false);
        }
    };

    const newFormSum = sumOf(newForm);
    const newFormSumValid = Math.abs(newFormSum - 100) < 0.01;
    const canCreate = newForm.strategyName.trim() !== "" && percentagesValid(newForm) && newFormSumValid;

    const handleNewFormChange = (field: PhaseField | "strategyName", value: string) => {
        setNewForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreate = async () => {
        if (!canCreate) { return; }

        setCreating(true);
        setAlert(null);
        try {
            const payload: SalesSprintStrategy = {
                strategyName: toStrategyKey(newForm.strategyName),
                sprintOnePercentage: Number(newForm.sprintOnePercentage),
                sprintTwoPercentage: Number(newForm.sprintTwoPercentage),
                sprintThreePercentage: Number(newForm.sprintThreePercentage),
                sprintFourPercentage: Number(newForm.sprintFourPercentage),
                active: newForm.active,
            };
            const saved = await saveNewStrategy(payload);
            setStrategies((prev) => [saved, ...prev]);
            setAlert({ type: "success", message: "✅ Strategy created successfully!" });
            setNewForm(emptyNewForm);
        } catch (error) {
            console.error("❌ Error saving sales phase strategy:", error);
            setAlert({ type: "error", message: "Failed to save strategy. Please try again." });
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (strategy: SalesSprintStrategy) => {
        if (!strategy.id) { return; }
        setEditingId(strategy.id);
        setEditForm({
            sprintOnePercentage: String(strategy.sprintOnePercentage),
            sprintTwoPercentage: String(strategy.sprintTwoPercentage),
            sprintThreePercentage: String(strategy.sprintThreePercentage),
            sprintFourPercentage: String(strategy.sprintFourPercentage),
            active: strategy.active ?? true,
        });
        setAlert(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const editFormSum = editForm ? sumOf(editForm) : 0;
    const editFormSumValid = Math.abs(editFormSum - 100) < 0.01;
    const canSaveEdit = !!editForm && percentagesValid(editForm) && editFormSumValid;

    const handleEditFormChange = (field: PhaseField, value: string) => {
        setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editForm || !canSaveEdit) { return; }

        setUpdating(true);
        setAlert(null);
        try {
            const payload = {
                sprintOnePercentage: Number(editForm.sprintOnePercentage),
                sprintTwoPercentage: Number(editForm.sprintTwoPercentage),
                sprintThreePercentage: Number(editForm.sprintThreePercentage),
                sprintFourPercentage: Number(editForm.sprintFourPercentage),
                active: editForm.active,
            };
            const updated = await updateStrategy(editingId, payload);
            setStrategies((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
            setAlert({ type: "success", message: "✅ Strategy updated successfully!" });
            cancelEdit();
        } catch (error) {
            console.error("❌ Error updating sales phase strategy:", error);
            setAlert({ type: "error", message: "Failed to update strategy. Please try again." });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">🏁 Sales Phase Strategy</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Define how a monthly goal splits across four phases. Percentages must add up to 100%.
            </p>

            {alert && (
                <div
                    className={`mt-4 rounded-md px-4 py-3 text-sm ${alert.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : alert.type === "error"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                >
                    {alert.message}
                </div>
            )}

            {/* Create new strategy */}
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Create New Strategy</h2>

                <InputField
                    label="Strategy Name"
                    type="text"
                    value={newForm.strategyName}
                    onChange={(e) => handleNewFormChange("strategyName", e.target.value)}
                    placeholder="e.g. Peak Performance"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PHASE_FIELDS.map((field) => (
                        <InputField
                            key={field.key}
                            label={field.label}
                            type="number"
                            min={0}
                            step="0.01"
                            value={newForm[field.key]}
                            onChange={(e) => handleNewFormChange(field.key, e.target.value)}
                            placeholder="0"
                        />
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-xs font-semibold ${newFormSumValid ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                        Total: {newFormSum.toFixed(2)}% {newFormSumValid ? "✓" : "(must equal 100%)"}
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={newForm.active}
                            onChange={(e) => setNewForm((prev) => ({ ...prev, active: e.target.checked }))}
                            className="rounded border-gray-300"
                        />
                        Active
                    </label>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleCreate} isLoading={creating} disabled={!canCreate} variant="primary">
                        Create Strategy
                    </Button>
                </div>
            </div>

            {/* Existing strategies */}
            <div className="mt-8">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">Existing Strategies</h2>

                {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading strategies...</p>
                ) : strategies.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No strategies created yet.</p>
                ) : (
                    <div className="space-y-3">
                        {strategies.map((strategy) => {
                            const isEditing = editingId === strategy.id;
                            return (
                                <div
                                    key={strategy.id}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatStrategyName(strategy.strategyName)}
                                            </p>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${(isEditing ? editForm?.active : strategy.active)
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                    }`}
                                            >
                                                {(isEditing ? editForm?.active : strategy.active) ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        {!isEditing && (
                                            <Button onClick={() => startEdit(strategy)} variant="secondary" className="px-3 py-1.5 text-xs">
                                                Edit
                                            </Button>
                                        )}
                                    </div>

                                    {isEditing && editForm ? (
                                        <div className="mt-3 space-y-3">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {PHASE_FIELDS.map((field) => (
                                                    <InputField
                                                        key={field.key}
                                                        label={field.label}
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={editForm[field.key]}
                                                        onChange={(e) => handleEditFormChange(field.key, e.target.value)}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <p className={`text-xs font-semibold ${editFormSumValid ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                                                    Total: {editFormSum.toFixed(2)}% {editFormSumValid ? "✓" : "(must equal 100%)"}
                                                </p>
                                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.active}
                                                        onChange={(e) => setEditForm((prev) => (prev ? { ...prev, active: e.target.checked } : prev))}
                                                        className="rounded border-gray-300"
                                                    />
                                                    Active
                                                </label>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button onClick={cancelEdit} variant="outline" className="px-3 py-1.5 text-xs">
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSaveEdit}
                                                    isLoading={updating}
                                                    disabled={!canSaveEdit}
                                                    variant="success"
                                                    className="px-3 py-1.5 text-xs"
                                                >
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {PHASE_FIELDS.map((field) => (
                                                <div
                                                    key={field.key}
                                                    className="rounded-md bg-gray-50 dark:bg-gray-800/60 px-2.5 py-2 text-center"
                                                >
                                                    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{field.label}</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {strategy[field.key]}%
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
