import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { InventoryFormValues, inventorySchema } from "@/schemas/InventoryFormSchema";

interface InventoryTableProps {
    inventory: InventoryFormValues["products"];
    dealerStoreId: string;
    onSubmit: (updatedProducts: InventoryFormValues["products"]) => void;
}

export default function InventoryTable({ inventory, dealerStoreId, onSubmit }: InventoryTableProps) {
    const [isEditing, setIsEditing] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<InventoryFormValues>({
        resolver: zodResolver(inventorySchema),
        defaultValues: { dealerStoreId, products: inventory },
        mode: "onChange",
        reValidateMode: "onBlur",
    });

    // ✅ Sync form values with inventory on mount
    useEffect(() => {
        reset({ dealerStoreId, products: inventory });
    }, [inventory, dealerStoreId, reset]);

    // ✅ Capture updated values
    const updatedProducts = watch("products");

    // ✅ Toggle Edit Mode
    const handleEdit = () => setIsEditing(true);

    // ✅ Handle Save: Send updated products to API
    const handleSave = (data: InventoryFormValues) => {
        onSubmit(data.products);
        setIsEditing(false);
    };

    return (
        <section className="w-full">
            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm md:text-base">
                    {/* ✅ Table Head */}
                    <thead className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300 uppercase text-left">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3 text-center">Quantity</th>
                        </tr>
                    </thead>

                    {/* ✅ Table Body */}
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {inventory.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <td className="px-4 py-3">{item.productName}</td>
                                <td className="px-4 py-3 text-center">
                                    <Controller
                                        name={`products.${index}.quantity`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                className={`w-24 p-2 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 
                                            ${errors.products?.[index]?.quantity ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400"}`}
                                                value={field.value ?? 0}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={!isEditing}
                                            />
                                        )}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ Edit & Save Buttons */}
            <div className="flex justify-center mt-6">
                <button
                    type="button"
                    onClick={isEditing ? handleSubmit(handleSave) : handleEdit}
                    className={`px-5 py-2.5 rounded-md font-semibold shadow transition-all duration-300 
            ${isEditing ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                >
                    {isEditing ? "💾 Save Changes" : "✏️ Edit Inventory"}
                </button>
            </div>


        </section>

    );
}
