"use client";

import { useEffect, useState } from "react";
import { Inbox, Search } from "lucide-react";

import {
    fetchContactRequestsByCompany,
    fetchInProgressContactRequests,
    fetchNewContactRequests,
    fetchNotResolvedContactRequests,
    fetchResolvedContactRequests,
} from "@/services/admin/contactUsAdminService";
import { ContactRequest } from "@/types/contactUsTypes";
import { ApiError } from "@/services/api/errorHandler";
import { RequestTypeTag, SeverityBadge, StatusBadge } from "@/components/contactUs/badges";
import { ContactRequestDetailModal } from "@/components/admin/contactUs/ContactRequestDetailModal";

type Tab = "NEW" | "IN_PROGRESS" | "RESOLVED" | "NOT_RESOLVED" | "COMPANY";
type CountableTab = Exclude<Tab, "COMPANY">;

const TABS: { label: string; value: Tab }[] = [
    { label: "New", value: "NEW" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Not Resolved", value: "NOT_RESOLVED" },
    { label: "By Company", value: "COMPANY" },
];

const formatDateTime = (value?: string | null) => {
    if (!value) { return "—"; }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) { return value; }
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminContactUsPage() {
    const [tab, setTab] = useState<Tab>("NEW");
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [companyIdInput, setCompanyIdInput] = useState("");
    const [companyIdSearched, setCompanyIdSearched] = useState<number | null>(null);
    const [selected, setSelected] = useState<ContactRequest | null>(null);
    const [counts, setCounts] = useState<Partial<Record<CountableTab, number>>>({});

    const loadCounts = async () => {
        const [newR, inProgR, resR, notResR] = await Promise.allSettled([
            fetchNewContactRequests(),
            fetchInProgressContactRequests(),
            fetchResolvedContactRequests(),
            fetchNotResolvedContactRequests(),
        ]);
        setCounts((prev) => ({
            NEW: newR.status === "fulfilled" ? newR.value.length : prev.NEW,
            IN_PROGRESS: inProgR.status === "fulfilled" ? inProgR.value.length : prev.IN_PROGRESS,
            RESOLVED: resR.status === "fulfilled" ? resR.value.length : prev.RESOLVED,
            NOT_RESOLVED: notResR.status === "fulfilled" ? notResR.value.length : prev.NOT_RESOLVED,
        }));
    };

    const load = () => {
        if (tab === "COMPANY") {
            if (companyIdSearched === null) {
                setRequests([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            fetchContactRequestsByCompany(companyIdSearched)
                .then(setRequests)
                .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load requests for this company."))
                .finally(() => setLoading(false));
            return;
        }

        const fetcher = {
            NEW: fetchNewContactRequests,
            IN_PROGRESS: fetchInProgressContactRequests,
            RESOLVED: fetchResolvedContactRequests,
            NOT_RESOLVED: fetchNotResolvedContactRequests,
        }[tab];

        setLoading(true);
        setError(null);
        fetcher()
            .then(setRequests)
            .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load requests."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, companyIdSearched]);

    useEffect(() => {
        loadCounts();
    }, []);

    const handleCompanySearch = () => {
        const id = Number(companyIdInput);
        if (!Number.isInteger(id) || id <= 0) { return; }
        setCompanyIdSearched(id);
    };

    const handleUpdated = (updated: ContactRequest) => {
        setSelected(updated);
        // The ticket likely moved out of the currently viewed queue (e.g. New -> In Progress),
        // so refresh the list behind the modal (and every tab's count) rather than trying to
        // patch them in place.
        load();
        loadCounts();
    };

    return (
        <div className="p-3 md:p-6 space-y-4 max-w-4xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Support Requests</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Contact-us submissions from employees and company owners.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden text-xs font-medium">
                    {TABS.map((t) => {
                        const count = t.value === "COMPANY" ? undefined : counts[t.value];
                        const isActive = tab === t.value;
                        return (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setTab(t.value)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 transition-colors ${isActive
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {t.label}
                                {typeof count === "number" && (
                                    <span
                                        className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${isActive
                                            ? "bg-white/25 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {tab === "COMPANY" && (
                <div className="flex items-end gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-3">
                    <label className="flex flex-col gap-1 text-xs">
                        <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company ID</span>
                        <input
                            type="number"
                            min={1}
                            value={companyIdInput}
                            onChange={(e) => setCompanyIdInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { handleCompanySearch(); } }}
                            placeholder="e.g. 11"
                            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-2.5 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={handleCompanySearch}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                        <Search className="w-3.5 h-3.5" /> Search
                    </button>
                </div>
            )}

            {error && (
                <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[76px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ))
                ) : tab === "COMPANY" && companyIdSearched === null ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                        Enter a company ID to see its full request history.
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                        No requests here.
                    </div>
                ) : (
                    requests.map((req) => (
                        <button
                            key={req.requestId}
                            type="button"
                            onClick={() => setSelected(req)}
                            className="w-full text-left block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors p-3.5 shadow-sm"
                        >
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <StatusBadge status={req.status} />
                                <SeverityBadge severity={req.severity} />
                                <RequestTypeTag type={req.requestType} />
                                <span className="text-xs text-gray-400 dark:text-gray-500">#{req.requestId}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{req.requesterName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{req.concern}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{req.companyName ?? "—"}</span>
                                <span>Requested: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(req.requestedAt)}</span></span>
                                {req.assignedAdminUsername && <span>Assigned: <span className="font-medium text-gray-700 dark:text-gray-300">{req.assignedAdminUsername}</span></span>}
                            </div>
                        </button>
                    ))
                )}
            </div>

            {selected && (
                <ContactRequestDetailModal
                    request={selected}
                    onClose={() => { setSelected(null); load(); }}
                    onUpdated={handleUpdated}
                />
            )}
        </div>
    );
}
