interface StoreListProps {
    selectedStores: string[];
}

export default function StoreList({ selectedStores }: StoreListProps) {
    return (
        <ul className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {selectedStores.map((store, index) => (
                <li key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1">
                    {store}
                </li>
            ))}
        </ul>
    );
}