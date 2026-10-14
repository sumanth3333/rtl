"use client";

import { Fragment, useEffect, useState } from "react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import {
    fetchProductCategories,
    fetchBrands,
    saveNewProducts,
    fetchAllProducts,
    getProductStockAvailability,
    deactivateProduct,
    reactivateProduct,
    deleteProduct,
} from "@/services/admin/productService";
import { ApiError } from "@/services/api/errorHandler";
import { AdminProductSummary, IdLabelMap, NewProduct, ProductStockAvailabilityResponse } from "@/types/productTypes";

type Alert = { type: "success" | "error" | "info"; message: string };

const emptyForm = { productNameSuffix: "", price: "", productCategory: "", brand: "" };

export default function ManageProductsPage() {
    const [categories, setCategories] = useState<IdLabelMap>({});
    const [brands, setBrands] = useState<IdLabelMap>({});
    const [optionsLoading, setOptionsLoading] = useState(true);

    const [form, setForm] = useState(emptyForm);
    const [pendingProducts, setPendingProducts] = useState<NewProduct[]>([]);
    const [savedProducts, setSavedProducts] = useState<NewProduct[]>([]);

    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<Alert | null>(null);

    // All products list (browse / search)
    const [allProducts, setAllProducts] = useState<AdminProductSummary[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState("");

    // Per-product stock, keyed by product id — fetched once the list loads since
    // /admin/products doesn't carry inventory counts.
    const [stockById, setStockById] = useState<Record<number, { totalStoresWithStock: number; totalQuantityAvailable: number }>>({});

    // Bulk selection (deactivate / delete straight from the list)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [bulkAlert, setBulkAlert] = useState<Alert | null>(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // Manage existing product (deactivate / reactivate / delete)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupAlert, setLookupAlert] = useState<Alert | null>(null);
    const [productInfo, setProductInfo] = useState<ProductStockAvailabilityResponse | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const loadOptions = async () => {
            setOptionsLoading(true);

            const [categoriesResult, brandsResult] = await Promise.allSettled([
                fetchProductCategories(),
                fetchBrands(),
            ]);

            if (categoriesResult.status === "fulfilled") {
                setCategories(categoriesResult.value);
            } else {
                console.error("❌ Error fetching product categories:", categoriesResult.reason);
            }

            if (brandsResult.status === "fulfilled") {
                setBrands(brandsResult.value);
            } else {
                console.error("❌ Error fetching brands:", brandsResult.reason);
            }

            if (categoriesResult.status === "rejected" || brandsResult.status === "rejected") {
                const failed = [
                    categoriesResult.status === "rejected" && "categories",
                    brandsResult.status === "rejected" && "brands",
                ].filter(Boolean).join(" and ");
                setAlert({ type: "error", message: `Failed to load ${failed}.` });
            }

            setOptionsLoading(false);
        };

        loadOptions();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setProductsLoading(true);
            setProductsError(null);
            try {
                const data = await fetchAllProducts();
                setAllProducts(data);
                loadStockForProducts(data.map((p) => p.id));
            } catch (error) {
                console.error("❌ Error fetching products:", error);
                setProductsError("Failed to load products. Please try again.");
            } finally {
                setProductsLoading(false);
            }
        };

        loadProducts();
    }, []);

    const loadStockForProducts = async (ids: number[]) => {
        const results = await Promise.allSettled(ids.map((id) => getProductStockAvailability(id)));
        const next: Record<number, { totalStoresWithStock: number; totalQuantityAvailable: number }> = {};
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                next[ids[index]] = {
                    totalStoresWithStock: result.value.totalStoresWithStock,
                    totalQuantityAvailable: result.value.totalQuantityAvailable,
                };
            } else {
                console.error(`❌ Error fetching stock for product ${ids[index]}:`, result.reason);
            }
        });
        setStockById((prev) => ({ ...prev, ...next }));
    };

    const filteredProducts = allProducts.filter((product) => {
        const query = productSearch.trim().toLowerCase();
        if (!query) { return true; }
        return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.brand ?? "").toLowerCase().includes(query) ||
            String(product.id).includes(query)
        );
    });

    const groupedProducts = filteredProducts.reduce<Record<string, AdminProductSummary[]>>((acc, product) => {
        const key = product.brand?.trim() || "Unassigned";
        (acc[key] ??= []).push(product);
        return acc;
    }, {});

    const sortedBrands = Object.keys(groupedProducts).sort((a, b) => {
        if (a === "Unassigned") { return 1; }
        if (b === "Unassigned") { return -1; }
        return a.localeCompare(b);
    });

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectGroup = (groupProducts: AdminProductSummary[], checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            groupProducts.forEach((p) => {
                if (checked) { next.add(p.id); } else { next.delete(p.id); }
            });
            return next;
        });
    };

    const handleFormChange = (field: keyof typeof emptyForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const hasDuplicateBrandInName =
        form.brand !== "" &&
        form.productNameSuffix.trim().toLowerCase().startsWith(form.brand.trim().toLowerCase());

    const canAdd =
        form.productNameSuffix.trim() !== "" &&
        form.productCategory !== "" &&
        form.brand !== "" &&
        Number(form.price) > 0 &&
        !hasDuplicateBrandInName;

    const handleAddToList = () => {
        if (hasDuplicateBrandInName) {
            setAlert({ type: "error", message: `"${form.brand}" is already added as the brand — remove it from the product name.` });
            return;
        }

        if (!canAdd) { return; }

        setPendingProducts((prev) => [
            ...prev,
            {
                productName: `${form.brand} ${form.productNameSuffix.trim()}`,
                price: Number(form.price),
                productCategory: form.productCategory,
                brand: form.brand,
            },
        ]);
        setForm(emptyForm);
        setAlert(null);
    };

    const handleRemove = (index: number) => {
        setPendingProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (pendingProducts.length === 0) { return; }

        setSaving(true);
        setAlert(null);
        try {
            await saveNewProducts(pendingProducts);
            setSavedProducts((prev) => [...pendingProducts, ...prev]);
            setAlert({ type: "success", message: `✅ Saved ${pendingProducts.length} product${pendingProducts.length === 1 ? "" : "s"} successfully!` });
            setPendingProducts([]);
        } catch (error) {
            console.error("❌ Error saving products:", error);
            setAlert({ type: "error", message: "Failed to save products. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleSelectProduct = async (productId: number) => {
        setSelectedProductId(productId);
        setLookupLoading(true);
        setLookupAlert(null);
        setProductInfo(null);
        try {
            const data = await getProductStockAvailability(productId);
            setProductInfo(data);
        } catch (error) {
            const message = error instanceof ApiError
                ? error.message
                : "Failed to fetch product details. Please try again.";
            setLookupAlert({ type: "error", message });
        } finally {
            setLookupLoading(false);
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedIds.size === 0) { return; }
        const ids = Array.from(selectedIds);

        setBulkActionLoading(true);
        setBulkAlert(null);
        const results = await Promise.allSettled(ids.map((id) => deactivateProduct(id)));

        const succeededIds: number[] = [];
        const failures: string[] = [];
        results.forEach((result, index) => {
            const id = ids[index];
            if (result.status === "fulfilled") {
                succeededIds.push(id);
            } else {
                const name = allProducts.find((p) => p.id === id)?.name ?? `#${id}`;
                const message = result.reason instanceof ApiError ? result.reason.message : "Failed to deactivate.";
                failures.push(`${name}: ${message}`);
            }
        });

        if (succeededIds.length > 0) {
            setAllProducts((prev) => prev.map((p) => (succeededIds.includes(p.id) ? { ...p, active: false } : p)));
        }
        setSelectedIds(new Set());
        setBulkActionLoading(false);
        setBulkAlert(
            failures.length === 0
                ? { type: "success", message: `Deactivated ${succeededIds.length} product${succeededIds.length === 1 ? "" : "s"}.` }
                : { type: "error", message: `Deactivated ${succeededIds.length}. Failed: ${failures.join("; ")}` }
        );
    };

    const handleBulkDeleteConfirmed = async () => {
        const ids = Array.from(selectedIds);
        const blockedIds = ids.filter((id) => (stockById[id]?.totalStoresWithStock ?? 0) > 0);
        const deletableIds = ids.filter((id) => !blockedIds.includes(id));

        setBulkActionLoading(true);
        setBulkAlert(null);
        const results = await Promise.allSettled(deletableIds.map((id) => deleteProduct(id)));

        const succeededIds: number[] = [];
        const failures: string[] = blockedIds.map((id) => {
            const name = allProducts.find((p) => p.id === id)?.name ?? `#${id}`;
            return `${name}: has store inventory`;
        });
        results.forEach((result, index) => {
            const id = deletableIds[index];
            if (result.status === "fulfilled") {
                succeededIds.push(id);
            } else {
                const name = allProducts.find((p) => p.id === id)?.name ?? `#${id}`;
                const message = result.reason instanceof ApiError ? result.reason.message : "Failed to delete.";
                failures.push(`${name}: ${message}`);
            }
        });

        if (succeededIds.length > 0) {
            setAllProducts((prev) => prev.filter((p) => !succeededIds.includes(p.id)));
            setStockById((prev) => {
                const next = { ...prev };
                succeededIds.forEach((id) => delete next[id]);
                return next;
            });
            if (productInfo && succeededIds.includes(productInfo.productId)) {
                setProductInfo(null);
                setSelectedProductId(null);
            }
        }
        setSelectedIds(new Set());
        setBulkActionLoading(false);
        setShowBulkDeleteConfirm(false);
        setBulkAlert(
            failures.length === 0
                ? { type: "success", message: `Deleted ${succeededIds.length} product${succeededIds.length === 1 ? "" : "s"}.` }
                : { type: "error", message: `Deleted ${succeededIds.length}. Blocked: ${failures.join("; ")}` }
        );
    };

    const refreshProductInfo = async () => {
        if (!productInfo) { return; }
        try {
            const data = await getProductStockAvailability(productInfo.productId);
            setProductInfo(data);
        } catch {
            // Keep the last known info on screen; the action result alert already reported success.
        }
    };

    const handleDeactivate = async () => {
        if (!productInfo) { return; }
        setActionLoading(true);
        setLookupAlert(null);
        try {
            const message = await deactivateProduct(productInfo.productId);
            setLookupAlert({ type: "success", message });
            setAllProducts((prev) => prev.map((p) => (p.id === productInfo.productId ? { ...p, active: false } : p)));
            await refreshProductInfo();
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to deactivate product.";
            setLookupAlert({ type: "error", message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async () => {
        if (!productInfo) { return; }
        setActionLoading(true);
        setLookupAlert(null);
        try {
            const message = await reactivateProduct(productInfo.productId);
            setLookupAlert({ type: "success", message });
            setAllProducts((prev) => prev.map((p) => (p.id === productInfo.productId ? { ...p, active: true } : p)));
            await refreshProductInfo();
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to reactivate product.";
            setLookupAlert({ type: "error", message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteConfirmed = async () => {
        if (!productInfo) { return; }
        setActionLoading(true);
        setLookupAlert(null);
        try {
            const message = await deleteProduct(productInfo.productId);
            setLookupAlert({ type: "success", message });
            setAllProducts((prev) => prev.filter((p) => p.id !== productInfo.productId));
            setStockById((prev) => {
                const next = { ...prev };
                delete next[productInfo.productId];
                return next;
            });
            setProductInfo(null);
            setSelectedProductId(null);
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to delete product.";
            setLookupAlert({ type: "error", message });
        } finally {
            setActionLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const renderManagePanel = () => (
        <>
            {lookupAlert && (
                <div
                    className={`rounded-md px-4 py-3 text-sm ${lookupAlert.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                        }`}
                >
                    {lookupAlert.message}
                </div>
            )}

            {productInfo && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {productInfo.productName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Product ID: {productInfo.productId}</p>
                        </div>
                        <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${productInfo.active
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                        >
                            {productInfo.active ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Stores With Stock</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {productInfo.totalStoresWithStock}
                            </p>
                        </div>
                        <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Total Quantity Available</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {productInfo.totalQuantityAvailable}
                            </p>
                        </div>
                    </div>

                    {productInfo.stores.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold">Store</th>
                                        <th className="px-3 py-2 text-left font-semibold">Dealer Store ID</th>
                                        <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {productInfo.stores.map((store) => (
                                        <tr key={store.dealerStoreId}>
                                            <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{store.storeName}</td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{store.dealerStoreId}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                {store.quantityAvailable}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-end gap-3">
                        {productInfo.active ? (
                            <Button onClick={handleDeactivate} isLoading={actionLoading} variant="warning">
                                Deactivate
                            </Button>
                        ) : (
                            <Button onClick={handleReactivate} isLoading={actionLoading} variant="success">
                                Reactivate
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={actionLoading || productInfo.totalStoresWithStock > 0}
                            variant="danger"
                        >
                            Delete Permanently
                        </Button>
                    </div>
                    {productInfo.totalStoresWithStock > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            Deletion is blocked while this product has store inventory. Deactivate it instead.
                        </p>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">🛒 Manage Products</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add new products with their category, brand, and price.
            </p>

            {alert && (
                <div
                    className={`mt-4 rounded-md px-4 py-3 text-sm ${alert.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : alert.type === "error"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                >
                    {alert.message}
                </div>
            )}

            {/* Add product form */}
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Add Product</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1 w-full max-w-full sm:max-w-[28rem]">
                        <label className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold">
                            Product Name
                        </label>
                        <div className="flex items-stretch w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 overflow-hidden">
                            {form.brand && (
                                <span className="flex items-center px-2.5 sm:px-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 whitespace-nowrap">
                                    {form.brand}
                                </span>
                            )}
                            <input
                                type="text"
                                value={form.productNameSuffix}
                                onChange={(e) => handleFormChange("productNameSuffix", e.target.value)}
                                placeholder="e.g. Galaxy A57 5G"
                                className="flex-1 min-w-0 px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
                            />
                        </div>
                        {!form.brand && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Select a brand to prefix the name.</p>
                        )}
                        {hasDuplicateBrandInName && (
                            <p className="text-xs text-red-500">
                                &quot;{form.brand}&quot; is already added as the brand — remove it from the product name.
                            </p>
                        )}
                    </div>
                    <InputField
                        label="Price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.price}
                        onChange={(e) => handleFormChange("price", e.target.value)}
                        placeholder="0.00"
                    />

                    <div className="flex flex-col space-y-1 w-full max-w-full sm:max-w-[28rem]">
                        <label className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold">
                            Category
                        </label>
                        <select
                            value={form.productCategory}
                            onChange={(e) => handleFormChange("productCategory", e.target.value)}
                            disabled={optionsLoading}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            <option value="">{optionsLoading ? "Loading categories..." : "Select category"}</option>
                            {Object.entries(categories).map(([id, label]) => (
                                <option key={id} value={label}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1 w-full max-w-full sm:max-w-[28rem]">
                        <label className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold">
                            Brand
                        </label>
                        <select
                            value={form.brand}
                            onChange={(e) => handleFormChange("brand", e.target.value)}
                            disabled={optionsLoading}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                            <option value="">{optionsLoading ? "Loading brands..." : "Select brand"}</option>
                            {Object.entries(brands).map(([id, label]) => (
                                <option key={id} value={label}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleAddToList} disabled={!canAdd || optionsLoading} variant="secondary">
                        Add to List
                    </Button>
                </div>
            </div>

            {/* Manage existing product: deactivate / reactivate / delete */}
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                        All Products {!productsLoading && `(${filteredProducts.length}${productSearch ? ` of ${allProducts.length}` : ""})`}
                    </h2>
                </div>

                <InputField
                    label="Search"
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, category, brand, or ID"
                    className="sm:max-w-sm"
                />

                {productsError && (
                    <div className="rounded-md px-4 py-3 text-sm bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                        {productsError}
                    </div>
                )}

                {selectedIds.size > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2">
                        <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                            {selectedIds.size} selected
                        </span>
                        <Button onClick={handleBulkDeactivate} isLoading={bulkActionLoading} variant="warning">
                            Deactivate Selected
                        </Button>
                        <Button onClick={() => setShowBulkDeleteConfirm(true)} disabled={bulkActionLoading} variant="danger">
                            Delete Selected
                        </Button>
                        <button
                            type="button"
                            onClick={() => setSelectedIds(new Set())}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                        >
                            Clear selection
                        </button>
                    </div>
                )}

                {bulkAlert && (
                    <div
                        className={`rounded-md px-4 py-3 text-sm ${bulkAlert.type === "success"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                            }`}
                    >
                        {bulkAlert.message}
                    </div>
                )}

                {productsLoading ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No products match your search.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-[32rem] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 w-8"></th>
                                    <th className="px-3 py-2 text-left font-semibold">ID</th>
                                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                                    <th className="px-3 py-2 text-left font-semibold">Category</th>
                                    <th className="px-3 py-2 text-right font-semibold">Price</th>
                                    <th className="px-3 py-2 text-center font-semibold">Stock</th>
                                    <th className="px-3 py-2 text-center font-semibold">Status</th>
                                    <th className="px-3 py-2 text-center font-semibold">Action</th>
                                </tr>
                            </thead>
                            {sortedBrands.map((brand) => {
                                const groupProducts = groupedProducts[brand];
                                const allSelected = groupProducts.every((p) => selectedIds.has(p.id));
                                return (
                                    <tbody key={brand} className="divide-y divide-gray-100 dark:divide-gray-800">
                                        <tr className="bg-gray-50 dark:bg-gray-800/80">
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={(e) => toggleSelectGroup(groupProducts, e.target.checked)}
                                                    aria-label={`Select all ${brand} products`}
                                                />
                                            </td>
                                            <td colSpan={7} className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200">
                                                {brand} ({groupProducts.length})
                                            </td>
                                        </tr>
                                        {groupProducts.map((product) => (
                                            <Fragment key={product.id}>
                                                <tr
                                                    className={product.id === selectedProductId ? "bg-blue-50 dark:bg-blue-900/30" : undefined}
                                                >
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(product.id)}
                                                            onChange={() => toggleSelect(product.id)}
                                                            aria-label={`Select ${product.name}`}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{product.id}</td>
                                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{product.name}</td>
                                                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{product.category}</td>
                                                    <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                        ${product.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                                                        {stockById[product.id] === undefined
                                                            ? "Loading..."
                                                            : `${stockById[product.id].totalStoresWithStock} store${stockById[product.id].totalStoresWithStock === 1 ? "" : "s"}`}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.active
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                                    }`}
                                                            >
                                                                {product.active ? "Active" : "Inactive"}
                                                            </span>
                                                            {(stockById[product.id]?.totalStoresWithStock ?? 0) > 0 && (
                                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                                    In Stock
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectProduct(product.id)}
                                                            disabled={lookupLoading && product.id === selectedProductId}
                                                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold disabled:opacity-50"
                                                        >
                                                            {lookupLoading && product.id === selectedProductId ? "Loading..." : "Manage"}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {product.id === selectedProductId && (
                                                    <tr>
                                                        <td colSpan={8} className="p-0 bg-gray-50 dark:bg-gray-800/40">
                                                            <div className="p-4 space-y-4">
                                                                {renderManagePanel()}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                );
                            })}
                        </table>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirmed}
                title="Delete Product Permanently"
                message={`This will permanently delete "${productInfo?.productName}". This action cannot be undone.`}
                confirmText="Delete"
                isLoadingConfirm={actionLoading}
            />

            <ConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={handleBulkDeleteConfirmed}
                title="Delete Selected Products"
                message={(() => {
                    const ids = Array.from(selectedIds);
                    const blockedNames = ids
                        .filter((id) => (stockById[id]?.totalStoresWithStock ?? 0) > 0)
                        .map((id) => allProducts.find((p) => p.id === id)?.name ?? `#${id}`);
                    const deletableCount = ids.length - blockedNames.length;
                    if (blockedNames.length === 0) {
                        return `This will permanently delete ${ids.length} product${ids.length === 1 ? "" : "s"}. This action cannot be undone.`;
                    }
                    return `This will permanently delete ${deletableCount} of ${ids.length} selected products. ${blockedNames.length} have store inventory and will be skipped: ${blockedNames.join(", ")}. This action cannot be undone.`;
                })()}
                confirmText="Delete"
                isLoadingConfirm={bulkActionLoading}
            />

            {/* Pending products */}
            {pendingProducts.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                        Ready to Save ({pendingProducts.length})
                    </h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold">Product Name</th>
                                    <th className="px-3 py-2 text-left font-semibold">Category</th>
                                    <th className="px-3 py-2 text-left font-semibold">Brand</th>
                                    <th className="px-3 py-2 text-right font-semibold">Price</th>
                                    <th className="px-3 py-2 text-center font-semibold">Remove</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {pendingProducts.map((product, index) => (
                                    <tr key={index}>
                                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{product.productName}</td>
                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{product.productCategory}</td>
                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{product.brand}</td>
                                        <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                                            ${product.price.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                ❌
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3 flex justify-end">
                        <Button onClick={handleSave} isLoading={saving} variant="primary">
                            Save {pendingProducts.length} Product{pendingProducts.length === 1 ? "" : "s"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Session confirmation of saved products */}
            {savedProducts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                        Saved This Session ({savedProducts.length})
                    </h2>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {savedProducts.map((product, index) => (
                            <li key={index} className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                                <span>{product.productName} — {product.brand} · {product.productCategory}</span>
                                <span className="font-semibold">${product.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
