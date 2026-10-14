"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Fixed semantic colors - identity is never color-alone, every slice/bar pairs with a text label.
const TYPE_COLORS: Record<string, string> = {
    APPLICATION_ERROR: "#f59e0b", // amber-500
    SERVER_RESTART: "#3b82f6", // blue-500
};
const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "#e11d48", // rose-600
    ERROR: "#f59e0b", // amber-500
};
const EMAIL_COLORS: Record<string, string> = {
    Sent: "#10b981", // emerald-500
    Pending: "#f59e0b", // amber-500
    Failed: "#e11d48", // rose-600
};

function ChartCard({ title, children, legend }: { title: string; children: React.ReactNode; legend?: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0e1729] shadow-sm p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <div className="flex-1 min-h-[180px]">{children}</div>
            {legend && <div className="mt-2 flex flex-wrap gap-3 justify-center">{legend}</div>}
        </div>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
        </span>
    );
}

function tooltipStyle() {
    return {
        contentStyle: {
            borderRadius: 8,
            border: "1px solid rgba(100,116,139,0.25)",
            fontSize: 12,
        },
    };
}

export function IncidentsByTypeChart({ data }: { data: { incident_type: string; total: number }[] }) {
    if (data.length === 0) {
        return <ChartCard title="Incidents by Type"><EmptyChart /></ChartCard>;
    }
    return (
        <ChartCard title="Incidents by Type">
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="text-gray-400" />
                    <YAxis
                        type="category"
                        dataKey="incident_type"
                        width={120}
                        tick={{ fontSize: 11 }}
                        stroke="currentColor"
                        className="text-gray-500"
                    />
                    <Tooltip {...tooltipStyle()} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={22}>
                        {data.map((entry) => (
                            <Cell key={entry.incident_type} fill={TYPE_COLORS[entry.incident_type] ?? "#94a3b8"} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export function SeverityDonutChart({ data }: { data: { severity: string; total: number }[] }) {
    if (data.length === 0) {
        return <ChartCard title="Incidents by Severity"><EmptyChart /></ChartCard>;
    }
    return (
        <ChartCard
            title="Incidents by Severity"
            legend={data.map((d) => (
                <LegendDot key={d.severity} color={SEVERITY_COLORS[d.severity] ?? "#94a3b8"} label={d.severity} />
            ))}
        >
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie data={data} dataKey="total" nameKey="severity" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
                        {data.map((entry) => (
                            <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? "#94a3b8"} />
                        ))}
                    </Pie>
                    <Tooltip {...tooltipStyle()} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

export function EmailDeliveryChart({ sent, pending, failed }: { sent: number; pending: number; failed: number }) {
    const data = [
        { label: "Sent", total: sent },
        { label: "Pending", total: pending },
        { label: "Failed", total: failed },
    ].filter((d) => d.total > 0);

    if (data.length === 0) {
        return <ChartCard title="Email Delivery"><EmptyChart /></ChartCard>;
    }

    return (
        <ChartCard
            title="Email Delivery"
            legend={data.map((d) => (
                <LegendDot key={d.label} color={EMAIL_COLORS[d.label]} label={d.label} />
            ))}
        >
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie data={data} dataKey="total" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
                        {data.map((entry) => (
                            <Cell key={entry.label} fill={EMAIL_COLORS[entry.label]} />
                        ))}
                    </Pie>
                    <Tooltip {...tooltipStyle()} />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
    );
}

function EmptyChart() {
    return (
        <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
            No data for this period
        </div>
    );
}
