"use client";

import { Card } from "@/components/ui/finance/Card";
import React from "react";

function SkeletonLine({ w = "w-full" }: { w?: string }) {
    return <div className={`h-3 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 ${w}`} />;
}

export function ProfitLookupSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-12">
                <Card title="Loading" subtitle="Fetching profit lookup data...">
                    <div className="space-y-3">
                        <SkeletonLine w="w-1/3" />
                        <SkeletonLine w="w-2/3" />
                        <SkeletonLine w="w-1/2" />
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-4">
                <Card title="Revenue">
                    <div className="space-y-3">
                        <SkeletonLine w="w-1/2" />
                        <SkeletonLine w="w-2/3" />
                        <SkeletonLine w="w-1/3" />
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-4">
                <Card title="Expenses">
                    <div className="space-y-3">
                        <SkeletonLine w="w-2/3" />
                        <SkeletonLine w="w-1/2" />
                        <SkeletonLine w="w-1/3" />
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-4">
                <Card title="Profit">
                    <div className="space-y-3">
                        <SkeletonLine w="w-1/2" />
                        <SkeletonLine w="w-1/3" />
                        <SkeletonLine w="w-2/3" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
