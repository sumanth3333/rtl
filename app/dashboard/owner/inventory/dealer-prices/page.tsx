// app/(owner)/dealer-prices/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Save, RefreshCcw } from "lucide-react";
import apiClient from "@/services/api/apiClient";
import { useOwner } from "@/hooks/useOwner";

type DealerProductPrice = {
    id: number | null;
    productName: string;
    price: number;
};

type SavePayload = {
    companyName: string;
    products: {
        id: number | null;
        productName: string;
        price: number;
    }[];
};

export default function DealerPricesPage() {
    const { companyName } = useOwner();

    const [prices, setPrices] = useState<DealerProductPrice[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch prices from new endpoint
    const fetchPrices = async () => {
        if (!companyName) { return; }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await apiClient.get<DealerProductPrice[]>(
                "/company/fetchCurrentDealerPriceForProducts",
                {
                    params: { companyName },
                }
            );
            setPrices(res.data || []);
        } catch (err: any) {
            console.error(err);
            const message =
                typeof err === "string"
                    ? err
                    : err?.message || "Failed to load dealer prices.";
            setError(message);
        } finally {
            setLoading(false);
            setInitialLoadDone(true);
        }
    };

    useEffect(() => {
        if (!companyName) { return; }
        fetchPrices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName]);

    const handlePriceChange = (id: number | null, productName: string, value: string) => {
        const num = parseFloat(value);
        setPrices((prev) =>
            prev.map((p) =>
                p.productName === productName && p.id === id
                    ? { ...p, price: isNaN(num) ? 0 : num }
                    : p
            )
        );
    };

    const handleSaveRow = async (product: DealerProductPrice) => {
        if (!companyName) { return; }

        setSavingId(product.id ?? -1);
        setError(null);
        setSuccessMessage(null);

        try {
            const payload: SavePayload = {
                companyName,
                products: [
                    {
                        id: product.id ?? null,
                        productName: product.productName,
                        price: product.price,
                    },
                ],
            };

            await apiClient.post("/dealerProductPrice/save", payload);

            setSuccessMessage(
                `Updated price for "${product.productName}" successfully.`
            );

            // Refresh list to reflect any new ids or updated data
            await fetchPrices();
        } catch (err: any) {
            console.error(err);
            const message =
                typeof err === "string"
                    ? err
                    : err?.message || "Failed to save price.";
            setError(message);
        } finally {
            setSavingId(null);
        }
    };

    const isLoadingAnything = loading && !initialLoadDone;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-6">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Dealer Device Prices
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
                            Company:{" "}
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {companyName || "—"}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchPrices}
                        disabled={loading || !companyName}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCcw className="h-4 w-4" />
                        )}
                        Refresh
                    </button>
                </header>

                {/* Alerts */}
                {error && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
                        {successMessage}
                    </div>
                )}

                {/* Loading / Empty States */}
                {isLoadingAnything && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                        <div className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading current dealer prices…</span>
                        </div>
                    </div>
                )}

                {!isLoadingAnything &&
                    prices.length === 0 &&
                    initialLoadDone && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                            No dealer prices found for this company.
                        </div>
                    )}

                {/* Main Table */}
                {prices.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between dark:border-slate-800">
                            <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 uppercase">
                                Current Dealer Prices
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter the dealer cost for each device and click{" "}
                                <span className="font-semibold">Update</span>.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/70">
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        <th className="px-4 py-2">Device / Product</th>
                                        <th className="px-4 py-2 w-40 text-right">Dealer Cost ($)</th>
                                        <th className="px-4 py-2 w-32 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prices.map((product) => (
                                        <tr
                                            key={`${product.productName}-${product.id ?? "new"}`}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-900/70 transition"
                                        >
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                                        {product.productName}
                                                    </span>
                                                    {product.id !== null && (
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                            ID: {product.id}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-2 text-right align-middle">
                                                <div className="inline-flex items-center justify-end w-full gap-1">
                                                    <span className="text-sm text-slate-400 dark:text-slate-500">
                                                        $
                                                    </span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={product.price}
                                                        onChange={(e) =>
                                                            handlePriceChange(
                                                                product.id,
                                                                product.productName,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm font-mono text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-4 py-2 text-center align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRow(product)}
                                                    disabled={savingId === (product.id ?? -1)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {savingId === (product.id ?? -1) ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Save className="h-3.5 w-3.5" />
                                                    )}
                                                    <span>Update</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
