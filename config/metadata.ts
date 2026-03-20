import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "OneClick By Pro People Tech",
    description: "Business Management App Developed By Pro People Tech LLC",
    manifest: "/manifest.json",
    themeColor: "#000000",
    icons: {
        icon: [
            { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon.ico" },
        ],
        apple: [
            { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "OneClick",
    },
    openGraph: {
        title: "OneClick",
        description: "Streamline your business operations with OneClick today.",
        type: "website",
    },
};
