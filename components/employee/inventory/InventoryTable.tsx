import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
    InventoryFormValues,
    inventorySchema,
} from "@/schemas/InventoryFormSchema";

interface InventoryTableProps {
    inventory: InventoryFormValues["products"];
    dealerStoreId: string;
    onSubmit: (updatedProducts: InventoryFormValues["products"]) => void;
}

export default function InventoryTable({
    inventory,
    dealerStoreId,
    onSubmit,
}: InventoryTableProps) {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm<InventoryFormValues>({
        resolver: zodResolver(inventorySchema),
        defaultValues: { dealerStoreId, products: inventory },
        mode: "onChange",
    });

    useEffect(() => {
        reset({ dealerStoreId, products: inventory });
    }, [inventory, dealerStoreId, reset]);

    const updatedProducts = watch("products");

    return (
        <section className="w-full px-2 sm:px-4 md:px-6">
            {/* ✅ Save Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                <p className="text-sm md:text-base font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500 dark:text-sky-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.75a.75.75 0 00-1.5 0V10a.75.75 0 00.75.75h3a.75.75 0 000-1.5h-2.25V5.25z" clipRule="evenodd" />
                    </svg>
                    Please update your inventory and hit<span className="text-green-700 dark:text-green-400">Save Changes</span>
                </p>

                <button
                    type="button"
                    onClick={handleSubmit((data) => onSubmit(data.products))}
                    className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-semibold rounded-lg shadow-md transition"
                >
                    Save Changes
                </button>
            </div>


            {/* ✅ Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm">
                <table className="min-w-full table-auto border-collapse text-sm md:text-base">
                    <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                        <tr>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold">
                                Product Name
                            </th>
                            <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold">
                                Quantity
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {inventory.map((item, index) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">
                                    {item.productName}
                                </td>
                                <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                    <Controller
                                        name={`products.${index}.quantity`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                min={0}
                                                className={`w-24 h-10 md:h-11 px-3 py-1.5 text-center text-sm md:text-base rounded-md shadow-sm border transition-all
                    ${errors.products?.[index]?.quantity
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-300 dark:focus:ring-blue-600"
                                                    }
                    bg-gray-50 dark:bg-gray-800 dark:text-white`}
                                                value={field.value ?? 0}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        )}
                                    />
                                    {errors.products?.[index]?.quantity && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.products[index]?.quantity?.message}
                                        </p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

    );
}
