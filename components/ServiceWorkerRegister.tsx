"use client"; // ✅ This makes it a Client Component

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ServiceWorkerRegister() {
  const pathname = usePathname();

  useEffect(() => {
    const isAuthRoute = pathname.startsWith("/auth");

    // Never run service worker on auth routes; keep login flow network-fresh.
    if (isAuthRoute && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    // If not production, proactively unregister any SWs (avoids dev 404s for build manifests)
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      navigator.serviceWorker?.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    // Clean up any legacy service workers we may have registered previously
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.active?.scriptURL.includes("service-worker.js")) {
          registration.unregister();
        }
      });
    });

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Optional: surface when a new version is ready so the UI can prompt for refresh later
        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }

          installing.onstatechange = () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              console.warn("🔄 New PWA version available; reload to update.");
            }
          };
        };
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
      }
    };

    register();
  }, [pathname]);

  return null; // No UI needed, just runs the effect
}
