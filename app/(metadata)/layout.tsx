import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "RTB Logging",
    description: "Business Management App By EasyDoers",
    openGraph: {
        title: "RTBL - Real-Time Business Logging",
        description: "Streamline your business operations with EasyDoers.",
        type: "website",
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}