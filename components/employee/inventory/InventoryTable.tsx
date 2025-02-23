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
    }, [inventory, reset]);

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
        <section className="w-full max-w-6xl mx-auto">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm md:text-base">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-300">
                            <th className="p-3 text-left">Product</th>
                            <th className="p-3 text-center">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <td className="p-3">{item.productName}</td>
                                <td className="p-3 text-center">
                                    <Controller
                                        name={`products.${index}.quantity`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                value={field.value ?? 0}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={!isEditing}
                                                className={`w-20 p-2 text-center border rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 
                                                    ${errors.products?.[index]?.quantity ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-400"}`}
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
            <div className="mt-6 flex justify-start gap-4">
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="bg-yellow-500 text-white px-5 py-2.5 rounded-md hover:bg-yellow-600 transition"
                    >
                        ✏️ Edit
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit(handleSave)}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-md hover:bg-green-700 transition"
                    >
                        💾 Save
                    </button>
                )}
            </div>
        </section>
    );
}
