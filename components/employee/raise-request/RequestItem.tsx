interface RequestItemProps {
    index: number;
    item: { itemDescription: string; priority: string };
    updateRequestItem: (index: number, field: "itemDescription" | "priority", value: string) => void;
    removeRequestItem: (index: number) => void;
}

export default function RequestItem({ index, item, updateRequestItem, removeRequestItem }: RequestItemProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 bg-white dark:bg-gray-900 p-4 rounded-md shadow">
            {/* Item Description */}
            <input
                type="text"
                placeholder="Enter request item..."
                value={item.itemDescription}
                onChange={(e) => updateRequestItem(index, "itemDescription", e.target.value)}
                className="flex-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
            />

            {/* Priority Selection */}
            <select
                value={item.priority}
                onChange={(e) => updateRequestItem(index, "priority", e.target.value)}
                className="p-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white"
            >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
            </select>

            {/* Remove Button */}
            <button onClick={() => removeRequestItem(index)} className="text-red-600 hover:text-red-800">
                ❌ Remove
            </button>
        </div>
    );
}
