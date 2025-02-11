import { metadata } from "@/config/metadata"; // ✅ Import metadata
import { inter, jetbrainsMono } from "@/styles/theme"; // ✅ Import fonts
import "@/styles/globals.css"; // ✅ Import global styles
import AuthProvider from "@/contexts/AuthContext"; // ✅ Import global auth context

export { metadata }; // ✅ Use metadata globally

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body suppressHydrationWarning={true} className="flex flex-col min-h-screen">
        <AuthProvider> {/* ✅ Wrap children in authentication context */}
          <main className="flex-grow">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
