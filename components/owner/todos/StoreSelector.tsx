import { Store } from "@/types/todosTypes";

interface StoreSelectorProps {
    stores: Store[];
    selectedStores: string[];
    setSelectedStores: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StoreSelector({ stores, selectedStores, setSelectedStores }: StoreSelectorProps) {
    const toggleStoreSelection = (storeId: string) => {
        setSelectedStores((prev) => {
            if (!Array.isArray(prev)) { return [storeId] }; // Ensuring prev is an array
            return prev.includes(storeId)
                ? prev.filter((id) => id !== storeId)
                : [...prev, storeId];
        });
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Select Stores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {stores.map((store) => (
                    <label key={store.dealerStoreId} className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedStores.includes(store.dealerStoreId)}
                            onChange={() => toggleStoreSelection(store.dealerStoreId)}
                            className="w-4 h-4"
                        />
                        <span className="text-gray-800 dark:text-gray-100">{store.storeName}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}