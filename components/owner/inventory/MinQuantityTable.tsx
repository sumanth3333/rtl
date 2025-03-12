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
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                        <th className="p-3 text-left border border-gray-300 dark:border-gray-600">
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
                    {stores[0].products.map((product) => (
                        <MinQuantityRow
                            key={product.id}
                            product={product}
                            stores={stores}
                            storeQuantities={storeQuantities}
                            onQuantityChange={onQuantityChange}
                        />
                    ))}

                    <tr>
                        <td className="p-3 border border-gray-300 dark:border-gray-700 text-right font-semibold">
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
