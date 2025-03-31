"use client"; // ✅ This makes it a Client Component

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/service-worker.js")
                .then((registration) => {
                    //console.log("✅ Service Worker Registered:", registration);
                })
                .catch((error) => {
                    console.error("❌ Service Worker Registration Failed:", error);
                });
        }
    }, []);

    return null; // No UI needed, just runs the effect
}
