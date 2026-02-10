"use client";

import React, { useMemo } from "react";
import { Divider, Row } from "@/components/ui/finance/Row";

import { money, titleizeKey, safeNumber } from "@/lib/format";
import type { ProfitLookupResponse } from "@/types/finance";
import { CollapsibleCard } from "@/components/ui/finance/CollapsibleCard";

export function ExpensesSection({ expenses }: { expenses: ProfitLookupResponse["expenses"] }) {
    const e = expenses.expenses;

    const regular = useMemo(() => {
        const obj = e.regularExpenses || {};
        return Object.entries(obj).sort((a, b) => safeNumber(b[1]) - safeNumber(a[1]));
    }, [e.regularExpenses]);

    return (
        <CollapsibleCard
            title="Expenses"
            subtitle="Consolidated totals"
            right={<span className="text-sm font-semibold tabular-nums">{money(expenses.totalExpenses)}</span>}
            defaultOpen={false}
        >
            <Row label="Total Expenses" value={money(expenses.totalExpenses)} strong />
            <Divider />

            <Row label="Total Paycheck" value={money(e.paycheck?.totalPaycheck)} />

            {regular.length > 0 && (
                <>
                    <Divider />
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Regular expenses
                    </div>
                    {regular.map(([k, v]) => (
                        <Row key={k} label={titleizeKey(k)} value={money(v)} />
                    ))}
                </>
            )}

            <Divider />
            <Row label="Dealer Expenses" value={money(e.dealerExpenses?.amount)} />
            <Row label="Legal Expenses" value={money(e.legalExpenses?.amount)} />
            <Row label="Other Expenses" value={money(e.otherExpenses?.amount)} />
            <Row label="Store Expenses" value={money(e.storeExpenses?.amount)} />
            <Row label="Pre-activations (Invoices)" value={money(e.preActivationsTotal?.totalInvoicesPrice)} />
        </CollapsibleCard>
    );
}
