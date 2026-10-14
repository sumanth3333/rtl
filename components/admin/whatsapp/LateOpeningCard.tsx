"use client";

import { useState } from "react";
import { LateOpeningEntry } from "@/types/lateOpeningTypes";

interface LateOpeningCardProps {
    entry: LateOpeningEntry;
}

const formatTime = (value: string | null) => {
    if (!value) { return "—"; }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) { return value; }
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" });
};

const severityClasses = (lateDurationSeconds: number) => {
    if (lateDurationSeconds >= 900) {
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    }
    if (lateDurationSeconds >= 300) {
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    }
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
};

const statusClasses = (status: string) => {
    switch (status) {
        case "REPLIED":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
        case "READ":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
        case "DELIVERED":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
        case "FAILED":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
        default:
            return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
};

const deliveryStatusClasses = (status: string) => {
    switch (status) {
        case "READ":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
        case "DELIVERED":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
        case "FAILED":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
        default:
            return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
};

const messageLabel = (messageType: string, reminderNumber: number) =>
    messageType === "REMINDER" ? `Reminder ${reminderNumber}` : "Initial Message";

export default function LateOpeningCard({ entry }: LateOpeningCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.employeeName} <span className="text-gray-400 dark:text-gray-500 font-normal">· {entry.employeePhoneNumber}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.storeName} ({entry.dealerStoreId})
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${severityClasses(entry.lateDurationSeconds)}`}>
                        Late {entry.lateDuration}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(entry.currentStatus)}`}>
                        {entry.responseReceived ? "Replied" : entry.currentStatus}
                    </span>
                    <button
                        type="button"
                        onClick={() => setExpanded((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        {expanded ? "Hide" : "Details"}
                        <span className="text-[9px]">{expanded ? "▲" : "▼"}</span>
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-4 bg-gray-50/60 dark:bg-gray-800/30">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Scheduled</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.scheduledOpeningTime}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clocked In</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.employeeClockInTime}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Replied After</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.repliedAfter ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Response Time</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.responseTime ?? "—"}</p>
                        </div>
                    </div>

                    {entry.reasonReplied && (
                        <div className="rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Employee&apos;s reason</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">&quot;{entry.reasonReplied}&quot;</p>
                            {entry.repliedAt && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Replied at {formatTime(entry.repliedAt)}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Message Timeline</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead className="text-gray-500 dark:text-gray-400">
                                    <tr>
                                        <th className="px-2 py-1 text-left font-semibold">Message</th>
                                        <th className="px-2 py-1 text-left font-semibold">Status</th>
                                        <th className="px-2 py-1 text-center font-semibold">Sent</th>
                                        <th className="px-2 py-1 text-center font-semibold">Delivered</th>
                                        <th className="px-2 py-1 text-center font-semibold">Read</th>
                                        <th className="px-2 py-1 text-center font-semibold">Retries</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {entry.messageDetails.map((message, index) => (
                                        <tr key={index}>
                                            <td className="px-2 py-1.5 text-gray-800 dark:text-gray-200">
                                                {messageLabel(message.messageType, message.reminderNumber)}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${deliveryStatusClasses(message.deliveryStatus)}`}>
                                                    {message.deliveryStatus}
                                                </span>
                                                {message.failureReason && (
                                                    <p className="text-[10px] text-rose-500 mt-0.5">{message.failureReason}</p>
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5 text-center text-gray-700 dark:text-gray-300">{formatTime(message.sentAt)}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-700 dark:text-gray-300">{formatTime(message.deliveredAt)}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-700 dark:text-gray-300">{formatTime(message.readAt)}</td>
                                            <td className="px-2 py-1.5 text-center text-gray-700 dark:text-gray-300">{message.retryCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
