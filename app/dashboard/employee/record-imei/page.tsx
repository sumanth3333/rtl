"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/api/apiClient";
import { useEmployee } from "@/hooks/useEmployee";

export default function ImeiManagement() {
    // --- STATE ---
    const { employee, store } = useEmployee();

    const [step, setStep] = useState(1);
    const [imei1, setImei1] = useState("");
    const [imei2, setImei2] = useState("");

    // Device type selection
    const [deviceType, setDeviceType] = useState<"TABLET" | "PHONE">("TABLET");

    // Reason should start empty so user must choose before "Used"
    const [usageReason, setUsageReason] = useState<
        "" | "PRE_ACTIVATION" | "RELEASE_IMEI" | "FREE_LINE"
    >("");

    type UsageReason = "" | "PRE_ACTIVATION" | "RELEASE_IMEI" | "FREE_LINE";

    interface InProgressImei {
        imei: number;
        fetchedBy: string;
        fetchedAt: string;   // looks like store ID in your payload
        fetchedDate: string; // "YYYY-MM-DD"
    }

    // ⬇️ Add these in your state block
    const [inProgress, setInProgress] = useState<InProgressImei[]>([]);
    const [rowReasons, setRowReasons] = useState<Record<string, UsageReason>>({});
    const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});

    // UX messages
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Split loading flags
    const [loading, setLoading] = useState(false);           // save/register only
    const [fetchLoading, setFetchLoading] = useState(false); // fetch only
    const [usedLoading, setUsedLoading] = useState(false);   // mark used
    const [notUsedLoading, setNotUsedLoading] = useState(false); // not used

    // The reserved / fetched IMEI (locks the page for next fetch until resolved)
    const [fetchedImei, setFetchedImei] = useState<string>(() => {
        if (typeof window === "undefined") { return ""; }
        return localStorage.getItem("reservedImei") || "";
    });

    // A quick helper to know if the page is “locked” by a reservation
    const hasActiveReservation = Boolean(fetchedImei);

    // --- EFFECTS: keep reservation persisted ---
    useEffect(() => {
        if (typeof window === "undefined") { return; }
        if (fetchedImei) {
            localStorage.setItem("reservedImei", fetchedImei);
        } else {
            localStorage.removeItem("reservedImei");
        }
    }, [fetchedImei]);

    const employeeNtid = employee?.employeeNtid || "";
    const dealerStoreId = store?.dealerStoreId || "";
    // Step 1 → Step 2 (hide first, ask to re-enter)
    const handleProceed = () => {
        setMessage("");
        setError("");

        if (!imei1 || imei1.length < 14) {
            setError("Please enter a valid 15-digit IMEI.");
            return;
        }
        setStep(2);
    };

    const loadInProgress = async () => {
        if (!dealerStoreId) { return; }
        try {
            // GET /imei/fecthInProgressImeisInStore?dealerStoreId=...
            const res = await apiClient.get("/imei/fecthInProgressImeisInStore", {
                params: { dealerStoreId },
            });
            const list: InProgressImei[] = Array.isArray(res.data) ? res.data : [];
            setInProgress(list);

            // reset per-row reasons & loading flags
            const nextReasons: Record<string, UsageReason> = {};
            const nextLoading: Record<string, boolean> = {};
            for (const item of list) {
                nextReasons[String(item.imei)] = ""; // force user to pick each time
                nextLoading[String(item.imei)] = false;
            }
            setRowReasons(nextReasons);
            setRowLoading(nextLoading);
        } catch (err: any) {
            console.error("Failed to load in-progress IMEIs", err);
        }
    };

    const handleRowUsed = async (imei: number) => {
        const key = String(imei);
        const reason = rowReasons[key];
        if (!reason) {
            setError("Please select a reason for this IMEI.");
            return;
        }
        try {
            setRowLoading((m) => ({ ...m, [key]: true }));
            setMessage("");
            setError("");

            await apiClient.post("/imei/used", {
                imei,
                dealerStoreId,
                employeeNtid,
                usageReason: reason, // "PRE_ACTIVATION" | "RELEASE_IMEI" | "FREE_LINE"
            });

            setMessage(`✅ IMEI ${imei} marked as USED`);
            await loadInProgress(); // refresh list
        } catch (err: any) {
            setError(err?.response?.data?.message || `Failed to mark ${imei} as used`);
        } finally {
            setRowLoading((m) => ({ ...m, [key]: false }));
        }
    };

    const handleRowNotUsed = async (imei: number) => {
        const key = String(imei);
        try {
            setRowLoading((m) => ({ ...m, [key]: true }));
            setMessage("");
            setError("");

            // request-param or path version; using path version here:
            await apiClient.post("/imei/notUsed", null, {
                params: { imei },
            });

            setMessage(`ℹ️ IMEI ${imei} released (back to active)`);
            await loadInProgress(); // refresh list
        } catch (err: any) {
            setError(err?.response?.data?.message || `Failed to release ${imei}`);
        } finally {
            setRowLoading((m) => ({ ...m, [key]: false }));
        }
    };

    // Load when dealerStoreId becomes available
    useEffect(() => {
        loadInProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dealerStoreId]);

    // Register (Save) IMEI
    const handleSave = async () => {
        try {
            setLoading(true);
            setMessage("");
            setError("");

            if (imei1 !== imei2) {
                setError("IMEIs do not match. Please re-enter.");
                return;
            }
            if (imei2.length < 14) {
                setError("Please enter a valid 15-digit IMEI.");
                return;
            }

            await apiClient.post("/imei/register", {
                imei: Number(imei2),
                deviceType,
                employeeNtid: employee?.employeeNtid, // or however you store it
            });

            setMessage("✅ IMEI registered successfully.");

            // reset entry flow
            setStep(1);
            setImei1("");
            setImei2("");
        } catch (err: any) {
            console.error("❌ Register IMEI Error:", err);

            // Safely extract message from different possible backend shapes
            const backendMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                (typeof err?.response?.data === "string" ? err.response.data : null) ||
                err?.message ||
                "Failed to register IMEI";

            setError(backendMsg);
        } finally {
            setLoading(false);
        }
    };

    // Fetch an IMEI (reserve one). Only allow if none currently reserved.
    const handleFetch = async () => {
        try {
            if (hasActiveReservation) { return; }// already have one reserved

            setFetchLoading(true);
            setMessage("");
            setError("");
            setUsageReason(""); // force choosing reason after fetch

            const res = await apiClient.post("/imei/fetchImei", {
                employeeNtid: employee?.employeeNtid,
                dealerStoreId: store?.dealerStoreId,
                deviceType, // now included in fetch
            });

            const imeiVal = res?.data;
            if (imeiVal && String(imeiVal).length == 15) {
                // success: lock with reservation
                setFetchedImei(String(imeiVal));
                setMessage("✅ IMEI fetched and reserved");
            } else {
                // backend responded with a message (no stock)
                setFetchedImei(""); // stay unlocked so you can switch type and fetch again
                setMessage(res?.data || "No IMEIs available for the selected device type.");
            }
        } catch (err: any) {
            setFetchedImei(""); // keep unlocked on error
            setError(err?.response?.data?.message || "Failed to fetch IMEI");
        } finally {
            setFetchLoading(false);
        }
    };

    // Mark reserved IMEI as USED (requires reason)
    const handleUsed = async () => {
        if (!fetchedImei) {
            setError("No reserved IMEI to mark as used.");
            return;
        }
        if (!usageReason) {
            setError("Please select a Usage Reason before marking as used.");
            return;
        }

        try {
            setUsedLoading(true);
            setMessage("");
            setError("");

            await apiClient.post("/imei/used", {
                imei: Number(fetchedImei),
                dealerStoreId: store?.dealerStoreId,
                employeeNtid: employee?.employeeNtid,
                usageReason, // "PRE_ACTIVATION" | "RELEASE_IMEI" | "FREE_LINE"
            });

            setMessage("✅ IMEI marked as USED");
            setFetchedImei(""); // unlock for next fetch
            setUsageReason("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to mark IMEI as used");
        } finally {
            setUsedLoading(false);
        }
    };

    // Mark as NOT USED (release reservation back to active) — request param style
    const handleNotUsed = async () => {
        if (!fetchedImei) { return; }

        try {
            setNotUsedLoading(true);
            setMessage("");
            setError("");

            await apiClient.post("/imei/notUsed", null, {
                params: { imei: Number(fetchedImei) },
            });

            setMessage("ℹ️ IMEI released (back to active)");
            setFetchedImei("");  // unlock for next fetch
            setUsageReason("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to release IMEI");
        } finally {
            setNotUsedLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-10 px-4 sm:px-6">
            <div className="mx-auto max-w-5xl">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">IMEI Management</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Register and manage IMEIs with confidence. All actions are logged and validated.
                        </p>
                    </div>

                    {/* Global Loading Pill */}
                    {loading && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:ring-blue-800">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                            </svg>
                            Working…
                        </div>
                    )}
                </div>

                {/* Grid: Left = Register, Right = Fetch */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Register IMEI */}
                    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Register IMEI</h2>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                Enter the IMEI twice to prevent copy & paste errors. Device type is required.
                            </p>
                        </div>

                        <div className="px-5 py-5 space-y-5">
                            {/* Device Type */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Device Type</label>
                                <div className="relative">
                                    <select
                                        value={deviceType}
                                        onChange={(e) => setDeviceType(e.target.value as "TABLET" | "PHONE")}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none ring-0 transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400"
                                    >
                                        <option value="TABLET">TABLET</option>
                                        <option value="PHONE">PHONE</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stepper */}
                            <div className="flex items-center gap-3 text-xs">
                                <span className={`inline-flex h-6 items-center rounded-full px-2 font-medium ${step === 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                                    1. Enter
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className={`inline-flex h-6 items-center rounded-full px-2 font-medium ${step === 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                                    2. Re-enter
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="inline-flex h-6 items-center rounded-full bg-gray-100 px-2 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    3. Save
                                </span>
                            </div>

                            {/* Step 1: Enter */}
                            {step === 1 && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter IMEI</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={imei1}
                                        onChange={(e) => setImei1(e.target.value.slice(0, 15))}
                                        className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400"
                                        placeholder="Enter 15-digit IMEI"
                                    />

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleProceed}
                                            disabled={!imei1 || imei1.length < 15 || loading}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Re-enter */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Re-enter IMEI</label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={imei2}
                                            onChange={(e) => setImei2(e.target.value.slice(0, 15))}
                                            onPaste={(e) => e.preventDefault()}
                                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400"
                                            placeholder="Re-enter 15-digit IMEI"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Paste is disabled here to ensure manual verification.</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                                        >
                                            Back
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={loading || imei2.length < 15}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loading ? "Saving…" : "Save"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Fetch IMEI */}
                    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Fetch IMEI</h2>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                Fetch reserves an IMEI. Confirm as <em>Used</em> or release as <em>Not Used</em>.
                            </p>
                        </div>

                        <div className="px-5 py-5 space-y-5">

                            {/* Device Type — allow changing even when reserved? Usually you should lock it while a reservation exists to avoid confusion. */}
                            <select
                                value={deviceType}
                                onChange={(e) => setDeviceType(e.target.value as "TABLET" | "PHONE")}
                                disabled={hasActiveReservation} // optional: lock while reserved
                                className="w-full border rounded-md p-2"
                            >
                                <option value="TABLET">TABLET</option>
                                <option value="PHONE">PHONE</option>
                            </select>

                            {/* Fetch IMEI */}
                            <button
                                type="button"
                                onClick={handleFetch}
                                disabled={fetchLoading || hasActiveReservation} // 🔒 block while one is reserved
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {fetchLoading ? "Fetching..." : "Fetch IMEI"}
                            </button>

                            {/* Fetch is locked notice */}
                            {hasActiveReservation && !fetchedImei && (
                                <p className="mt-2 text-sm text-amber-600">
                                    You have an active reservation. Resolve it before fetching another.
                                </p>
                            )}

                            {/* Fetched section */}
                            {fetchedImei && (
                                <div className="mt-4 border p-3 rounded-md">
                                    <p className="font-mono text-gray-700 dark:text-gray-300">
                                        Fetched IMEI: {fetchedImei}
                                    </p>

                                    {/* Usage Reason (required) */}
                                    <div className="mt-3">
                                        <label className="block text-sm mb-1">Usage Reason</label>
                                        <select
                                            value={usageReason}
                                            onChange={(e) =>
                                                setUsageReason(
                                                    e.target.value as "" | "PRE_ACTIVATION" | "RELEASE_IMEI" | "FREE_LINE"
                                                )
                                            }
                                            className="w-full border rounded-md p-2"
                                        >
                                            <option value="">-- Select a reason --</option>
                                            <option value="PRE_ACTIVATION">Releasing Preact</option>
                                            <option value="RELEASE_IMEI">Releasing a device to reactivate</option>
                                            <option value="FREE_LINE">Activating a Free Line</option>
                                        </select>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={handleUsed}
                                            disabled={usedLoading || !usageReason || !fetchedImei}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {usedLoading ? "Saving..." : "Mark as Used"}
                                        </button>
                                        <button
                                            onClick={handleNotUsed}
                                            disabled={notUsedLoading || !fetchedImei}
                                            className="border border-gray-300 px-4 py-2 rounded-md disabled:opacity-50"
                                        >
                                            {notUsedLoading ? "Releasing..." : "Not Used"}
                                        </button>
                                    </div>
                                </div>
                            )}



                        </div>
                    </section>

                    {/* In-Progress (Reserved) IMEIs */}
                    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 mt-6">
                        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">In-Progress IMEIs</h2>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                IMEIs currently reserved in this store. Mark as <em>Used</em> or release as <em>Not Used</em>.
                            </p>
                        </div>

                        <div className="px-5 py-5">
                            {inProgress.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">No in-progress IMEIs.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-950">
                                                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">IMEI</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Fetched By</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Store</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Reason</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {inProgress.map((row) => {
                                                const key = String(row.imei);
                                                const busy = rowLoading[key];
                                                return (
                                                    <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-950/50">
                                                        <td className="px-4 py-2 font-mono text-gray-900 dark:text-gray-100">{row.imei}</td>
                                                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{row.fetchedBy}</td>
                                                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{row.fetchedAt}</td>
                                                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{row.fetchedDate}</td>
                                                        <td className="px-4 py-2">
                                                            <select
                                                                value={rowReasons[key] ?? ""}
                                                                onChange={(e) =>
                                                                    setRowReasons((m) => ({ ...m, [key]: e.target.value as UsageReason }))
                                                                }
                                                                className="w-full rounded-md border border-gray-300 p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                                                            >
                                                                <option value="">-- Select reason --</option>
                                                                <option value="PRE_ACTIVATION">PRE_ACTIVATION</option>
                                                                <option value="RELEASE_IMEI">RELEASE_IMEI</option>
                                                                <option value="FREE_LINE">FREE_LINE</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleRowUsed(row.imei)}
                                                                    disabled={busy || !rowReasons[key]}
                                                                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 disabled:opacity-50"
                                                                >
                                                                    {busy ? "Saving..." : "Used"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRowNotUsed(row.imei)}
                                                                    disabled={busy}
                                                                    className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900 disabled:opacity-50"
                                                                >
                                                                    {busy ? "Releasing..." : "Not Used"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* Messages / Alerts */}
                <div className="mt-6 space-y-3">
                    {message && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-100 dark:ring-emerald-900">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-100 dark:ring-red-900">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}