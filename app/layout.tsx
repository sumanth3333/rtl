"use client";

import { useEffect, useState } from "react";
import { inter, jetbrainsMono } from "@/styles/fonts";
import "@/styles/globals.css";
import AuthProvider from "@/contexts/AuthContext";
import OwnerProvider from "@/contexts/OwnerContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { ThemeProviderWrapper } from "./ThemeProviderWrapper";
import Head from "next/head";
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html
      lang="en"
      className={`h-full w-full ${mounted ? "" : "dark"}`} // Prevent hydration mismatch
      suppressHydrationWarning
    >
      <Head>
        {/* ✅ PWA & Mobile Optimizations */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>

      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen bg-background text-foreground dark:bg-zinc-900 dark:text-white`}
      >
        {/* ✅ Theme Provider to Prevent Hydration Issues */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeProviderWrapper>
            <AuthProvider>
              <OwnerProvider>
                <EmployeeProvider>
                  <main className="flex-grow">{children}</main>
                </EmployeeProvider>
              </OwnerProvider>
            </AuthProvider>
          </ThemeProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
