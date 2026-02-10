// app/dashboard/employee/log-inventory/page.tsx
import { Suspense } from "react";
import InventoryPageClient from "./InventoryPageClient";

export const dynamic = "force-dynamic"; // ✅ important for dashboards

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4">Loading inventory…</div>}>
            <InventoryPageClient />
        </Suspense>
    );
}
