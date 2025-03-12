import { useState } from "react";
import { StoreMinQuantitySetup, ProductMinQuantity } from "@/types/minQuantityTypes";
interface MinQuantityRowProps {
    product: ProductMinQuantity;
    stores: StoreMinQuantitySetup[];
    storeQuantities: { [storeId: string]: { [productId: number]: number } }; // ✅ Add storeQuantities as a prop
    onQuantityChange: (storeId: string, productId: number, value: number) => void;
}

export default function MinQuantityRow({ product, stores, storeQuantities, onQuantityChange }: MinQuantityRowProps) {
    return (
        <tr className="border-t border-gray-300 dark:border-gray-700">
            <td className="p-3 border border-gray-300 dark:border-gray-600">{product.productName}</td>
            {stores.map((store) => (
                <td
                    key={`${store.store.dealerStoreId}-${product.id}`}
                    className="p-3 text-center border border-gray-300 dark:border-gray-600"
                >
                    <input
                        type="number"
                        className="w-16 p-2 text-center border rounded-md bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        value={storeQuantities[store.store.dealerStoreId]?.[product.id] ?? 0} // ✅ Now receives value from prop
                        onChange={(e) =>
                            onQuantityChange(store.store.dealerStoreId, product.id, Number(e.target.value))
                        }
                    />
                </td>
            ))}
        </tr>
    );
}
