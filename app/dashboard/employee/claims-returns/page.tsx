"use client";

import { useEffect, useMemo, useRef, useState, ChangeEvent, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import { useEmployee } from "@/hooks/useEmployee";
import {
    PortalCard,
    PortalHeading,
    PortalInput,
    PortalSelect,
    PortalStatTile,
    PortalTabs,
} from "@/components/employee/claims-returns/portalUI";
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
type AssurantBucketKey = "claims" | "pendings" | "returns" | "success";

const formatDateTime = (val?: string) => val || "—";
const sanitizeImei = (val: string) => val.replace(/\D/g, "").slice(0, 15);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 15);
const formatCurrency = (val?: number | null) => (typeof val === "number" ? `$${val.toFixed(2)}` : "—");

const BUCKET_THEME: Record<AssurantBucketKey, { chip: string; card: string; border: string; empty: string }> = {
    claims: {
        chip: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-800",
        card: "from-sky-50/70 to-white dark:from-sky-950/20 dark:to-gray-950/80",
        border: "border-sky-200 dark:border-sky-900/40",
        empty: "text-sky-700/80 dark:text-sky-300/80",
    },
    pendings: {
        chip: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
        card: "from-amber-50/70 to-white dark:from-amber-950/20 dark:to-gray-950/80",
        border: "border-amber-200 dark:border-amber-900/40",
        empty: "text-amber-700/80 dark:text-amber-300/80",
    },
    returns: {
        chip: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-800",
        card: "from-violet-50/70 to-white dark:from-violet-950/20 dark:to-gray-950/80",
        border: "border-violet-200 dark:border-violet-900/40",
        empty: "text-violet-700/80 dark:text-violet-300/80",
    },
    success: {
        chip: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800",
        card: "from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-gray-950/80",
        border: "border-emerald-200 dark:border-emerald-900/40",
        empty: "text-emerald-700/80 dark:text-emerald-300/80",
    },
};

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
    const [newClaimCustomerName, setNewClaimCustomerName] = useState("");
    const [newClaimCustomerNumber, setNewClaimCustomerNumber] = useState("");
    const [receiveInputs, setReceiveInputs] = useState<Record<string, { claimed: string; received: string }>>({});
    const [returnInputs, setReturnInputs] = useState<Record<string, string>>({});
    const [assurantAuthorized, setAssurantAuthorized] = useState<boolean | null>(null);
    const [customerForm, setCustomerForm] = useState({
        imei: "",
        deviceName: "",
        phoneNumber: "",
        accountPin: "",
        activatedDate: "",
        amountRefunded: "",
        refundPaymentType: "" as "" | "cash" | "card",
    });
    const [activeTab, setActiveTab] = useState<Tab>("assurant");

    const labelFileInput = useRef<HTMLInputElement | null>(null);
    const [labelTargetImei, setLabelTargetImei] = useState<string | null>(null);

    const hasStore = useMemo(() => Boolean(dealerStoreId), [dealerStoreId]);
    const customerSummary = useMemo(() => {
        const total = customerReturns.length;
        const refundedOrders = customerReturns.filter((x) => typeof x.refundedAmount === "number").length;
        const refundedTotal = customerReturns.reduce((sum, x) => sum + (typeof x.refundedAmount === "number" ? x.refundedAmount : 0), 0);
        return { total, refundedOrders, refundedTotal };
    }, [customerReturns]);

    const loadData = async () => {
        if (!dealerStoreId) { return; }
        setLoading(true);
        setError(null);
        try {
            const resp = await fetchAssurantStatuses(dealerStoreId);
            setData(resp);
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
        if (!dealerStoreId || !employeeNtid || !newClaimImei.trim() || !newClaimCustomerName.trim() || !newClaimCustomerNumber.trim()) { return; }
        setAction({ imei: newClaimImei.trim(), type: "claim" });
        setAssurantMessage(null);
        setError(null);
        try {
            const imei = sanitizeImei(newClaimImei);
            await saveAssurantClaim({
                dealerStoreId,
                employeeNtid,
                imei,
                customerName: newClaimCustomerName.trim(),
                customerNumber: sanitizePhone(newClaimCustomerNumber),
            });
            setAssurantMessage(`Claim created for ${imei}`);
            setNewClaimImei("");
            setNewClaimCustomerName("");
            setNewClaimCustomerNumber("");
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
        } catch {
            setError("Could not open label PDF.");
        }
    };

    const handleCustomerReturnSave = async () => {
        if (!dealerStoreId || !employeeNtid) { setError("Missing store or employee."); return; }
        if (!customerForm.imei || !customerForm.deviceName || !customerForm.phoneNumber || !customerForm.accountPin || !customerForm.activatedDate) {
            setError("All customer return fields are required.");
            return;
        }
        const hasRefundAmount = customerForm.amountRefunded.trim().length > 0;
        const refundPaymentTypeValue: "cash" | "card" | null =
            customerForm.refundPaymentType === "cash" || customerForm.refundPaymentType === "card"
                ? customerForm.refundPaymentType
                : null;
        const hasPaymentType = refundPaymentTypeValue !== null;
        if (hasRefundAmount !== hasPaymentType) {
            setError("Refund amount and payment type must both be provided together.");
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
                amountRefunded: hasRefundAmount ? Number(customerForm.amountRefunded) : null,
                refundPaymentType: refundPaymentTypeValue,
            });
            setCustomerMessage("Customer return saved.");
            setCustomerForm({
                imei: "",
                deviceName: "",
                phoneNumber: "",
                accountPin: "",
                activatedDate: "",
                amountRefunded: "",
                refundPaymentType: "",
            });
            await loadData();
        } catch (err: any) {
            setError(err?.message || "Failed to save customer return.");
        } finally {
            setCustomerAction(null);
        }
    };

    const bucket = (key: AssurantBucketKey, title: string, items: AssurantDeviceStatus[], emptyText: string, renderActions: (item: AssurantDeviceStatus) => ReactNode) => (
        <div className={`rounded-3xl border bg-gradient-to-br ${BUCKET_THEME[key].card} ${BUCKET_THEME[key].border} shadow-sm overflow-hidden`}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-black/5 dark:border-white/10">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Assurant Workflow</p>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${BUCKET_THEME[key].chip}`}>
                    {items.length} item{items.length === 1 ? "" : "s"}
                </span>
            </div>
            {items.length === 0 ? (
                <p className={`px-4 py-7 text-sm ${BUCKET_THEME[key].empty}`}>{emptyText}</p>
            ) : (
                <div className="divide-y divide-black/5 dark:divide-white/10">
                    {items.map((item) => (
                        <div key={item.imei} className="px-4 py-4 flex flex-col gap-4">
                            <div className="space-y-3">
                                <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 break-all">IMEI {item.imei}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Customer:</span> {item.customerName || "—"}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Phone:</span> {item.customerNumber || item.customerPhoneNumber || "—"}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Claimed By:</span> {item.claimedBy || "—"}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Received By:</span> {item.receivedBy || "—"}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Claimed:</span> {formatDateTime(item.claimedDate)}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Received:</span> {formatDateTime(item.receivedDate)}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Label:</span> {formatDateTime(item.labelCreatedDate)}</p>
                                    <p className="rounded-lg border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/10 px-2.5 py-1.5 text-gray-700 dark:text-gray-300"><span className="font-semibold">Returned:</span> {formatDateTime(item.returnedDate)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-start w-full">
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
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
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

            <PortalTabs
                tabs={[
                    { key: "assurant", label: "Assurant Claims" },
                    { key: "customer", label: "Customer Returns" },
                ]}
                active={activeTab}
                onChange={setActiveTab}
            />

            {activeTab === "assurant" && (
                <>
                    <PortalCard tone="assurant" className="p-4 md:p-5">
                        <div className="flex flex-col gap-4">
                            <div className="space-y-3">
                                <PortalHeading eyebrow="Assurant Intake" title="Create New Claim" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <PortalStatTile label="Claims" value={data.claims.length} valueClassName="text-sky-700 dark:text-sky-300" />
                                    <PortalStatTile label="Pending" value={data.pendings.length} valueClassName="text-amber-700 dark:text-amber-300" />
                                    <PortalStatTile label="Returns" value={data.returns.length} valueClassName="text-violet-700 dark:text-violet-300" />
                                    <PortalStatTile label="Completed" value={data.success.length} valueClassName="text-emerald-700 dark:text-emerald-300" />
                                </div>
                            </div>
                            <div className="space-y-2 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                                    <PortalInput
                                        type="text"
                                        placeholder="IMEI"
                                        value={newClaimImei}
                                        onChange={(e) => setNewClaimImei(sanitizeImei(e.target.value))}
                                        maxLength={15}
                                    />
                                    <PortalInput
                                        type="text"
                                        placeholder="Customer Name"
                                        value={newClaimCustomerName}
                                        onChange={(e) => setNewClaimCustomerName(e.target.value)}
                                    />
                                    <PortalInput
                                        type="text"
                                        placeholder="Customer Number"
                                        value={newClaimCustomerNumber}
                                        onChange={(e) => setNewClaimCustomerNumber(sanitizePhone(e.target.value))}
                                        maxLength={15}
                                    />
                                    <Button
                                        onClick={handleNewClaim}
                                        disabled={!newClaimImei.trim() || !newClaimCustomerName.trim() || !newClaimCustomerNumber.trim() || !employeeNtid || !dealerStoreId || (action?.type === "claim")}
                                        className="rounded-xl !py-2.5 w-full"
                                    >
                                        {action?.type === "claim" ? "Saving..." : "Save Claim"}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">NTID: <span className="font-semibold">{employeeNtid || "N/A"}</span> • Auto-refresh runs after every action.</p>
                            </div>
                        </div>
                    </PortalCard>

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

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
                        {bucket("claims", "Claims (Awaiting Receive)", data.claims, "No open claims.", (item) => (
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 w-full md:w-auto">
                                <input
                                    type="text"
                                    value={receiveInputs[item.imei]?.claimed || item.imei}
                                    readOnly
                                    className="w-full md:w-40 rounded-md border border-gray-300 bg-gray-100 px-2 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    title="Claimed device IMEI (auto-filled)"
                                />
                                <input
                                    type="text"
                                    value={receiveInputs[item.imei]?.received || ""}
                                    onChange={(e) => setReceiveInputs((prev) => ({ ...prev, [item.imei]: { ...(prev[item.imei] || { claimed: item.imei }), received: sanitizeImei(e.target.value) } }))}
                                    maxLength={15}
                                    className="w-full md:w-44 rounded-md border border-gray-300 px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="Scan/enter received device IMEI"
                                />
                                <Button
                                    onClick={() => handleReceive(item)}
                                    disabled={action?.type === "receive" && action.imei === item.imei}
                                    className="px-3 py-2 text-xs w-full md:w-auto"
                                >
                                    {action?.type === "receive" && action.imei === item.imei ? "Receiving..." : "Receive"}
                                </Button>
                            </div>
                        ))}

                        {bucket("pendings", "Pending (Label Not Created)", data.pendings, "No pending devices.", (item) => (
                            assurantAuthorized ? (
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={() => handleLabelUploadClick(item.imei)}
                                        disabled={action?.type === "label" && action.imei === item.imei}
                                        className="px-3 py-2 text-xs w-full md:w-auto"
                                    >
                                        {action?.type === "label" && action.imei === item.imei ? "Uploading..." : "Upload Return Label PDF"}
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-amber-600 dark:text-amber-300">Not authorized to create return labels. Please contact your immediate manager.</p>
                            )
                        ))}

                        {bucket("returns", "Ready For Return (Label Created)", data.returns, "No devices ready for return.", (item) => (
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-2 w-full md:w-auto">
                                <Button variant="secondary" onClick={() => openPdf(item.viewLablel || item.viewLabel)} className="px-3 py-2 text-xs w-full md:w-auto">
                                    View Label
                                </Button>
                                <input
                                    type="text"
                                    value={returnInputs[item.imei] || item.imei}
                                    onChange={(e) => setReturnInputs((prev) => ({ ...prev, [item.imei]: sanitizeImei(e.target.value) }))}
                                    maxLength={15}
                                    className="w-full md:w-36 rounded-md border border-gray-300 px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="Return IMEI"
                                />
                                <Button
                                    onClick={() => handleReturn(item)}
                                    disabled={action?.type === "return" && action.imei === item.imei}
                                    className="px-3 py-2 text-xs w-full md:w-auto"
                                >
                                    {action?.type === "return" && action.imei === item.imei ? "Marking..." : "Mark Returned"}
                                </Button>
                            </div>
                        ))}

                        {bucket("success", "Successful Returns", data.success, "No completed returns.", () => (
                            <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-300">Completed</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === "customer" && (
                <PortalCard tone="customer" className="p-4 md:p-5 space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <PortalHeading eyebrow="Customer Returns" title="Log A Customer Return" description="Save the device details and track return status." />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <PortalStatTile label="Total Logged" value={customerSummary.total} />
                        <PortalStatTile label="Refunded Orders" value={customerSummary.refundedOrders} />
                        <PortalStatTile label="Refunded Total" value={formatCurrency(customerSummary.refundedTotal)} />
                    </div>

                    {customerMessage && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100">
                            {customerMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">IMEI (15 digits)</label>
                            <PortalInput
                                type="text"
                                maxLength={15}
                                value={customerForm.imei}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, imei: sanitizeImei(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">Device Name</label>
                            <PortalInput
                                type="text"
                                value={customerForm.deviceName}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, deviceName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">Phone Number</label>
                            <PortalInput
                                type="text"
                                maxLength={15}
                                value={customerForm.phoneNumber}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, phoneNumber: sanitizePhone(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">Account PIN</label>
                            <PortalInput
                                type="text"
                                value={customerForm.accountPin}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, accountPin: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">Activated Date</label>
                            <PortalInput
                                type="date"
                                value={customerForm.activatedDate}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, activatedDate: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">Refund Amount</label>
                            <PortalInput
                                type="number"
                                min="0"
                                step="0.01"
                                value={customerForm.amountRefunded}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, amountRefunded: e.target.value }))}
                                placeholder="e.g. 45"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600 dark:text-gray-300">Refund Payment Type</label>
                            <PortalSelect
                                value={customerForm.refundPaymentType}
                                onChange={(e) => setCustomerForm((prev) => ({ ...prev, refundPaymentType: e.target.value as "" | "cash" | "card" }))}
                            >
                                <option value="">Select payment type</option>
                                <option value="cash">cash</option>
                                <option value="card">card</option>
                            </PortalSelect>
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
                                    <th className="px-3 py-2 text-left">Refunded</th>
                                    <th className="px-3 py-2 text-left">Payment</th>
                                    <th className="px-3 py-2 text-left">Employee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {customerReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
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
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{formatCurrency(item.refundedAmount)}</td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{item.refundPaymentType || "—"}</td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{item.employeeNtid}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </PortalCard>
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
