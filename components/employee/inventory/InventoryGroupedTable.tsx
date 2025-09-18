"use client";

import {
    Controller,
    type FieldErrors,
    type Control,
    type UseFormGetValues,
    type UseFormSetValue,
} from "react-hook-form";
import type { InventoryFormValues } from "@/schemas/InventoryFormSchema";
import { InventoryGrouped } from "@/services/inventory/inventoryService";

interface Props {
    groupedInventory: InventoryGrouped[];
    control: Control<InventoryFormValues>;
    errors: FieldErrors<InventoryFormValues>;
    idToIndex: Map<number, number>;
    getValues: UseFormGetValues<InventoryFormValues>;
    setValue: UseFormSetValue<InventoryFormValues>;
    onQuantityChange: (id: number, qty: number, regroup?: boolean) => void;
}

export default function InventoryGroupedTable({
    groupedInventory,
    control,
    errors,
    idToIndex,
    getValues,
    setValue,
    onQuantityChange,
}: Props) {
    const ensureIndex = (id: number, productName: string, quantity: number) => {
        const nId = Number(id);
        let idx = idToIndex.get(nId);
        if (idx === undefined) {
            const current = getValues("products") ?? [];
            idx = current.length;
            setValue(
                `products.${idx}`,
                { id: nId, productName, quantity: quantity ?? 0 },
                { shouldDirty: false, shouldValidate: false }
            );
        }
        return idx;
    };

    const GridRow = (
        item: { id: number; productName: string; quantity: number },
        variant: "in" | "out"
    ) => {
        const idx = ensureIndex(Number(item.id), item.productName, item.quantity ?? 0);
        const hasError = !!errors.products?.[idx]?.quantity;

        const badge =
            variant === "in"
                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20";

        return (
            <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
                {/* Product Name */}
                <div className="min-w-0 flex items-center gap-2">
                    <span
                        className={`whitespace-normal break-words ${variant === "out" ? "text-gray-700 dark:text-gray-300" : "font-medium"
                            }`}
                    >
                        {item.productName}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badge}`}>
                        {variant === "in" ? "In" : "Out"}
                    </span>
                </div>

                {/* Editable Quantity */}
                <Controller
                    name={`products.${idx}.quantity`}
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            min={0}
                            className={`w-20 h-10 sm:h-11 text-center rounded-md border shadow-sm transition
                ${hasError
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-300 dark:focus:ring-blue-600"
                                }
                bg-gray-50 dark:bg-gray-800 dark:text-white`}
                            value={Number.isFinite(field.value as number) ? field.value : 0}
                            onChange={(e) => {
                                const v = Number(e.target.value);
                                field.onChange(v);
                                onQuantityChange(Number(item.id), v, false); // ✅ update but don't regroup
                            }}
                            onBlur={() => onQuantityChange(Number(item.id), Number(field.value), true)} // ✅ regroup after leaving input
                            aria-label={`${item.productName} quantity`}
                        />
                    )}
                />
                {hasError && (
                    <div className="col-span-2 text-right">
                        <p className="text-xs text-red-500">
                            {errors.products?.[idx]?.quantity?.message as string}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="
        grid gap-5 
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]
      "
        >
            {groupedInventory.map((group) => (
                <div
                    key={group.brand}
                    className="rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm overflow-hidden bg-white/60 dark:bg-gray-900/50 backdrop-blur"
                >
                    <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 font-semibold text-lg">
                        {group.brand}
                    </div>

                    {group.inStock.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="mb-2 text-xs font-semibold text-green-700 dark:text-green-400">
                                In Stock
                            </div>
                            <div className="flex flex-col gap-2">
                                {group.inStock.map((item) =>
                                    GridRow(
                                        { ...item, id: Number(item.id), quantity: item.quantity ?? 0 },
                                        "in"
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {group.outofStock.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="mb-2 text-xs font-semibold text-red-700 dark:text-red-400">
                                Out of Stock
                            </div>
                            <div className="flex flex-col gap-2">
                                {group.outofStock.map((item) =>
                                    GridRow(
                                        { ...item, id: Number(item.id), quantity: item.quantity ?? 0 },
                                        "out"
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
