// app/(whatever)/components/EmployeePaycheckRow.tsx
"use client";

import { useMemo, useState } from "react";
import { GeneratedEmployeePaychecks } from "@/types/paycheckTypes";
import { decodeAndOpenPdf, formatCurrency, formatDate } from "@/utils/paycheckUtils";

type EmployeeRowProps = {
    record: GeneratedEmployeePaychecks;
};

export default function EmployeePaycheckRow({ record }: EmployeeRowProps) {
    const [open, setOpen] = useState(false);

    const totalForEmployee = useMemo(
        () =>
            record.paymentDetails?.reduce(
                (sum, p) => sum + (p.paidAmount || 0),
                0
            ) ?? 0,
        [record.paymentDetails]
    );

    const hasPayments =
        !!record.paymentDetails && record.paymentDetails.length > 0;

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white/90 shadow-sm">
            <button
                type="button"
                onClick={() => hasPayments && setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900">
                            {record.employee.employeeName || "Unknown Employee"}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                            {record.employee.employeeNtid}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        {hasPayments ? (
                            <>
                                <span>
                                    {record.paymentDetails.length} payment
                                    {record.paymentDetails.length > 1 ? "s" : ""}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                                <span>Total: {formatCurrency(totalForEmployee)}</span>
                            </>
                        ) : (
                            <span className="italic text-amber-600">
                                No paychecks generated for this month
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasPayments && (
                        <span className="text-xs font-medium text-zinc-500">
                            {open ? "Hide details" : "View details"}
                        </span>
                    )}
                    <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${hasPayments
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-50 text-zinc-400"
                            }`}
                    >
                        {hasPayments ? record.paymentDetails.length : 0}
                    </span>
                </div>
            </button>

            {open && hasPayments && (
                <div className="border-t border-zinc-100 px-4 pb-3 pt-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                            <thead className="border-b border-zinc-100 text-[11px] uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="py-2 pr-4">Pay Period</th>
                                    <th className="py-2 pr-4">Paid Date</th>
                                    <th className="py-2 pr-4">Amount</th>
                                    <th className="py-2 pr-4 text-right">Payslip</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {record.paymentDetails.map((detail, idx) => (
                                    <tr key={idx} className="align-middle">
                                        <td className="py-2 pr-4 text-zinc-800">
                                            {formatDate(detail.fromDate)} –{" "}
                                            {formatDate(detail.toDate)}
                                        </td>
                                        <td className="py-2 pr-4 text-zinc-700">
                                            {formatDate(detail.paidDate)}
                                        </td>
                                        <td className="py-2 pr-4 font-medium text-zinc-900">
                                            {formatCurrency(detail.paidAmount)}
                                        </td>
                                        <td className="py-2 pr-0 text-right">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-medium text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                                                onClick={() => decodeAndOpenPdf(detail.paySlip)}
                                            >
                                                View payslip
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
