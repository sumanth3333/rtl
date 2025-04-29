import { StoreTarget } from "@/types/targetTypes";
import { PencilSquareIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

interface StoreTargetTableProps {
    targets: { target: StoreTarget | null; store: { dealerStoreId: string; storeName: string } }[];
    month: string;
    onEdit: (target: StoreTarget | null, storeId: string) => void;
}

export default function StoreTargetTable({ targets, month, onEdit }: StoreTargetTableProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Store Targets</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-700 text-white">
                        <tr>
                            <th className="p-3 text-left">Store</th>
                            <th className="p-3 text-right">Activations</th>
                            <th className="p-3 text-right">Upgrades</th>
                            <th className="p-3 text-right">Accessories</th>
                            <th className="p-3 text-right">HSI</th>
                            <th className="p-3 text-right">Tablets</th>
                            <th className="p-3 text-right">Watches</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map(({ target, store }) => {
                            // ✅ Ensure we always pass a valid `StoreTarget`
                            const validTarget: StoreTarget = target ?? {
                                activationTargetToStore: 0,
                                upgradeTargetToStore: 0,
                                accessoriesTargetToStore: 0.0,
                                hsiTargetToStore: 0,
                                tabletsTargetToStore: 0,
                                smartwatchTragetToStore: 0,
                                targetMonth: month, // Format: YYYY-MM
                            };

                            return (
                                <tr key={store.dealerStoreId} className="border-t">
                                    <td className="p-3">{store.storeName}</td>
                                    {target ? (
                                        <>
                                            <td className="p-3 text-right">{target.activationTargetToStore}</td>
                                            <td className="p-3 text-right">{target.upgradeTargetToStore}</td>
                                            <td className="p-3 text-right">${target.accessoriesTargetToStore.toFixed(2)}</td>
                                            <td className="p-3 text-right">{target.hsiTargetToStore}</td>
                                            <td className="p-3 text-right">{target.tabletsTargetToStore}</td>
                                            <td className="p-3 text-right">{target.smartwatchTragetToStore}</td>
                                        </>
                                    ) : (
                                        <td colSpan={5} className="p-3 text-center text-gray-500 italic">
                                            No target set
                                        </td>
                                    )}
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => onEdit(validTarget, store.dealerStoreId)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            {target ? (
                                                <PencilSquareIcon className="w-5 h-5 inline-block" />
                                            ) : (
                                                <PlusCircleIcon className="w-5 h-5 inline-block text-green-500" />
                                            )}
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