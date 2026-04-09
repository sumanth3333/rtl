"use client";

import { useEffect, useMemo, useState } from "react";
import { useOwner } from "@/hooks/useOwner";
import { fetchCompanyAssurantStatus, fetchCompanyReturnDevices, StoreAssurantSummary, StoreReturnDevices } from "@/services/owner/claimsReturnsService";

type Tab = "assurant" | "customer";

const formatDateTime = (val?: string) => val || "—";

export default function OwnerClaimsReturnsPage() {
    const { companyName } = useOwner();
    const [activeTab, setActiveTab] = useState<Tab>("assurant");
    const [assurant, setAssurant] = useState<StoreAssurantSummary[]>([]);
    const [returns, setReturns] = useState<StoreReturnDevices[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedAssurant, setExpandedAssurant] = useState<Record<string, boolean>>({});
    const [expandedReturns, setExpandedReturns] = useState<Record<string, boolean>>({});

    const hasCompany = useMemo(() => Boolean(companyName), [companyName]);

    useEffect(() => {
        const load = async () => {
            if (!companyName) { return; }
            setLoading(true);
            setError(null);
            try {
                const [assurantData, returnData] = await Promise.all([
                    fetchCompanyAssurantStatus(companyName),
                    fetchCompanyReturnDevices(companyName),
                ]);
                setAssurant(Array.isArray(assurantData) ? assurantData : []);
                setReturns(Array.isArray(returnData) ? returnData : []);

                const collapsedA: Record<string, boolean> = {};
                (assurantData || []).forEach((s: any) => { collapsedA[s.store?.dealerStoreId] = false; });
                setExpandedAssurant(collapsedA);
                const collapsedR: Record<string, boolean> = {};
                (returnData || []).forEach((s: any) => { collapsedR[s.store?.dealerStoreId] = false; });
                setExpandedReturns(collapsedR);
            } catch (err: any) {
                setError(err?.message || "Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [companyName]);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Owner Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Claims & Returns</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Company-wide view of Assurant claims and customer returns by store.</p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Company: <span className="font-semibold text-gray-800 dark:text-gray-100">{companyName || "N/A"}</span></div>
            </header>

            <div className="flex gap-2 justify-center">
                {[{ key: "assurant", label: "Assurant Claims" }, { key: "customer", label: "Customer Returns" }].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as Tab)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${activeTab === tab.key ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200 hover:border-indigo-300"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100">
                    {error}
                </div>
            )}

            {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>}
            {!hasCompany && <p className="text-sm text-gray-600 dark:text-gray-400">No company context. Please log in again.</p>}

            {activeTab === "assurant" && (
                <div className="space-y-4">
                    {assurant.length === 0 && <p className="text-sm text-gray-600 dark:text-gray-400">No Assurant data.</p>}
                    {[...assurant]
                        .sort((a, b) => {
                            const total = (s: StoreAssurantSummary) => ["claims", "pendings", "returns", "success"].reduce((t, k) => t + ((s.statusResponse as any)[k]?.length || 0), 0);
                            return total(b) - total(a);
                        })
                        .map((store) => {
                            const storeId = store.store.dealerStoreId;
                            const total = ["claims", "pendings", "returns", "success"].reduce((t, k) => t + ((store.statusResponse as any)[k]?.length || 0), 0);
                            const expanded = Boolean(expandedAssurant[storeId]);
                            return (
                                <div key={storeId} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 shadow-sm">
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                                        onClick={() => setExpandedAssurant((prev) => ({ ...prev, [storeId]: !expanded }))}
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{store.store.storeName} ({storeId})</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Assurant claim lifecycle by status.</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-semibold">
                                            {total} total
                                        </span>
                                    </button>
                                    {expanded && (
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                                            {["claims", "pendings", "returns", "success"].map((bucket) => (
                                                <div key={bucket} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-900/50">
                                                    <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">{bucket}</p>
                                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{(store.statusResponse as any)[bucket]?.length || 0}</p>
                                                </div>
                                            ))}
                                            <div className="md:col-span-4 overflow-x-auto">
                                                <table className="min-w-full text-sm mt-3">
                                                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left">Bucket</th>
                                                            <th className="px-3 py-2 text-left">IMEI</th>
                                                            <th className="px-3 py-2 text-left">Claimed</th>
                                                            <th className="px-3 py-2 text-left">Received</th>
                                                            <th className="px-3 py-2 text-left">Label</th>
                                                            <th className="px-3 py-2 text-left">Returned</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                        {["claims", "pendings", "returns", "success"].flatMap((bucket) => {
                                                            const items = (store.statusResponse as any)[bucket] || [];
                                                            if (!items.length) {
                                                                return [{ bucket, imei: "—", claimedDate: "—", receivedDate: "—", labelCreatedDate: "—", returnedDate: "—" }];
                                                            }
                                                            return items.map((item: any) => ({
                                                                bucket,
                                                                imei: item.imei,
                                                                claimedDate: item.claimedDate,
                                                                receivedDate: item.receivedDate || "—",
                                                                labelCreatedDate: item.labelCreatedDate || "—",
                                                                returnedDate: item.returnedDate || "—",
                                                            }));
                                                        }).map((row, idx) => (
                                                            <tr key={`${storeId}-${row.bucket}-${row.imei}-${idx}`} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                                                                <td className="px-3 py-2 capitalize text-gray-700 dark:text-gray-200">{row.bucket}</td>
                                                                <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{row.imei}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatDateTime(row.claimedDate)}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatDateTime(row.receivedDate)}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatDateTime(row.labelCreatedDate)}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatDateTime(row.returnedDate)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}

            {activeTab === "customer" && (
                <div className="space-y-4">
                    {returns.length === 0 && <p className="text-sm text-gray-600 dark:text-gray-400">No customer returns.</p>}
                    {[...returns]
                        .sort((a, b) => (b.returnDevices?.length || 0) - (a.returnDevices?.length || 0))
                        .map((store) => {
                            const storeId = store.store.dealerStoreId;
                            const total = store.returnDevices?.length || 0;
                            const expanded = Boolean(expandedReturns[storeId]);
                            return (
                                <div key={storeId} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 shadow-sm">
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 text-left"
                                        onClick={() => setExpandedReturns((prev) => ({ ...prev, [storeId]: !expanded }))}
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{store.store.storeName} ({storeId})</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Devices returned by customers (store view).</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-semibold">
                                            {total} total
                                        </span>
                                    </button>
                                    {expanded && (
                                        <div className="overflow-x-auto p-4">
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left">IMEI</th>
                                                        <th className="px-3 py-2 text-left">Phone</th>
                                                        <th className="px-3 py-2 text-left">PIN</th>
                                                        <th className="px-3 py-2 text-left">Activated</th>
                                                        <th className="px-3 py-2 text-left">Returned</th>
                                                        <th className="px-3 py-2 text-left">Employee</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {store.returnDevices.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-3 py-3 text-center text-gray-500 dark:text-gray-400">No devices.</td>
                                                        </tr>
                                                    ) : (
                                                        store.returnDevices.map((item) => (
                                                            <tr key={`${storeId}-${item.imei}`} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                                                                <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{item.imei}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{item.phoneNumber}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{item.accountPin}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatDateTime(item.activatedDate)}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatDateTime(item.returnedDate)}</td>
                                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{item.employeeNtid}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
