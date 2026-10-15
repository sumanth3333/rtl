"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CloudCog, DollarSign, Receipt, Search, TrendingUp } from "lucide-react";

import {
    fetchAwsBillingInvoices,
    fetchAwsBillingOverview,
    fetchAwsBillingServices,
    fetchAwsBillingUsage,
} from "@/services/admin/awsBillingService";
import { ApiError } from "@/services/api/errorHandler";
import {
    AwsBillingInvoices,
    AwsBillingOverview,
    AwsInvoicePaymentStatus,
    AwsServicesBreakdown,
    AwsUsageBreakdown,
} from "@/types/awsBillingTypes";
import { StatTile } from "@/components/admin/monitoring/StatTile";
import { AwsServicesChart } from "@/components/admin/awsBilling/AwsServicesChart";
import { formatUsd } from "@/utils/formatUsd";

const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatPeriod = (start: string, endExclusive: string) => {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${endExclusive}T00:00:00`);
    endDate.setDate(endDate.getDate() - 1);
    const startLabel = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endLabel = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${startLabel} – ${endLabel}`;
};

const formatDateShort = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) { return value; }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatBillingPeriod = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    if (!year || !month) { return value; }
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const paymentStatusClasses: Record<AwsInvoicePaymentStatus, string> = {
    PAID: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
    UNPAID: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
    OVERDUE: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50",
    UNKNOWN: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

interface LoadErrors {
    overview?: string;
    services?: string;
    usage?: string;
    invoices?: string;
}

export default function AwsBillingPage() {
    const [month, setMonth] = useState(getCurrentMonth());

    const [overview, setOverview] = useState<AwsBillingOverview | null>(null);
    const [services, setServices] = useState<AwsServicesBreakdown | null>(null);
    const [usage, setUsage] = useState<AwsUsageBreakdown | null>(null);

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<LoadErrors>({});

    const [usageSearch, setUsageSearch] = useState("");
    const [hideZeroCostUsage, setHideZeroCostUsage] = useState(true);

    const [invoices, setInvoices] = useState<AwsBillingInvoices | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        Promise.allSettled([
            fetchAwsBillingOverview(month),
            fetchAwsBillingServices(month),
            fetchAwsBillingUsage(month),
            fetchAwsBillingInvoices(month),
        ]).then(([overviewResult, servicesResult, usageResult, invoicesResult]) => {
            if (cancelled) { return; }

            const nextErrors: LoadErrors = {};

            if (overviewResult.status === "fulfilled") {
                setOverview(overviewResult.value);
            } else {
                nextErrors.overview = overviewResult.reason instanceof ApiError
                    ? overviewResult.reason.message
                    : "Failed to load the billing overview.";
            }

            if (servicesResult.status === "fulfilled") {
                setServices(servicesResult.value);
            } else {
                nextErrors.services = servicesResult.reason instanceof ApiError
                    ? servicesResult.reason.message
                    : "Failed to load service costs.";
            }

            if (usageResult.status === "fulfilled") {
                setUsage(usageResult.value);
            } else {
                nextErrors.usage = usageResult.reason instanceof ApiError
                    ? usageResult.reason.message
                    : "Failed to load usage details.";
            }

            if (invoicesResult.status === "fulfilled") {
                setInvoices(invoicesResult.value);
            } else {
                nextErrors.invoices = invoicesResult.reason instanceof ApiError
                    ? invoicesResult.reason.message
                    : "Failed to load invoices.";
            }

            setErrors(nextErrors);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [month]);

    const sortedServices = useMemo(
        () => (services ? [...services.services].sort((a, b) => b.cost - a.cost) : []),
        [services]
    );

    const topService = sortedServices[0] ?? null;

    const filteredUsage = useMemo(() => {
        if (!usage) { return []; }
        const term = usageSearch.trim().toLowerCase();
        return usage.usage
            .filter((row) => !hideZeroCostUsage || row.cost > 0)
            .filter((row) => !term || row.serviceName.toLowerCase().includes(term) || row.usageType.toLowerCase().includes(term))
            .sort((a, b) => b.cost - a.cost);
    }, [usage, usageSearch, hideZeroCostUsage]);

    const monthProgress = overview && overview.forecastCost > 0
        ? Math.min(100, (overview.currentCost / overview.forecastCost) * 100)
        : 0;
    const progressTone = monthProgress >= 100
        ? "bg-rose-500"
        : monthProgress >= 90
            ? "bg-amber-500"
            : "bg-blue-500";

    return (
        <div className="p-3 md:p-6 space-y-5 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <CloudCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AWS Billing</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Monthly cost, service breakdown, and usage detail.
                        </p>
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Month</span>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => e.target.value && setMonth(e.target.value)}
                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </label>
            </div>

            <div className={loading ? "space-y-5 opacity-60 transition-opacity" : "space-y-5 transition-opacity"}>
                {overview?.estimated && (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{overview.message}</span>
                    </div>
                )}

                {errors.overview && (
                    <div className="rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                        {errors.overview}
                    </div>
                )}

                {overview && (
                    <>
                        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <StatTile
                                label={`Current Cost · ${formatPeriod(overview.periodStart, overview.periodEndExclusive)}`}
                                value={formatUsd(overview.currentCost)}
                                icon={DollarSign}
                                tone="info"
                            />
                            <StatTile
                                label="Forecasted Month-End"
                                value={formatUsd(overview.forecastCost)}
                                icon={TrendingUp}
                                tone="neutral"
                            />
                            <StatTile
                                label={topService ? `Top Service · ${topService.serviceName}` : "Top Service"}
                                value={topService ? formatUsd(topService.cost) : "—"}
                                icon={CloudCog}
                                tone="good"
                            />
                        </section>

                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm px-4 py-3.5 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Month Progress (current vs. forecast)
                                </p>
                                <p className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
                                    {monthProgress.toFixed(1)}%
                                </p>
                            </div>
                            <div className="h-1.5 rounded-full bg-blue-100 dark:bg-blue-950/40 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${progressTone}`}
                                    style={{ width: `${monthProgress}%` }}
                                />
                            </div>
                        </div>
                    </>
                )}

                <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cost by Service</h2>

                    {errors.services && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">{errors.services}</p>
                    )}

                    {services && <AwsServicesChart services={services.services} />}

                    {services && services.services.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                        <th className="py-2 pr-3 font-medium">Service</th>
                                        <th className="py-2 pr-3 font-medium text-right">Cost</th>
                                        <th className="py-2 font-medium text-right">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedServices.map((svc) => (
                                        <tr key={svc.serviceName} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                                            <td className="py-2 pr-3 text-gray-700 dark:text-gray-200">{svc.serviceName}</td>
                                            <td className="py-2 pr-3 text-right tabular-nums text-gray-900 dark:text-gray-100">{formatUsd(svc.cost)}</td>
                                            <td className="py-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
                                                {services.totalCost > 0 ? `${((svc.cost / services.totalCost) * 100).toFixed(1)}%` : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Usage Detail</h2>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={hideZeroCostUsage}
                                    onChange={(e) => setHideZeroCostUsage(e.target.checked)}
                                    className="rounded border-gray-300 dark:border-gray-700"
                                />
                                Hide zero-cost lines
                            </label>
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={usageSearch}
                                    onChange={(e) => setUsageSearch(e.target.value)}
                                    placeholder="Search service or usage type"
                                    className="pl-7 pr-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
                                />
                            </div>
                        </div>
                    </div>

                    {errors.usage && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">{errors.usage}</p>
                    )}

                    {usage && (
                        filteredUsage.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                No usage line items match this filter.
                            </p>
                        ) : (
                            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-white dark:bg-[#0e1729]">
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                            <th className="py-2 pr-3 font-medium">Service</th>
                                            <th className="py-2 pr-3 font-medium">Usage Type</th>
                                            <th className="py-2 pr-3 font-medium text-right">Quantity</th>
                                            <th className="py-2 font-medium text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsage.map((row, i) => (
                                            <tr key={`${row.serviceName}-${row.usageType}-${i}`} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                                                <td className="py-2 pr-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">{row.serviceName}</td>
                                                <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{row.usageType}</td>
                                                <td className="py-2 pr-3 text-right tabular-nums text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                                    {row.usageQuantity.toLocaleString(undefined, { maximumFractionDigits: 4 })} {row.usageUnit}
                                                </td>
                                                <td className="py-2 text-right tabular-nums text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatUsd(row.cost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </section>

                <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <Receipt className="w-4 h-4" /> Invoices
                    </h2>

                    {invoices?.message && (
                        <div className="rounded-md bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{invoices.message} Treat payment status below as informational, not authoritative.</span>
                        </div>
                    )}

                    {errors.invoices && (
                        <p className="text-sm text-rose-600 dark:text-rose-400">{errors.invoices}</p>
                    )}

                    {invoices && invoices.invoices.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No invoices on record.</p>
                    )}

                    {invoices && invoices.invoices.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                        <th className="py-2 pr-3 font-medium">Invoice</th>
                                        <th className="py-2 pr-3 font-medium">Billing Period</th>
                                        <th className="py-2 pr-3 font-medium">Issued</th>
                                        <th className="py-2 pr-3 font-medium">Due</th>
                                        <th className="py-2 pr-3 font-medium text-right">Amount</th>
                                        <th className="py-2 font-medium text-right">Payment Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.invoices.map((inv) => (
                                        <tr key={inv.invoiceId} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                                            <td className="py-2 pr-3 text-gray-700 dark:text-gray-200 font-mono text-xs whitespace-nowrap">{inv.invoiceId}</td>
                                            <td className="py-2 pr-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">{formatBillingPeriod(inv.billingPeriod)}</td>
                                            <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateShort(inv.issuedDate)}</td>
                                            <td className="py-2 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateShort(inv.dueDate)}</td>
                                            <td className="py-2 pr-3 text-right tabular-nums text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatUsd(inv.amount)}</td>
                                            <td className="py-2 text-right">
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${paymentStatusClasses[inv.paymentStatus] ?? paymentStatusClasses.UNKNOWN}`}
                                                >
                                                    {inv.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
