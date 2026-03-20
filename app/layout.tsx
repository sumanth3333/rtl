import { metadata } from "@/config/metadata";
import { inter, jetbrainsMono } from "@/styles/fonts";
import "@/styles/globals.css";
import AuthProvider from "@/contexts/AuthContext";
import OwnerProvider from "@/contexts/OwnerContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { ThemeProviderWrapper } from "./ThemeProviderWrapper";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"; // ✅ Import the new component
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export { metadata };
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
