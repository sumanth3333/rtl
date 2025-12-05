"use client";

import { useMemo } from "react";
import { GeneratedEmployeePaychecks } from "@/types/paycheckTypes";
import { formatCurrency } from "@/utils/paycheckUtils";

type SummaryProps = {
    data: GeneratedEmployeePaychecks[] | null;
};

export default function PaycheckSummary({ data }: SummaryProps) {
    const { totalPaid, totalPayments, employeesPaid } = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalPaid: 0,
                totalPayments: 0,
                employeesPaid: 0,
            };
        }

        let totalPaid = 0;
        let totalPayments = 0;
        let employeesPaid = 0;

        for (const emp of data) {
            if (emp.paymentDetails?.length) {
                employeesPaid++;
                totalPayments += emp.paymentDetails.length;

                for (const p of emp.paymentDetails) {
                    totalPaid += p.paidAmount || 0;
                }
            }
        }

        return { totalPaid, totalPayments, employeesPaid };
    }, [data]);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Total Payroll
                </p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                    {formatCurrency(totalPaid)}
                </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Employees Paid
                </p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                    {employeesPaid}
                </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Payment Instances
                </p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                    {totalPayments}
                </p>
            </div>
        </div>
    );
}
