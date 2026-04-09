"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import { fetchCompanyMagentaOrders } from "@/services/magentaService";
import { MagentaStoreSummary } from "@/types/magenta";

const asDisplayDate = (value?: string) => {
    if (!value) { return "—"; }

    // Prevent timezone drift for date-only strings like "2026-04-09".
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;
        const localDate = new Date(Number(year), Number(month) - 1, Number(day));
        return localDate.toLocaleDateString();
    }

    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) { return value; }
    return dt.toLocaleDateString();
};

export default function OwnerMagentaPage() {
    const { companyName } = useOwner();
    const [data, setData] = useState<MagentaStoreSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!companyName) { return; }
        setLoading(true);
        setError(null);
        fetchCompanyMagentaOrders(companyName)
            .then((resp) => setData(Array.isArray(resp) ? resp : []))
            .catch((err) => setError(err?.message || "Failed to load company Magenta orders."))
            .finally(() => setLoading(false));
    }, [companyName]);

    const totals = useMemo(() => {
        return data.reduce((acc, item) => {
            acc.totalOrders += item.magentaDetails?.counts?.totalOrdersCount || 0;
            acc.cancelled += item.magentaDetails?.counts?.cancelledCount || 0;
            acc.success += item.magentaDetails?.counts?.sucessOrdersCount || 0;
            return acc;
        }, { totalOrders: 0, cancelled: 0, success: 0 });
    }, [data]);

    return (
        <div className="p-4 md:p-6 space-y-4">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Owner Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Magenta Orders</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Company-wide Magenta activity across stores.</p>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totals.totalOrders}</p>
                </div>
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/10 p-4">
                    <p className="text-xs text-rose-700 dark:text-rose-300">Cancelled</p>
                    <p className="text-2xl font-semibold text-rose-700 dark:text-rose-200">{totals.cancelled}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/10 p-4">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Completed</p>
                    <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-200">{totals.success}</p>
                </div>
            </section>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading Magenta data...</p>}

            {!loading && data.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No Magenta records found for this company.</p>
            )}

            {!loading && data.map((storeItem) => {
                const details = storeItem.magentaDetails;
                return (
                    <article
                        key={storeItem.store.dealerStoreId}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-sm p-4 space-y-4"
                    >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{storeItem.store.storeName}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Store ID: {storeItem.store.dealerStoreId}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-lg bg-gray-100 dark:bg-gray-900 px-3 py-2 text-center">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Total</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{details.counts.totalOrdersCount}</p>
                                </div>
                                <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 px-3 py-2 text-center">
                                    <p className="text-[11px] text-rose-700 dark:text-rose-300">Cancelled</p>
                                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">{details.counts.cancelledCount}</p>
                                </div>
                                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 text-center">
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Success</p>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">{details.counts.sucessOrdersCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                            <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Active Orders</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{details.orders.length} item(s)</p>
                                <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                                    {details.orders.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">No active orders.</p>}
                                    {details.orders.map((order) => (
                                        <div key={`${order.orderId}-${order.accountNumber}`} className="rounded-lg border border-gray-200 dark:border-gray-800 p-2.5">
                                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Order ID:</span> {order.orderId}</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Account:</span> {order.accountNumber}</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Phone:</span> {order.phoneNumber}</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Lines:</span> {order.numberOfLines}</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Date:</span> {asDisplayDate(order.orderDate)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/10 p-3">
                                <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Cancellations</h3>
                                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mb-2">{details.cancellations.length} item(s)</p>
                                <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                                    {details.cancellations.length === 0 && <p className="text-xs text-rose-700/80 dark:text-rose-300/80">No cancellations.</p>}
                                    {details.cancellations.map((item, index) => (
                                        <div key={`${item.phoneNumber}-${item.cancelledDate}-${index}`} className="rounded-lg border border-rose-200 dark:border-rose-900/40 p-2.5 bg-white/80 dark:bg-black/10">
                                            <p className="text-xs text-rose-900 dark:text-rose-200"><span className="font-semibold">Phone:</span> {item.phoneNumber}</p>
                                            <p className="text-xs text-rose-900 dark:text-rose-200"><span className="font-semibold">By:</span> {item.cancelledEmployeeName || "—"}</p>
                                            <p className="text-xs text-rose-900 dark:text-rose-200"><span className="font-semibold">Date:</span> {asDisplayDate(item.cancelledDate)}</p>
                                            <p className="text-xs text-rose-900 dark:text-rose-200"><span className="font-semibold">Reason:</span> {item.cancelledReason || "—"}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/10 p-3">
                                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Completed</h3>
                                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mb-2">{details.successOrders.length} item(s)</p>
                                <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                                    {details.successOrders.length === 0 && <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">No completed orders.</p>}
                                    {details.successOrders.map((item, index) => (
                                        <div key={`${item.phoneNumber}-${item.completedDate}-${index}`} className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 p-2.5 bg-white/80 dark:bg-black/10">
                                            <p className="text-xs text-emerald-900 dark:text-emerald-200"><span className="font-semibold">Phone:</span> {item.phoneNumber}</p>
                                            <p className="text-xs text-emerald-900 dark:text-emerald-200"><span className="font-semibold">By:</span> {item.completedEmployeeName || "—"}</p>
                                            <p className="text-xs text-emerald-900 dark:text-emerald-200"><span className="font-semibold">Date:</span> {asDisplayDate(item.completedDate)}</p>
                                            <p className="text-xs text-emerald-900 dark:text-emerald-200"><span className="font-semibold">Lines:</span> {item.numberOfLines}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
