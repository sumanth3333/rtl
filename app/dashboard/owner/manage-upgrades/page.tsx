"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UpgradePhonesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/owner/manage-upgrades/available-devices");
    }, [router]);

    return null; // No content needed, it's just a redirect
}
