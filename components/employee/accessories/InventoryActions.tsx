interface InventoryActionsProps {
    setIsEditing: (editing: boolean) => void;
    isEditing: boolean;
    handleSave: (editedStock: { [id: number]: number }) => void;
}

export default function InventoryActions({ setIsEditing, isEditing, handleSave }: InventoryActionsProps) {
    return (
        <div className="mt-6 flex justify-center gap-4">
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition">
                    ✏️ Edit
                </button>
            ) : (
                <button onClick={() => handleSave({})} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                    💾 Save
                </button>
            )}
        </div>
    );
}
