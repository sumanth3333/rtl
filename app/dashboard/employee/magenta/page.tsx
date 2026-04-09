"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import {
    cancelMagentaOrder,
    completeMagentaOrder,
    fetchMagentaInStoreView,
    saveMagentaOrder,
} from "@/services/magentaService";
import { MagentaInStoreViewResponse } from "@/types/magenta";

const EMPTY_VIEW: MagentaInStoreViewResponse = {
    counts: {
        totalOrdersCount: 0,
        cancelledCount: 0,
        sucessOrdersCount: 0,
    },
    orders: [],
    cancellations: [],
    successOrders: [],
};

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

export default function EmployeeMagentaPage() {
    const { store, employee } = useEmployee();
    const dealerStoreId = store?.dealerStoreId || "";
    const employeeNtid = employee?.employeeNtid || "";

    const [viewData, setViewData] = useState<MagentaInStoreViewResponse>(EMPTY_VIEW);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<null | "save" | "complete" | "cancel">(null);
    const [orderActionAccount, setOrderActionAccount] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelPromptFor, setCancelPromptFor] = useState<string | null>(null);
    const [cancelReasonsByAccount, setCancelReasonsByAccount] = useState<Record<string, string>>({});

    const [saveForm, setSaveForm] = useState({
        numberOfLines: "",
        phoneNumber: "",
        accountPin: "",
        accountNumber: "",
        transferPin: "",
        orderId: "",
        newAccountNumber: "",
        newAccountPin: "",
        instructions: "",
    });

    const hasStore = useMemo(() => Boolean(dealerStoreId), [dealerStoreId]);

    const loadView = async (isManualRefresh = false) => {
        if (!dealerStoreId) { return; }
        if (isManualRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await fetchMagentaInStoreView(dealerStoreId);
            setViewData(data);
        } catch (err: any) {
            setError(err?.message || "Failed to load Magenta orders.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dealerStoreId]);

    const handleSaveOrder = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dealerStoreId || !employeeNtid) {
            setError("Store or employee context is missing.");
            return;
        }
        const linesCount = Number(saveForm.numberOfLines);
        if (!saveForm.numberOfLines || Number.isNaN(linesCount) || linesCount < 1) {
            setError("Number of lines is required.");
            return;
        }

        setActionLoading("save");
        setError(null);
        setMessage(null);
        try {
            await saveMagentaOrder({
                dealerStoreId,
                employeeNtid,
                numberOfLines: linesCount,
                phoneNumber: saveForm.phoneNumber.trim(),
                accountPin: saveForm.accountPin.trim(),
                accountNumber: saveForm.accountNumber.trim(),
                transferPin: saveForm.transferPin.trim(),
                orderId: saveForm.orderId.trim(),
                newAccountNumber: saveForm.newAccountNumber.trim(),
                newAccountPin: saveForm.newAccountPin.trim(),
                instructions: saveForm.instructions.trim(),
            });
            setMessage("Order placed successfully.");
            setSaveForm({
                numberOfLines: "",
                phoneNumber: "",
                accountPin: "",
                accountNumber: "",
                transferPin: "",
                orderId: "",
                newAccountNumber: "",
                newAccountPin: "",
                instructions: "",
            });
            await loadView(true);
        } catch (err: any) {
            setError(err?.message || "Failed to place order.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCompleteOrder = async (accountNumber: string) => {
        if (!employeeNtid) {
            setError("Employee context is missing.");
            return;
        }

        setActionLoading("complete");
        setOrderActionAccount(accountNumber);
        setError(null);
        setMessage(null);
        try {
            await completeMagentaOrder({
                employeeNtid,
                accountNumber: accountNumber.trim(),
            });
            setMessage(`Order ${accountNumber} marked as completed.`);
            await loadView(true);
        } catch (err: any) {
            setError(err?.message || "Failed to complete order.");
        } finally {
            setActionLoading(null);
            setOrderActionAccount(null);
        }
    };

    const handleCancelOrder = async (accountNumber: string) => {
        if (!employeeNtid) {
            setError("Employee context is missing.");
            return;
        }
        const reason = (cancelReasonsByAccount[accountNumber] || "").trim();
        if (!reason) {
            setError("Cancellation reason is required.");
            return;
        }

        setActionLoading("cancel");
        setOrderActionAccount(accountNumber);
        setError(null);
        setMessage(null);
        try {
            await cancelMagentaOrder({
                employeeNtid,
                accountNumber: accountNumber.trim(),
                reason,
            });
            setMessage(`Order ${accountNumber} cancelled successfully.`);
            setCancelPromptFor(null);
            setCancelReasonsByAccount((prev) => ({ ...prev, [accountNumber]: "" }));
            await loadView(true);
        } catch (err: any) {
            setError(err?.message || "Failed to cancel order.");
        } finally {
            setActionLoading(null);
            setOrderActionAccount(null);
        }
    };

    if (!hasStore) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Store context is missing. Please re-login.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Employee Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Magenta Orders</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create an order, update status, and track in-store activity in one place.
                    </p>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 text-left md:text-right">
                    <p>Store: <span className="font-semibold text-gray-900 dark:text-gray-100">{store?.storeName || dealerStoreId}</span></p>
                    <p>NTID: <span className="font-semibold text-gray-900 dark:text-gray-100">{employeeNtid || "N/A"}</span></p>
                </div>
            </header>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}
            {message && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
                    {message}
                </div>
            )}

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <form onSubmit={handleSaveOrder} className="xl:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-sm p-4 space-y-3">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Place New Order</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Saves a new Magenta order for this store.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-xl border border-violet-200 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/20 p-3">
                            <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-300 mb-3">Metro Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Phone Number
                                    <input
                                        type="text"
                                        value={saveForm.phoneNumber}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Account Number
                                    <input
                                        type="text"
                                        value={saveForm.accountNumber}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Account Pin
                                    <input
                                        type="text"
                                        value={saveForm.accountPin}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, accountPin: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Transfer Pin
                                    <input
                                        type="text"
                                        value={saveForm.transferPin}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, transferPin: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/60 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20 p-3">
                            <h3 className="text-sm font-semibold text-fuchsia-900 dark:text-fuchsia-300 mb-3">T-Mobile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Number of Lines
                                    <input
                                        type="number"
                                        min={1}
                                        value={saveForm.numberOfLines}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, numberOfLines: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    Order ID
                                    <input
                                        type="text"
                                        value={saveForm.orderId}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, orderId: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    New Account Number
                                    <input
                                        type="text"
                                        value={saveForm.newAccountNumber}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, newAccountNumber: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200">
                                    New Account Pin
                                    <input
                                        type="text"
                                        value={saveForm.newAccountPin}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, newAccountPin: e.target.value }))}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                                <label className="text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
                                    Instructions
                                    <textarea
                                        value={saveForm.instructions}
                                        onChange={(e) => setSaveForm((prev) => ({ ...prev, instructions: e.target.value }))}
                                        rows={3}
                                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                    <Button type="submit" isLoading={actionLoading === "save"} disabled={!employeeNtid || !dealerStoreId}>
                        Place Order
                    </Button>
                </form>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-sm p-4 space-y-3">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">In-Store Summary</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{viewData.counts.totalOrdersCount}</p>
                        </div>
                        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 p-3">
                            <p className="text-xs text-rose-700 dark:text-rose-300">Cancelled</p>
                            <p className="text-xl font-semibold text-rose-700 dark:text-rose-200">{viewData.counts.cancelledCount}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3">
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">Success</p>
                            <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-200">{viewData.counts.sucessOrdersCount}</p>
                        </div>
                    </div>
                    <Button onClick={() => loadView(true)} isLoading={refreshing}>
                        Refresh Data
                    </Button>
                </div>
            </section>

            {loading ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading Magenta orders...</p>
            ) : (
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 shadow-sm p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Active Orders</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{viewData.orders.length} order(s)</p>
                        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                            {viewData.orders.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No active orders.</p>}
                            {viewData.orders.map((order) => (
                                <div key={`${order.orderId}-${order.accountNumber}`} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-3 bg-white dark:bg-gray-900/30">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Order ID: {order.orderId}</p>
                                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                            Active
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="rounded-lg border border-violet-200 bg-violet-50/60 dark:border-violet-900/40 dark:bg-violet-950/20 p-2.5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-800 dark:text-violet-300 mb-2">Metro Info</p>
                                            <dl className="grid grid-cols-[minmax(145px,auto)_1fr] gap-x-4 gap-y-1.5 text-sm text-gray-800 dark:text-gray-200">
                                                <dt className="font-semibold">Phone Number</dt>
                                                <dd>{order.phoneNumber || "—"}</dd>
                                                <dt className="font-semibold">Account Number</dt>
                                                <dd>{order.accountNumber || "—"}</dd>
                                                <dt className="font-semibold">Account Pin</dt>
                                                <dd>{order.accountPin || "—"}</dd>
                                                <dt className="font-semibold">Transfer Pin</dt>
                                                <dd>{order.transferPin || "—"}</dd>
                                                <dt className="font-semibold">Transfer Pin Validity</dt>
                                                <dd>{asDisplayDate(order.transferPinValidity)}</dd>
                                            </dl>
                                        </div>

                                        <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50/60 dark:border-fuchsia-900/40 dark:bg-fuchsia-950/20 p-2.5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-800 dark:text-fuchsia-300 mb-2">T-Mobile Info</p>
                                            <dl className="grid grid-cols-[minmax(145px,auto)_1fr] gap-x-4 gap-y-1.5 text-sm text-gray-800 dark:text-gray-200">
                                                <dt className="font-semibold">Number of Lines</dt>
                                                <dd>{order.numberOfLines ?? "—"}</dd>
                                                <dt className="font-semibold">Order Date</dt>
                                                <dd>{asDisplayDate(order.orderDate)}</dd>
                                                <dt className="font-semibold">New Account Number</dt>
                                                <dd>{order.newAccountNumber || "—"}</dd>
                                                <dt className="font-semibold">New Account Pin</dt>
                                                <dd>{order.newAccountPin || "—"}</dd>
                                                <dt className="font-semibold">Instructions</dt>
                                                <dd>{order.instructions || "—"}</dd>
                                            </dl>
                                        </div>
                                    </div>

                                    {!order.cancelled && !order.completed && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="success"
                                                    className="!px-2.5 !py-1.5 !text-xs"
                                                    onClick={() => handleCompleteOrder(order.accountNumber)}
                                                    isLoading={actionLoading === "complete" && orderActionAccount === order.accountNumber}
                                                    disabled={actionLoading !== null}
                                                >
                                                    Complete Order
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="!px-2.5 !py-1.5 !text-xs"
                                                    onClick={() => setCancelPromptFor(order.accountNumber)}
                                                    disabled={actionLoading !== null}
                                                >
                                                    Cancel Order
                                                </Button>
                                            </div>
                                            {cancelPromptFor === order.accountNumber && (
                                                <div className="space-y-2 rounded-md border border-rose-200 dark:border-rose-900/50 p-2">
                                                    <textarea
                                                        value={cancelReasonsByAccount[order.accountNumber] || ""}
                                                        onChange={(e) =>
                                                            setCancelReasonsByAccount((prev) => ({
                                                                ...prev,
                                                                [order.accountNumber]: e.target.value,
                                                            }))
                                                        }
                                                        rows={2}
                                                        placeholder="Enter cancellation reason"
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="danger"
                                                            className="!px-2.5 !py-1.5 !text-xs"
                                                            onClick={() => handleCancelOrder(order.accountNumber)}
                                                            isLoading={actionLoading === "cancel" && orderActionAccount === order.accountNumber}
                                                            disabled={actionLoading !== null}
                                                        >
                                                            Confirm Cancel
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="!px-2.5 !py-1.5 !text-xs"
                                                            onClick={() => {
                                                                setCancelPromptFor(null);
                                                                setCancelReasonsByAccount((prev) => ({
                                                                    ...prev,
                                                                    [order.accountNumber]: "",
                                                                }));
                                                            }}
                                                            disabled={actionLoading !== null}
                                                        >
                                                            Close
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/10 shadow-sm p-4">
                        <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Cancelled</h3>
                        <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mb-3">{viewData.cancellations.length} order(s)</p>
                        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                            {viewData.cancellations.length === 0 && <p className="text-sm text-rose-700/80 dark:text-rose-300/80">No cancelled orders.</p>}
                            {viewData.cancellations.map((item, index) => (
                                <div key={`${item.phoneNumber}-${item.cancelledDate}-${index}`} className="rounded-lg border border-rose-200 dark:border-rose-900/40 p-3 bg-white/70 dark:bg-black/10">
                                    <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">Phone: {item.phoneNumber}</p>
                                    <p className="text-xs text-rose-800/80 dark:text-rose-200/80">Lines: {item.numberOfLines}</p>
                                    <p className="text-xs text-rose-800/80 dark:text-rose-200/80">Cancelled By: {item.cancelledEmployeeName || "—"}</p>
                                    <p className="text-xs text-rose-800/80 dark:text-rose-200/80">Date: {asDisplayDate(item.cancelledDate)}</p>
                                    <p className="text-xs text-rose-800/80 dark:text-rose-200/80">Reason: {item.cancelledReason || "—"}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/10 shadow-sm p-4">
                        <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Completed</h3>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mb-3">{viewData.successOrders.length} order(s)</p>
                        <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                            {viewData.successOrders.length === 0 && <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">No completed orders.</p>}
                            {viewData.successOrders.map((item, index) => (
                                <div key={`${item.phoneNumber}-${item.completedDate}-${index}`} className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 p-3 bg-white/70 dark:bg-black/10">
                                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Phone: {item.phoneNumber}</p>
                                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Lines: {item.numberOfLines}</p>
                                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Completed By: {item.completedEmployeeName || "—"}</p>
                                    <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">Date: {asDisplayDate(item.completedDate)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
