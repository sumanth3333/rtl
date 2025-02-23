import { useState } from "react";
import Table from "./table/Table";
import Button from "./Button";

interface ManagePageProps<T extends Record<string, any>> {
    title: string;
    data: T[];
    columns: { key: keyof T; label: string }[];
    onAdd: () => void;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void | Promise<void>;
    addForm?: React.ReactNode;
    isLoading?: boolean;
    managers?: { id: string; name: string }[];
}

export default function ManagePage<T extends Record<string, any>>({
    title,
    data,
    columns,
    onAdd,
    onEdit,
    onDelete,
    addForm,
    isLoading = false,
    managers = [],
}: ManagePageProps<T>) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
            {/* 🔹 Page Title */}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-300 dark:border-gray-600">
                {title}
            </h1>

            {/* 🔹 Loading / Empty State / Table */}
            {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading...</p>
            ) : data.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No records available.</p>
            ) : (
                <Table
                    data={data}
                    columns={columns}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    managers={managers}
                />
            )}

            {/* 🔹 Add Button */}
            <div className="mt-8 flex justify-start">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg 
                               hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                >
                    {showForm ? "Cancel" : `Add ${title.split(" ")[1]}`}
                </Button>
            </div>

            {/* 🔹 Add Form */}
            {showForm && <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">{addForm}</div>}
        </div>
    );
}
