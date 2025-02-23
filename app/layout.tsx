import { metadata } from "@/config/metadata";
import { inter, jetbrainsMono } from "@/styles/fonts";
import "@/styles/globals.css";
import AuthProvider from "@/contexts/AuthContext";
import OwnerProvider from "@/contexts/OwnerContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { ThemeProviderWrapper } from "./ThemeProviderWrapper";

export { metadata };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProviderWrapper>
          <AuthProvider>
            <OwnerProvider>
              <EmployeeProvider>
                <main className="flex-grow">
                  {children}
                </main>
              </EmployeeProvider>
            </OwnerProvider>
          </AuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}