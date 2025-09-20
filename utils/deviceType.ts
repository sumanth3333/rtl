// utils/deviceType.ts
export function isPhoneDevice(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const touchPoints = (navigator as any).maxTouchPoints || 0;
    const width = typeof window !== "undefined" ? window.innerWidth : 0;
    const height = typeof window !== "undefined" ? window.innerHeight : 0;

    // ✅ Detect iPadOS without using deprecated navigator.platform
    const isIpadOSDesktopUA =
        (navigator as any).userAgentData?.platform === "macOS" && touchPoints > 1;

    const isIPad = /iPad/.test(ua) || isIpadOSDesktopUA;
    const isAndroid = /Android/.test(ua);
    const isAndroidTablet = isAndroid && !/Mobile/.test(ua);

    const isTablet = isIPad || isAndroidTablet;

    const isPhoneUA =
        /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|Mobile Safari/i.test(ua);

    // ✅ Base check: UA says it's a phone and not a tablet
    if (isPhoneUA && !isTablet) {
        return true;
    }

    // ✅ Tablet / Large Device Heuristics
    if (touchPoints > 1 && width >= 820) {
        // Start assuming it's a tablet but check edge cases

        const aspectRatio = height / width;

        // 1) Portrait phone pretending to be desktop (too tall)
        if (aspectRatio > 1.65) {
            return true; // treat as phone
        }

        // 2) Landscape phone pretending to be tablet (too short)
        if (height < 550) {
            return true; // treat as phone
        }

        // Otherwise, treat as tablet → not a phone
        return false;
    }

    // ✅ Default fallback
    return false;
}
