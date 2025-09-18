"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { fetchInventory, updateInventory } from "@/services/inventory/inventoryService";
import type {
    InventoryGrouped,
    InventoryItem,
    StoreInventoryResponse,
} from "@/services/inventory/inventoryService";
import { inventorySchema, type InventoryFormValues } from "@/schemas/InventoryFormSchema";

import { useEmployee } from "@/hooks/useEmployee";
import { fetchCompanyNameByNtid } from "@/services/employee/employeeService";
import { useFetchCurrentInventory } from "@/hooks/useFetchCurrentInventory";

import InventorySearch from "@/components/employee/inventory/InventorySearch";
import InventoryGroupedTable from "@/components/employee/inventory/InventoryGroupedTable";

export default function InventoryPage() {
    const [groupedInventory, setGroupedInventory] = useState<InventoryGrouped[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [updatedPerson, setUpdatedPerson] = useState<string | null>(null);
    const [updatedTime, setUpdatedTime] = useState<string | null>(null);
    const [updatedDate, setUpdatedDate] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const { store, employee } = useEmployee();
    const dealerStoreId = store?.dealerStoreId || "";
    const employeeNtid = employee?.employeeNtid || "";

    const [companyName, setCompanyName] = useState<string>("");

    useEffect(() => {
        if (!employeeNtid) { return; }
        (async () => {
            try {
                const data = await fetchCompanyNameByNtid(employeeNtid);
                setCompanyName(data);
            } catch (err) {
                setError("Failed to fetch companyName. " + err);
            }
        })();
    }, [employeeNtid]);

    const { data } = useFetchCurrentInventory(companyName);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch,
        getValues,
        setValue,
    } = useForm<InventoryFormValues>({
        resolver: zodResolver(inventorySchema),
        defaultValues: { dealerStoreId, products: [] },
        mode: "onChange",
    });

    useEffect(() => {
        if (!dealerStoreId) { return; }
        (async () => {
            setLoading(true);
            try {
                const resp: StoreInventoryResponse = await fetchInventory(dealerStoreId);
                setGroupedInventory(resp.storeInventory);

                const flattened: InventoryItem[] = [];
                resp.storeInventory.forEach((group) => {
                    group.inStock.forEach((i) =>
                        flattened.push({
                            id: Number(i.id),
                            productName: i.productName,
                            quantity: i.quantity ?? 0,
                        })
                    );
                    group.outofStock.forEach((i) =>
                        flattened.push({
                            id: Number(i.id),
                            productName: i.productName,
                            quantity: i.quantity ?? 0,
                        })
                    );
                });

                setUpdatedPerson(resp.updatedPerson);
                setUpdatedTime(resp.updatedTime);
                setUpdatedDate(resp.updatedDate);
                reset({ dealerStoreId, products: flattened });
            } catch (err) {
                setError("Failed to load inventory. " + err);
            } finally {
                setLoading(false);
            }
        })();
    }, [dealerStoreId, store, employee, reset]);

    const productsWatch = watch("products") ?? [];
    const idToIndex = useMemo(() => {
        const map = new Map<number, number>();
        productsWatch.forEach((p, idx) => map.set(Number(p.id), idx));
        return map;
    }, [productsWatch]);

    // ✅ Updated quantity change logic (no live re-group)
    const onQuantityChange = (id: number, newQty: number, regroup = false) => {
        const idx = idToIndex.get(Number(id));
        if (idx !== undefined) {
            setValue(`products.${idx}.quantity`, newQty, { shouldDirty: true });
        }

        setGroupedInventory((prev) =>
            prev.map((g) => {
                const updatedInStock = g.inStock.map((x) =>
                    Number(x.id) === id ? { ...x, quantity: newQty } : x
                );
                const updatedOutStock = g.outofStock.map((x) =>
                    Number(x.id) === id ? { ...x, quantity: newQty } : x
                );

                // regroup only after blur/save
                if (regroup) {
                    const all = [...updatedInStock, ...updatedOutStock];
                    return {
                        ...g,
                        inStock: all.filter((p) => p.quantity > 0),
                        outofStock: all.filter((p) => p.quantity === 0),
                    };
                }

                return { ...g, inStock: updatedInStock, outofStock: updatedOutStock };
            })
        );
    };

    const onSave = handleSubmit(async (form) => {
        try {
            await updateInventory(dealerStoreId, form.products, employeeNtid);
            setUpdateSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } catch (err) {
            setError("Failed to update inventory. " + err);
        }
    });

    return (
        <main className="w-full min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 pb-8 bg-gray-50 dark:bg-gray-900">
            {/* ✅ TRUE sticky header */}
            <header className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 shadow border-b border-gray-300 dark:border-gray-700 py-3 mb-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Store Inventory
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last Updated by{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {updatedPerson}
                            </span>{" "}
                            on <span className="font-semibold">{updatedDate}</span> at{" "}
                            <span className="font-semibold">{updatedTime}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm md:text-base font-semibold rounded-lg shadow transition"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </header>

            {/* --- SEARCH PANEL --- */}
            <section className="mb-8 rounded-3xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 shadow-sm backdrop-blur-sm">
                <div className="px-4 sm:px-6 py-4 flex items-center gap-2 border-b border-sky-200/70 dark:border-sky-800/60">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
                        Search
                    </span>
                    <h2 className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                        Find devices across stores
                    </h2>
                </div>

                <div className="px-4 sm:px-6 py-4">
                    {data && data.length > 0 && <InventorySearch data={data} />}
                </div>
            </section>

            {/* Divider */}
            <div className="relative my-6">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                <div className="absolute -top-3 left-4 sm:left-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm">
                        Inventory by Brand
                    </span>
                </div>
            </div>

            {/* Content */}
            <section aria-label="Editable inventory by brand" className="w-full mt-4">
                {loading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        Loading inventory...
                    </p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <>
                        {updateSuccess && (
                            <p className="mb-4 text-green-600 dark:text-green-400 text-sm text-center font-semibold">
                                ✅ Inventory updated successfully!
                            </p>
                        )}
                        <InventoryGroupedTable
                            groupedInventory={groupedInventory}
                            control={control}
                            errors={errors}
                            idToIndex={idToIndex}
                            getValues={getValues}
                            setValue={setValue}
                            onQuantityChange={onQuantityChange}
                        />
                    </>
                )}
            </section>
        </main>
    );
}
