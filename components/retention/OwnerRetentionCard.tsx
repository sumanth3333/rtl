"use client";

import { StoreRetention } from "@/types/retention";

type Props = {
    data: StoreRetention;
};

const statusColor: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-rose-100 text-rose-800",
    RETAINED: "bg-indigo-100 text-indigo-800",
    NOT_ACCESSIBLE: "bg-amber-100 text-amber-800",
    PORTED_OUT: "bg-gray-200 text-gray-700",
    PENDING: "bg-sky-100 text-sky-800",
};

export default function OwnerRetentionCard({ data }: Props) {
    const retentions = data.retentions ?? [];
    const totalPhones = retentions.reduce((acc, r) => acc + (r.phoneNumbers?.length ?? 0), 0);

    return (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Store</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.store.storeName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{data.store.dealerStoreId}</p>
                </div>
                <div className="flex gap-3 mt-3 sm:mt-0">
                    <Badge label="Accounts" value={retentions.length} />
                    <Badge label="Phones" value={totalPhones} tone="indigo" />
                    <Badge label="Date" value={data.transactionDate} tone="slate" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold">Account #</th>
                            <th className="px-4 py-2 text-left font-semibold">Phone Number</th>
                            <th className="px-4 py-2 text-left font-semibold">Status</th>
                            <th className="px-4 py-2 text-left font-semibold">Paid</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {retentions.flatMap((account) => {
                            const amount = account.amountPaid ?? 0;
                            const phones = account.phoneNumbers ?? [];
                            if (phones.length === 0) {
                                return [
                                    <tr key={`${account.accountNumber}-none`} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{account.accountNumber}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">No phone numbers</td>
                                        <td className="px-4 py-3">—</td>
                                        <td className="px-4 py-3">{amount > 0 ? `$${amount.toFixed(2)}` : "—"}</td>
                                    </tr>
                                ];
                            }
                            return phones.map((phone, idx) => (
                                <tr key={`${account.accountNumber}-${phone.phoneNumber ?? "phone"}-${idx}`} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{account.accountNumber}</td>
                                    <td className="px-4 py-3 font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                        {phone.phoneNumber ?? "N/A"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${statusColor[phone.status] || "bg-slate-100 text-slate-800"}`}
                                        >
                                            {phone.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{amount > 0 ? `$${amount.toFixed(2)}` : "—"}</td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

type BadgeProps = { label: string; value: string | number; tone?: "emerald" | "indigo" | "slate" };
function Badge({ label, value, tone = "emerald" }: BadgeProps) {
    const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-100 dark:border-indigo-800",
        slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/30 dark:text-slate-100 dark:border-slate-800",
    };
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${tones[tone]}`}>
            <span>{label}</span>
            <span className="font-bold">{value}</span>
        </span>
    );
}
