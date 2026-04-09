"use client";

import { useEffect, useMemo, useRef, useState, ChangeEvent, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import {
    fetchAssurantStatuses,
    receiveAssurantDevice,
    returnAssurantDevice,
    saveAssurantClaim,
    uploadAssurantReturnLabel,
    isAuthorizedForAssurant,
} from "@/services/assurantService";
import { fetchCustomerReturns, saveCustomerReturn } from "@/services/customerReturnService";
import {
    AssurantStatusResponse,
    AssurantDeviceStatus,
} from "@/types/assurant";
import { CustomerReturnItem } from "@/types/customerReturn";

type ActionState = { imei: string; type: "receive" | "label" | "return" | "claim" } | null;
type CustomerActionState = { imei: string; type: "customerSave" } | null;
type Tab = "assurant" | "customer";

const formatDateTime = (val?: string) => val || "—";
const sanitizeImei = (val: string) => val.replace(/\D/g, "").slice(0, 15);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 15);

export default function EmployeeClaimsReturnsPage() {
    const { store, employee } = useEmployee();
    const dealerStoreId = store?.dealerStoreId;
    const employeeNtid = employee?.employeeNtid || "";

    const [data, setData] = useState<AssurantStatusResponse>({ claims: [], pendings: [], returns: [], success: [] });
    const [customerReturns, setCustomerReturns] = useState<CustomerReturnItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState<ActionState>(null);
    const [customerAction, setCustomerAction] = useState<CustomerActionState>(null);
    const [error, setError] = useState<string | null>(null);
    const [assurantMessage, setAssurantMessage] = useState<string | null>(null);
    const [customerMessage, setCustomerMessage] = useState<string | null>(null);
    const [newClaimImei, setNewClaimImei] = useState("");
    const [receiveInputs, setReceiveInputs] = useState<Record<string, { claimed: string; received: string }>>({});
    const [returnInputs, setReturnInputs] = useState<Record<string, string>>({});
    const [assurantAuthorized, setAssurantAuthorized] = useState<boolean | null>(null);
    const [customerForm, setCustomerForm] = useState({
        imei: "",
        deviceName: "",
        phoneNumber: "",
        accountPin: "",
        activatedDate: "",
    });
    const [activeTab, setActiveTab] = useState<Tab>("assurant");

    const labelFileInput = useRef<HTMLInputElement | null>(null);
    const [labelTargetImei, setLabelTargetImei] = useState<string | null>(null);

    const hasStore = useMemo(() => Boolean(dealerStoreId), [dealerStoreId]);

    const loadData = async () => {
        if (!dealerStoreId) { return; }
        setLoading(true);
        setError(null);
        try {
            const resp = await fetchAssurantStatuses(dealerStoreId);
            setData(resp);
            // hydrate default inputs
            const receiveMap: Record<string, { claimed: string; received: string }> = {};
            resp.claims.forEach((item) => { receiveMap[item.imei] = { claimed: item.imei, received: "" }; });
            setReceiveInputs(receiveMap);
            const returnMap: Record<string, string> = {};
            resp.returns.forEach((item) => { returnMap[item.imei] = item.imei; });
            setReturnInputs(returnMap);
            const customerList = await fetchCustomerReturns(dealerStoreId);
            setCustomerReturns(customerList);
        } catch (err: any) {
            setError(err?.message || "Failed to load devices.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dealerStoreId]);

    useEffect(() => {
        const checkAuth = async () => {
            if (!employeeNtid) { setAssurantAuthorized(false); return; }
            try {
                const ok = await isAuthorizedForAssurant(employeeNtid);
                setAssurantAuthorized(ok);
            } catch {
                setAssurantAuthorized(false);
            }
        };
        checkAuth();
    }, [employeeNtid]);

    const handleReceive = async (row: AssurantDeviceStatus) => {
        if (!employeeNtid) { setError("Employee NTID missing."); return; }
        const payload = receiveInputs[row.imei] || { claimed: row.imei, received: "" };
        if (!payload.received?.trim()) {
            setError("Enter the received device IMEI.");
            return;
        }
        setAction({ imei: row.imei, type: "receive" });
        setAssurantMessage(null);
        setError(null);
        try {
            await receiveAssurantDevice({
                employeeNtid,
                claimedImei: payload.claimed,
                receivedImei: payload.received,
            });
            setAssurantMessage(`Received IMEI ${row.imei}`);
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Receive failed.");
        } finally {
            setAction(null);
        }
    };

    const handleReturn = async (row: AssurantDeviceStatus) => {
        if (!employeeNtid) { setError("Employee NTID missing."); return; }
        const returnedImei = returnInputs[row.imei] || row.imei;
        setAction({ imei: row.imei, type: "return" });
        setAssurantMessage(null);
        setError(null);
        try {
            await returnAssurantDevice({ employeeNtid, returnedImei });
            setAssurantMessage(`Marked returned ${row.imei}`);
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Return failed.");
        } finally {
            setAction(null);
        }
    };

    const handleLabelUploadClick = (imei: string) => {
        setLabelTargetImei(imei);
        labelFileInput.current?.click();
    };

    const handleLabelFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const imei = labelTargetImei;
        if (!file || !imei || !employeeNtid) { return; }
        setAction({ imei, type: "label" });
        setAssurantMessage(null);
        setError(null);
        try {
            await uploadAssurantReturnLabel(file, { returningImei: imei, employeeNtid });
            setAssurantMessage(`Label uploaded for ${imei}`);
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Label upload failed.");
        } finally {
            setAction(null);
            setLabelTargetImei(null);
            if (labelFileInput.current) { labelFileInput.current.value = ""; }
        }
    };

    const handleNewClaim = async () => {
        if (!dealerStoreId || !employeeNtid || !newClaimImei.trim()) { return; }
        setAction({ imei: newClaimImei.trim(), type: "claim" });
        setAssurantMessage(null);
        setError(null);
        try {
            const imei = sanitizeImei(newClaimImei);
            await saveAssurantClaim({ dealerStoreId, employeeNtid, imei });
            setAssurantMessage(`Claim created for ${imei}`);
            setNewClaimImei("");
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Create claim failed.");
        } finally {
            setAction(null);
        }
    };

    const openPdf = (base64?: string) => {
        if (!base64) { return; }
        try {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
        } catch (err) {
            setError("Could not open label PDF.");
        }
    };

    const handleCustomerReturnSave = async () => {
        if (!dealerStoreId || !employeeNtid) { setError("Missing store or employee."); return; }
        if (!customerForm.imei || !customerForm.deviceName || !customerForm.phoneNumber || !customerForm.accountPin || !customerForm.activatedDate) {
            setError("All customer return fields are required.");
            return;
        }
        setCustomerAction({ imei: customerForm.imei, type: "customerSave" });
        setError(null);
        setCustomerMessage(null);
        try {
            await saveCustomerReturn({
                dealerStoreId,
                employeeNtid,
                imei: sanitizeImei(customerForm.imei),
                deviceName: customerForm.deviceName,
                phoneNumber: sanitizePhone(customerForm.phoneNumber),
                accountPin: customerForm.accountPin,
                activatedDate: customerForm.activatedDate,
            });
            setCustomerMessage("Customer return saved.");
            setCustomerForm({ imei: "", deviceName: "", phoneNumber: "", accountPin: "", activatedDate: "" });
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Failed to save customer return.");
        } finally {
            setCustomerAction(null);
        }
    };

    const bucket = (title: string, items: AssurantDeviceStatus[], emptyText: string, renderActions: (item: AssurantDeviceStatus) => ReactNode) => (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Assurant</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{items.length} item{items.length === 1 ? "" : "s"}</span>
            </div>
            {items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-600 dark:text-gray-400">{emptyText}</p>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items.map((item) => (
                        <div key={item.imei} className="px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">IMEI {item.imei}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span>Claimed: {formatDateTime(item.claimedDate)}</span>
                                    {item.receivedDate && <span>Received: {formatDateTime(item.receivedDate)}</span>}
                                    {item.labelCreatedDate && <span>Label: {formatDateTime(item.labelCreatedDate)}</span>}
                                    {item.returnedDate && <span>Returned: {formatDateTime(item.returnedDate)}</span>}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-end w-full md:w-auto">
                                {renderActions(item)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (!hasStore) {
        return (
            <div className="p-4 md:p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300">Store context missing. Please re-login.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Employee Portal</p>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Claims & Returns</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track Assurant device claims and customer returns.</p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">
                    Store: <span className="font-semibold text-gray-800 dark:text-gray-100">{store?.storeName}</span>
                </div>
            </header>

            <div className="flex gap-2 justify-center">
                {[
                    { key: "assurant", label: "Assurant Claims" },
                    { key: "customer", label: "Customer Returns" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as Tab)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                            activeTab === tab.key
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200 hover:border-indigo-300"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "assurant" && (
                <>
                    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Create new claim</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="IMEI"
                                    value={newClaimImei}
                                    onChange={(e) => setNewClaimImei(sanitizeImei(e.target.value))}
                                    maxLength={15}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                />
                                <Button
                                    onClick={handleNewClaim}
                                    disabled={!newClaimImei.trim() || !employeeNtid || !dealerStoreId || (action?.type === "claim")}
                                >
                                    {action?.type === "claim" ? "Saving..." : "Save Claim"}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Uses your NTID: {employeeNtid || "N/A"}</p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Data auto-refreshes after each action.
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100">
                            {error}
                        </div>
                    )}
                    {assurantMessage && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
                            {assurantMessage}
                        </div>
                    )}

                    {loading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading status...</p>}

                    <div className="grid grid-cols-1 gap-4">
                        {bucket("Claims (awaiting receive)", data.claims, "No open claims.", (item) => (
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                            type="text"
                            value={receiveInputs[item.imei]?.claimed || item.imei}
                            readOnly
                            className="w-40 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            title="Claimed device IMEI (auto-filled)"
                        />
                        <input
                            type="text"
                            value={receiveInputs[item.imei]?.received || ""}
                            onChange={(e) => setReceiveInputs((prev) => ({ ...prev, [item.imei]: { ...(prev[item.imei] || { claimed: item.imei }), received: sanitizeImei(e.target.value) } }))}
                            maxLength={15}
                            className="w-44 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            placeholder="Scan/enter received device IMEI"
                        />
                        <Button
                            onClick={() => handleReceive(item)}
                            disabled={action?.type === "receive" && action.imei === item.imei}
                            className="px-3 py-2 text-xs"
                        >
                            {action?.type === "receive" && action.imei === item.imei ? "Receiving..." : "Receive"}
                        </Button>
                    </div>
                ))}

                        {bucket("Pending (label not created)", data.pendings, "No pending devices.", (item) => (
                            assurantAuthorized ? (
                                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                    <Button
                                        onClick={() => handleLabelUploadClick(item.imei)}
                                        disabled={action?.type === "label" && action.imei === item.imei}
                                        className="px-3 py-2 text-xs"
                                    >
                                        {action?.type === "label" && action.imei === item.imei ? "Uploading..." : "Upload Return Label PDF"}
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-amber-600 dark:text-amber-300">Not authorized to create return labels. Please contact your immediate manager.</p>
                            )
                        ))}

                        {bucket("Ready for return (label created)", data.returns, "No devices ready for return.", (item) => (
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                <Button variant="secondary" onClick={() => openPdf(item.viewLablel)} className="px-3 py-2 text-xs">
                                    View Label
                                </Button>
                                <input
                                    type="text"
                                    value={returnInputs[item.imei] || item.imei}
                                    onChange={(e) => setReturnInputs((prev) => ({ ...prev, [item.imei]: sanitizeImei(e.target.value) }))}
                                    maxLength={15}
                                    className="w-36 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="Return IMEI"
                                />
                                <Button
                                    onClick={() => handleReturn(item)}
                                    disabled={action?.type === "return" && action.imei === item.imei}
                                    className="px-3 py-2 text-xs"
                                >
                                    {action?.type === "return" && action.imei === item.imei ? "Marking..." : "Mark Returned"}
                                </Button>
                            </div>
                        ))}

                        {bucket("Successful returns", data.success, "No completed returns.", (item) => (
                            <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-300">Completed</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === "customer" && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/70 shadow-sm p-4 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Customer Returns</p>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Log a customer return</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Save the device details and track return status.</p>
                    </div>
                </div>

                {customerMessage && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
                        {customerMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-300">IMEI (15 digits)</label>
                        <input
                            type="text"
                            maxLength={15}
                            value={customerForm.imei}
                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, imei: sanitizeImei(e.target.value) }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-300">Device Name</label>
                        <input
                            type="text"
                            value={customerForm.deviceName}
                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, deviceName: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-300">Phone Number</label>
                        <input
                            type="text"
                            maxLength={15}
                            value={customerForm.phoneNumber}
                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, phoneNumber: sanitizePhone(e.target.value) }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-300">Account PIN</label>
                        <input
                            type="text"
                            value={customerForm.accountPin}
                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, accountPin: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-300">Activated Date</label>
                        <input
                            type="date"
                            value={customerForm.activatedDate}
                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, activatedDate: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={handleCustomerReturnSave}
                            disabled={customerAction !== null}
                            className="w-full"
                        >
                            {customerAction ? "Saving..." : "Save Return"}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-left">IMEI</th>
                                <th className="px-3 py-2 text-left">Device</th>
                                <th className="px-3 py-2 text-left">Phone</th>
                                <th className="px-3 py-2 text-left">PIN</th>
                                <th className="px-3 py-2 text-left">Activated</th>
                                <th className="px-3 py-2 text-left">Returned</th>
                                <th className="px-3 py-2 text-left">Employee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {customerReturns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                        No customer returns logged.
                                    </td>
                                </tr>
                            ) : (
                                customerReturns.map((item) => (
                                    <tr key={item.imei} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                                        <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{item.imei}</td>
                                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{item.deviceName}</td>
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
            </div>

            )}

            <input
                type="file"
                accept="application/pdf"
                ref={labelFileInput}
                className="hidden"
                onChange={handleLabelFileChange}
            />
        </div>
    );
}
