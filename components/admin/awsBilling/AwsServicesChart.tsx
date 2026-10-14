"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AwsServiceCost } from "@/types/awsBillingTypes";
import { formatUsd } from "@/utils/formatUsd";

// ✅ Single series (cost) ranked across many categories - sequential hue (magnitude job),
// not categorical. Identity comes from the Y-axis label, not from per-bar color.
const BAR_COLOR = "#2a78d6";

function tooltipStyle() {
    return {
        contentStyle: {
            borderRadius: 8,
            border: "1px solid rgba(100,116,139,0.25)",
            fontSize: 12,
        },
        formatter: (value: unknown) => [formatUsd(Number(value)), "Cost"],
    };
}

export function AwsServicesChart({ services }: { services: AwsServiceCost[] }) {
    if (services.length === 0) {
        return (
            <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
                No service cost data for this period
            </div>
        );
    }

    const sorted = [...services].sort((a, b) => b.cost - a.cost);
    const height = Math.max(220, sorted.length * 34);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 56, top: 4, bottom: 4 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-400" />
                <YAxis
                    type="category"
                    dataKey="serviceName"
                    width={210}
                    tick={{ fontSize: 10.5 }}
                    stroke="currentColor"
                    className="text-gray-500"
                />
                <Tooltip {...tooltipStyle()} />
                <Bar dataKey="cost" fill={BAR_COLOR} radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList
                        dataKey="cost"
                        position="right"
                        formatter={(value: unknown) => formatUsd(Number(value))}
                        style={{ fontSize: 11, fill: "currentColor" }}
                        className="text-gray-600 dark:text-gray-300"
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
