import { metadata } from "@/config/metadata";
import { inter, jetbrainsMono } from "@/styles/fonts";
import "@/styles/globals.css";
import AuthProvider from "@/contexts/AuthContext";
import OwnerProvider from "@/contexts/OwnerContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { ThemeProviderWrapper } from "./ThemeProviderWrapper";
import Head from "next/head";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"; // ✅ Import the new component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export { metadata };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        {/* ✅ Manifest File */}
        <link rel="manifest" href="/manifest.json" />
        <script>
          {`
      if (!document.querySelector('link[rel="manifest"]')) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.json';
        document.head.appendChild(link);
      }
    `}
        </script>
        {/* ✅ PWA Metadata */}
        <meta name="application-name" content="OneClick" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        {/* ✅ PWA Icons */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/1c-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/1c-512x512.png" />
      </Head>

      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <ThemeProviderWrapper>
          <AuthProvider>
            <OwnerProvider>
              <EmployeeProvider>
                <main className="flex-grow">{children}</main>
                <ToastContainer position="top-right" autoClose={5000} />
              </EmployeeProvider>
            </OwnerProvider>
          </AuthProvider>
        </ThemeProviderWrapper>

        {/* ✅ Register Service Worker (Client Component) */}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
