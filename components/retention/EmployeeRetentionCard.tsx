"use client";

import { useMemo, useState } from "react";
import { RetentionAccount, RetentionStatus } from "@/types/retention";

type Props = {
    account: RetentionAccount;
    onSave: (update: { amountPaid: number; phones: { phoneNumber: string; status: RetentionStatus }[] }) => Promise<void>;
};

const STATUS_OPTIONS: RetentionStatus[] = ["PENDING", "RETAINED", "PORTED_OUT", "NOT_ACCESSIBLE", "ACTIVE", "CANCELLED"];

export default function EmployeeRetentionCard({ account, onSave }: Props) {
    const [amountPaid, setAmountPaid] = useState<number>(account.amountPaid || 0);
    const [phones, setPhones] = useState(account.phoneNumbers);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleStatusChange = (phoneNumber: string, status: RetentionStatus) => {
        setPhones((prev) => prev.map((p) => (p.phoneNumber === phoneNumber ? { ...p, status } : p)));
    };

    const showAmount = useMemo(() => phones.some((p) => p.status === "RETAINED"), [phones]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await onSave({ amountPaid, phones });
            setMessage("Saved");
        } catch (err: any) {
            setMessage(err?.message || "Save failed");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 2000);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Account</p>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{account.accountNumber}</h4>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold">Phone Number</th>
                            <th className="px-3 py-2 text-left font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {phones
                            .slice()
                            .sort((a, b) => (a.status === "PENDING" && b.status !== "PENDING" ? -1 : b.status === "PENDING" && a.status !== "PENDING" ? 1 : 0))
                            .map((phone, idx) => (
                            <tr
                                key={phone.phoneNumber}
                                className={`${phone.status === "PENDING" ? "bg-white dark:bg-gray-900" : "bg-emerald-50/60 dark:bg-emerald-900/30"} transition-colors`}
                            >
                                <td className="px-3 py-2 font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                    {phone.phoneNumber}
                                </td>
                                <td className="px-3 py-2">
                                    <select
                                        value={phone.status}
                                        onChange={(e) => handleStatusChange(phone.phoneNumber, e.target.value as RetentionStatus)}
                                        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2">
                <p className="text-xs uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">Retention Amount (Per Account)</p>
                {showAmount ? (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">$</span>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={amountPaid}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setAmountPaid(Number.isNaN(val) ? 0 : val);
                            }}
                            className="w-40 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
                        />
                    </div>
                ) : (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Set at least one phone status to `RETAINED` to enter account-level amount.</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save updates"}
                </button>
                {message && <p className="text-xs text-gray-600 dark:text-gray-300">{message}</p>}
            </div>
        </div>
    );
}
