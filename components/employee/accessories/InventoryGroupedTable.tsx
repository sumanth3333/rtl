"use client";

import {
    Controller,
    type FieldErrors,
    type Control,
    type UseFormGetValues,
    type UseFormSetValue,
} from "react-hook-form";
import { InventoryGrouped } from "@/services/accessories/accessoriesService";
import { AccessoryFormValues } from "@/schemas/accessoryFormSchema";

interface Props {
    groupedInventory: InventoryGrouped[];
    control: Control<AccessoryFormValues>;
    errors: FieldErrors<AccessoryFormValues>;
    idToIndex: Map<number, number>;
    getValues: UseFormGetValues<AccessoryFormValues>;
    setValue: UseFormSetValue<AccessoryFormValues>;
    onCaseQuantityChange: (id: number, qty: number, regroup?: boolean) => void;
    onGlassQuantityChange: (id: number, qty: number, regroup?: boolean) => void;
}

export default function InventoryGroupedTable({
    groupedInventory,
    control,
    errors,
    idToIndex,
    getValues,
    setValue,
    onCaseQuantityChange,
    onGlassQuantityChange,
}: Props) {
    const ensureIndex = (id: number, productName: string, caseQuantity: number, glassQuantity: number) => {
        const nId = Number(id);
        let idx = idToIndex.get(nId);
        if (idx === undefined) {
            const current = getValues("products") ?? [];
            idx = current.length;
            setValue(
                `products.${idx}`,
                { id: nId, productName, caseQuantity: caseQuantity ?? 0, glassQuantity: glassQuantity ?? 0 },
                { shouldDirty: false, shouldValidate: false }
            );
        }
        return idx;
    };

    const GridRow = (
        item: { id: number; productName: string; caseQuantity: number, glassQuantity: number },
        variant: "in" | "out"
    ) => {
        const idx = ensureIndex(Number(item.id), item.productName, item.caseQuantity ?? 0, item.glassQuantity ?? 0);
        const hasError = !!errors.products?.[idx]?.caseQuantity || !!errors.products?.[idx]?.glassQuantity;

        const badge =
            variant === "in"
                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20";

        return (
            <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg px-3 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
                {/* Product Name + Badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={`whitespace-normal break-words ${variant === "out"
                            ? "text-gray-700 dark:text-gray-300"
                            : "font-medium"
                            }`}
                    >
                        {item.productName}
                    </span>
                    <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badge}`}
                    >
                        {variant === "in" ? "In" : "Out"}
                    </span>
                </div>

                {/* 🟦 Case Quantity */}
                <div className="flex flex-col items-center">
                    <label
                        htmlFor={`caseQuantity-${idx}`}
                        className="text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >
                        Case Qty
                    </label>
                    <Controller
                        name={`products.${idx}.caseQuantity`}
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                id={`caseQuantity-${idx}`}
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
                                    onCaseQuantityChange(Number(item.id), v, false);
                                }}
                                onBlur={() =>
                                    onCaseQuantityChange(Number(item.id), Number(field.value), true)
                                }
                                aria-label={`${item.productName} case quantity`}
                            />
                        )}
                    />
                    {hasError && (
                        <p className="text-[10px] text-red-500 mt-1">
                            {errors.products?.[idx]?.caseQuantity?.message as string}
                        </p>
                    )}
                </div>

                {/* 🟩 Glass Quantity */}
                <div className="flex flex-col items-center">
                    <label
                        htmlFor={`glassQuantity-${idx}`}
                        className="text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >
                        Glass Qty
                    </label>
                    <Controller
                        name={`products.${idx}.glassQuantity`}
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                id={`glassQuantity-${idx}`}
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
                                    onGlassQuantityChange(Number(item.id), v, false);
                                }}
                                onBlur={() =>
                                    onGlassQuantityChange(Number(item.id), Number(field.value), true)
                                }
                                aria-label={`${item.productName} glass quantity`}
                            />
                        )}
                    />
                    {hasError && (
                        <p className="text-[10px] text-red-500 mt-1">
                            {errors.products?.[idx]?.glassQuantity?.message as string}
                        </p>
                    )}
                </div>
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
                                        { ...item, id: Number(item.id), caseQuantity: item.caseQuantity ?? 0, glassQuantity: item.glassQuantity ?? 0 },
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
                                        { ...item, id: Number(item.id), caseQuantity: item.caseQuantity ?? 0, glassQuantity: item.glassQuantity ?? 0 },
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
