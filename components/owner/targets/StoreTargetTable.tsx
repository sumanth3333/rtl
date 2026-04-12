import { useEffect, useState } from "react";
import { StoreTarget } from "@/types/targetTypes";

interface StoreTargetTableProps {
    targets: { target: StoreTarget | null; store: { dealerStoreId: string; storeName: string } }[];
    month: string;
    onSave: (storeId: string, target: StoreTarget) => Promise<void>;
}

const buildDefaultTarget = (month: string): StoreTarget => ({
    activationTargetToStore: 0,
    upgradeTargetToStore: 0,
    accessoriesTargetToStore: 0,
    hsiTargetToStore: 0,
    tabletsTargetToStore: 0,
    smartwatchTragetToStore: 0,
    migrationTargetToStore: 0,
    targetMonth: month,
});

export default function StoreTargetTable({ targets, month, onSave }: StoreTargetTableProps) {
    const [drafts, setDrafts] = useState<Record<string, StoreTarget>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        const next: Record<string, StoreTarget> = {};
        targets.forEach(({ store, target }) => {
            next[store.dealerStoreId] = target ?? buildDefaultTarget(month);
        });
        setDrafts(next);
    }, [targets, month]);

    const updateField = (storeId: string, field: keyof StoreTarget, value: number) => {
        setDrafts((prev) => ({
            ...prev,
            [storeId]: {
                ...(prev[storeId] ?? buildDefaultTarget(month)),
                targetMonth: month,
                [field]: Number.isNaN(value) ? 0 : value,
            },
        }));
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Store Targets</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="p-3 text-left">Store</th>
                            <th className="p-3 text-right">Activations</th>
                            <th className="p-3 text-right">Upgrades</th>
                            <th className="p-3 text-right">Migrations</th>
                            <th className="p-3 text-right">Accessories</th>
                            <th className="p-3 text-right">HSI</th>
                            <th className="p-3 text-right">Tablets</th>
                            <th className="p-3 text-right">Watches</th>
                            <th className="p-3 text-center">Save</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map(({ store }) => {
                            const draft = drafts[store.dealerStoreId] ?? buildDefaultTarget(month);
                            return (
                                <tr key={store.dealerStoreId} className="border-t">
                                    <td className="p-3">
                                        <div className="font-semibold">{store.storeName}</div>
                                        <div className="text-xs text-gray-500">{store.dealerStoreId}</div>
                                    </td>
                                    <td className="p-2 text-right"><input type="number" value={draft.activationTargetToStore} onChange={(e) => updateField(store.dealerStoreId, "activationTargetToStore", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.upgradeTargetToStore} onChange={(e) => updateField(store.dealerStoreId, "upgradeTargetToStore", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.migrationTargetToStore} onChange={(e) => updateField(store.dealerStoreId, "migrationTargetToStore", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" step="0.01" value={draft.accessoriesTargetToStore} onChange={(e) => updateField(store.dealerStoreId, "accessoriesTargetToStore", Number(e.target.value))} className="w-28 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.hsiTargetToStore} onChange={(e) => updateField(store.dealerStoreId, "hsiTargetToStore", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.tabletsTargetToStore} onChange={(e) => updateField(store.dealerStoreId, "tabletsTargetToStore", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-2 text-right"><input type="number" value={draft.smartwatchTragetToStore} onChange={(e) => updateField(store.dealerStoreId, "smartwatchTragetToStore", Number(e.target.value))} className="w-24 rounded border px-2 py-1 dark:bg-gray-800" /></td>
                                    <td className="p-3 text-center">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setSavingId(store.dealerStoreId);
                                                try {
                                                    await onSave(store.dealerStoreId, { ...draft, targetMonth: month });
                                                } finally {
                                                    setSavingId(null);
                                                }
                                            }}
                                            disabled={savingId !== null}
                                            className="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700 disabled:opacity-60"
                                        >
                                            {savingId === store.dealerStoreId ? "Saving..." : "Save"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
