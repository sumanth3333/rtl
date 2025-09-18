"use client";

import { useEffect, useState } from "react";
import { isPhoneDevice } from "@/utils/deviceType";

interface DeviceInfo {
    deviceType: string;
    browser: string;
    os: string;
}

export default function SettingsPage() {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
        deviceType: "Detecting...",
        browser: "Detecting...",
        os: "Detecting...",
    });

    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(false);
    const [wifiRestriction, setWifiRestriction] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";

        // ✅ Device detection using your util
        const deviceType = isPhoneDevice() ? "Phone" : /iPad|Tablet/i.test(ua) ? "Tablet" : "Desktop";

        // ✅ Browser detection
        let browser = "Unknown";
        if (/chrome|crios|crmo/i.test(ua)) { browser = "Chrome"; }
        else if (/firefox|fxios/i.test(ua)) { browser = "Firefox"; }
        else if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) { browser = "Safari"; }
        else if (/edg/i.test(ua)) { browser = "Edge"; }

        // ✅ OS detection (no navigator.platform)
        let os = "Unknown";
        if ((navigator as any).userAgentData?.platform) {
            os = (navigator as any).userAgentData.platform;
        } else if (/windows/i.test(ua)) { os = "Windows"; }
        else if (/macintosh|mac os x/i.test(ua)) { os = "MacOS"; }
        else if (/android/i.test(ua)) { os = "Android"; }
        else if (/ios|iphone|ipad/i.test(ua)) { os = "iOS"; }

        setDeviceInfo({ deviceType, browser, os });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#334155] py-10 px-6">
            <div className="max-w-3xl mx-auto bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                    Settings
                </h1>

                {/* Device Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                        Device Information
                    </h2>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li><strong>Device Type:</strong> {deviceInfo.deviceType}</li>
                        <li><strong>Browser:</strong> {deviceInfo.browser}</li>
                        <li><strong>Operating System:</strong> {deviceInfo.os}</li>
                    </ul>
                </div>

                {/* Preferences Section */}
                {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                        Preferences
                    </h2>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Enable Dark Mode</span>
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                            className="w-5 h-5 accent-blue-600"
                        />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Allow Notifications</span>
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={() => setNotifications(!notifications)}
                            className="w-5 h-5 accent-blue-600"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Restrict Login to Store Wi-Fi
                        </span>
                        <input
                            type="checkbox"
                            checked={wifiRestriction}
                            onChange={() => setWifiRestriction(!wifiRestriction)}
                            className="w-5 h-5 accent-blue-600"
                        />
                    </div>
                </div> */}

                {/* Save Button */}
                {/* <div className="flex justify-center">
                    <button
                        onClick={() => {
                            console.log("Saved settings:", { darkMode, notifications, wifiRestriction });
                            alert("Settings saved successfully!");
                        }}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                    >
                        Save Changes
                    </button>
                </div> */}
            </div>
        </div>
    );
}
