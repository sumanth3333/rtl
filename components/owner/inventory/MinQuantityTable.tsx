import { StoreMinQuantitySetup } from "@/types/minQuantityTypes";
import MinQuantityRow from "./MinQuantityRow";

interface MinQuantityTableProps {
    stores: StoreMinQuantitySetup[];
    storeQuantities: { [storeId: string]: { [productId: number]: number } };
    onQuantityChange: (storeId: string, productId: number, value: number) => void;
    onSave: (storeId: string) => void;
}

export default function MinQuantityTable({ stores, storeQuantities, onQuantityChange, onSave }: MinQuantityTableProps) {
    return (
        <div className="relative w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                    <tr>
                        <th className="p-3 text-left border border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-100 dark:bg-gray-700 z-20">
                            Product Name
                        </th>
                        {stores.map((store) => (
                            <th key={store.store.dealerStoreId} className="p-3 text-center border border-gray-300 dark:border-gray-600">
                                {store.store.storeName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {stores[0]?.products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-300 dark:border-gray-700">
                            <td className="p-3 border border-gray-300 dark:border-gray-600 sticky left-0 bg-white dark:bg-gray-800 font-semibold z-10">
                                {product.productName}
                            </td>
                            {stores.map((store) => (
                                <td
                                    key={`${store.store.dealerStoreId}-${product.id}`}
                                    className="p-3 text-center border border-gray-300 dark:border-gray-600"
                                >
                                    <input
                                        type="number"
                                        className="w-16 p-2 text-center border rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        value={storeQuantities[store.store.dealerStoreId]?.[product.id] ?? 0}
                                        onChange={(e) =>
                                            onQuantityChange(store.store.dealerStoreId, product.id, Number(e.target.value))
                                        }
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td className="p-3 border border-gray-300 dark:border-gray-700 text-right font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                            Save Changes
                        </td>
                        {stores.map((store) => (
                            <td key={store.store.dealerStoreId} className="p-3 text-center border border-gray-300 dark:border-gray-700">
                                <button
                                    onClick={() => onSave(store.store.dealerStoreId)}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save {store.store.storeName}
                                </button>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
