"use client";

import React, { useMemo } from "react";
import { money, safeNumber } from "@/lib/format";
import { ProfitLookupResponse } from "@/types/finance";
import { Card } from "@/components/ui/finance/Card";
import { Divider, Row } from "@/components/ui/finance/Row";
import { CollapsibleCard } from "@/components/ui/finance/CollapsibleCard";

export function ProfitSection({
    profit,
    revenueTotal,
    expensesTotal,
}: {
    profit: ProfitLookupResponse["profit"];
    revenueTotal: number;
    expensesTotal: number;
}) {
    const p = safeNumber(profit.profit);

    const margin = useMemo(() => {
        const r = safeNumber(revenueTotal);
        return r > 0 ? (p / r) * 100 : 0;
    }, [p, revenueTotal]);

    return (
        <CollapsibleCard
            title="Profit"
            subtitle="Final profit + margin"
            right={<span className="text-sm font-semibold tabular-nums">{money(p)}</span>}
            defaultOpen={false}
        >
            <Row label="Profit" value={money(p)} strong />
            <Divider />
            <Row label="Profit Margin" value={`${margin.toFixed(2)}%`} />
            <Row label="Revenue" value={money(revenueTotal)} />
            <Row label="Expenses" value={money(expensesTotal)} />
        </CollapsibleCard>
    );
}
