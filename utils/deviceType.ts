// utils/deviceType.ts
export function isPhoneDevice(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";

    // ✅ Detect iPadOS without using navigator.platform
    const isIpadOSDesktopUA =
        (navigator as any).userAgentData?.platform === "macOS" &&
        (navigator as any).maxTouchPoints > 1;

    let isIPad = false;
    if (/iPad/.test(ua) || isIpadOSDesktopUA) {
        isIPad = true;
    }

    const isAndroid = /Android/.test(ua);
    let isAndroidTablet = false;
    if (isAndroid && !/Mobile/.test(ua)) {
        isAndroidTablet = true;
    }

    let isTablet = false;
    if (isIPad || isAndroidTablet) {
        isTablet = true;
    }

    const isPhoneUA =
        /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|Mobile Safari/i.test(ua);

    if (isPhoneUA && !isTablet) {
        return true;
    } else {
        return false;
    }
}
