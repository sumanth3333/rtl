import { Store } from "@/types/reorderSummaryTypes";

interface StoreSelectorProps {
    stores: Store[];
    selectedStores: string[];
    setSelectedStores: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StoreSelector({ stores, selectedStores, setSelectedStores }: StoreSelectorProps) {
    const toggleStoreSelection = (storeId: string) => {
        setSelectedStores((prev) =>
            prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
        );
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Select Store(s)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stores.map((store) => (
                    <label key={store.dealerStoreId} className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedStores.includes(store.dealerStoreId)}
                            onChange={() => toggleStoreSelection(store.dealerStoreId)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-800 dark:text-gray-100">{store.storeName}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
