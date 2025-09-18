// utils/deviceType.ts
export function isPhoneDevice(): boolean {
    if (typeof navigator === "undefined") return false;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";

    // ✅ Detect iPadOS without using navigator.platform
    const isIpadOSDesktopUA =
        (navigator as any).userAgentData?.platform === "macOS" &&
        (navigator as any).maxTouchPoints > 1;

    const isIPad = /iPad/.test(ua) || isIpadOSDesktopUA;

    // ✅ Detect Android & Tablet
    const isAndroid = /Android/.test(ua);
    const isAndroidTablet = isAndroid && !/Mobile/.test(ua);

    const isTablet = isIPad || isAndroidTablet;

    // ✅ Detect Phone UA
    const isPhoneUA =
        /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|Mobile Safari/i.test(ua);

    return isPhoneUA && !isTablet;
}
