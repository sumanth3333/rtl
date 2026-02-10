"use client";

import React from "react";
import { money } from "@/lib/format";
import { ProfitLookupResponse } from "@/types/finance";
import { CollapsibleCard } from "@/components/ui/finance/CollapsibleCard";
import { Divider, Row } from "@/components/ui/finance/Row";

export function RevenueSection({ revenue }: { revenue: ProfitLookupResponse["revenue"] }) {
    const a = revenue.accessories;

    return (
        <CollapsibleCard
            title="Revenue"
            subtitle="Accessories + compensation"
            right={<span className="text-sm font-semibold tabular-nums">{money(revenue.totalRevenue)}</span>}
            defaultOpen={false}
        >
            <Row label="Total Revenue" value={money(revenue.totalRevenue)} strong />
            <Divider />

            <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Accessories
            </div>
            <Row label="Cash Accessories" value={money(a.totalCashAccessories)} />
            <Row label="Card Accessories" value={money(a.totalCardAccessories)} />
            <Row label="System Accessories" value={money(a.totalSystemAccessories)} />
            <Row label="Total Accessories" value={money(a.totalAccessories)} strong />
            <Divider />

            <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Compensation
            </div>
            <Row label="Total Compensation" value={money(revenue.compensation.totalCompensation)} strong />
        </CollapsibleCard>
    );
}
