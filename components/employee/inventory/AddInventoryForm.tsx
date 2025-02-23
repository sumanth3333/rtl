"use client"

import { useState } from "react";
interface AddInventoryFormProps {
    addInventory: (item: { name: string; brand: string; category: "Phones" | "Accessories"; stock: number; price: number }) => void;
}

export default function AddInventoryForm({ addInventory }: AddInventoryFormProps) {
    const [form, setForm] = useState({
        name: "",
        brand: "",
        category: "Phones" as "Phones" | "Accessories", // ✅ Defaulted to a valid type
        stock: 0,
        price: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "category" ? (value as "Phones" | "Accessories") : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addInventory(form);
        setForm({ name: "", brand: "", category: "Phones", stock: 0, price: 0 });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border rounded-lg bg-gray-100 dark:bg-gray-800 shadow-md">
            <div className="flex flex-wrap gap-4">
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Product Name"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white" required />

                <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white" required />
            </div>

            <div className="flex flex-wrap gap-4">
                <select name="category" value={form.category} onChange={handleChange}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white" required>
                    <option value="Phones">Phones</option>
                    <option value="Accessories">Accessories</option>
                </select>

                <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="Stock"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white" required />

                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white" required />
            </div>

            <button type="submit"
                className="mt-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition">
                ➕ Add Inventory
            </button>
        </form>
    );
}
