"use client";

import apiClient from "@/services/api/apiClient";
import { useEffect, useMemo, useState } from "react";

type CarrierPortHelp = {
    carrierName: string;
    customerServiceNumber: string;
    accountNumberInstructions: string;
    transferPinInstructions: string;
};

export default function PortHelpPage() {
    const [data, setData] = useState<CarrierPortHelp[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchPortHelp = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await apiClient.get<CarrierPortHelp[]>("/employee/portHelp", {
                    signal: controller.signal as AbortSignal,
                });

                setData(res.data ?? []);
            } catch (err: any) {
                if (err?.name === "CanceledError" || err?.name === "AbortError") { return; }
                console.error("Failed to load port help:", err);
                setError(
                    err?.response?.data?.message ??
                    err?.message ??
                    "Unable to load porting help at the moment."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPortHelp();
        return () => controller.abort();
    }, []);

    const filteredData = useMemo(() => {
        if (!search.trim()) { return data; }
        const term = search.toLowerCase();
        return data.filter((item) =>
            item.carrierName.toLowerCase().includes(term)
        );
    }, [data, search]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                {/* Header */}
                <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                            Port Help – Carrier Reference
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm md:text-base text-zinc-600">
                            One place to quickly find{" "}
                            <span className="font-medium text-zinc-900">
                                customer service numbers, account number instructions,
                            </span>{" "}
                            and{" "}
                            <span className="font-medium text-zinc-900">
                                transfer PIN steps
                            </span>{" "}
                            for most carriers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs md:text-sm text-emerald-800 shadow-sm">
                            <p className="font-semibold">Best practice</p>
                            <p className="text-[11px] md:text-xs">
                                Confirm details with the customer on their app / bill while using
                                this as a guide.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Search + Hint Row */}
                <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            How to use this screen
                        </p>
                        <p className="text-sm text-zinc-600">
                            Type the carrier name (e.g. <span className="font-mono">AT&amp;T</span>,{" "}
                            <span className="font-mono">Verizon</span>,{" "}
                            <span className="font-mono">Mint</span>) and read the
                            <span className="font-medium"> Account #</span> and{" "}
                            <span className="font-medium">Transfer PIN</span> instructions out loud
                            to the customer.
                        </p>
                    </div>

                    <div className="flex w-full justify-end md:w-auto">
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search carrier name..."
                                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm md:text-base text-zinc-900 shadow-inner outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10"
                            />
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-400">
                                🔍
                            </span>
                        </div>
                    </div>
                </section>

                {/* States */}
                {loading && (
                    <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 text-sm md:text-base text-zinc-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="h-4 w-4 animate-spin rounded-full border border-zinc-300 border-b-zinc-900" />
                            Loading carrier information…
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 text-sm md:text-base text-red-700 shadow-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredData.length === 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 text-sm md:text-base text-zinc-600 shadow-sm">
                        No carriers match{" "}
                        <span className="font-semibold">&quot;{search}&quot;</span>. Try a
                        different spelling or a more general name (e.g. &quot;Verizon&quot; instead
                        of &quot;Prepaid by Verizon&quot;).
                    </div>
                )}

                {/* Main Content: Big readable cards in a grid */}
                {!loading && !error && filteredData.length > 0 && (
                    <section className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm md:text-base font-medium text-zinc-700">
                                Showing {filteredData.length} carrier
                                {filteredData.length > 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredData.map((item) => (
                                <article
                                    key={item.carrierName}
                                    className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 px-4 py-4 shadow-sm"
                                >
                                    {/* Carrier header */}
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div>
                                            <h2 className="text-lg font-semibold text-zinc-900">
                                                {item.carrierName}
                                            </h2>
                                            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-600">
                                                Port-out reference
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                                            Carrier
                                        </div>
                                    </div>

                                    {/* Customer service number */}
                                    <div className="mb-3 rounded-xl bg-zinc-50 px-3 py-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                            Customer Service
                                        </p>
                                        <p className="mt-1 text-sm md:text-base font-semibold text-zinc-900">
                                            {item.customerServiceNumber}
                                        </p>
                                        <p className="mt-1 text-[11px] text-zinc-500">
                                            Call if you need help getting account or port-out PIN.
                                        </p>
                                    </div>

                                    {/* Account & PIN instructions */}
                                    <div className="mt-1 flex flex-1 flex-col gap-3 text-sm md:text-[15px] text-zinc-800">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                Account Number
                                            </p>
                                            <p className="mt-1 leading-snug">
                                                {item.accountNumberInstructions}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                Transfer PIN
                                            </p>
                                            <p className="mt-1 leading-snug">
                                                {item.transferPinInstructions}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Small footer hint */}
                                    <div className="mt-3 border-t border-zinc-100 pt-2 text-[11px] text-zinc-500">
                                        Confirm on customer&apos;s app or bill before submitting port
                                        request.
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
