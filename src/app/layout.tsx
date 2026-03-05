// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallModal from "@/app/components/installation/InstallModal";
import ClientSecurity from "@/app/components/security/ClientSecurity";
import MainNavigation from "@/app/components/navigation/MainNavigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fixed: Separate viewport export to comply with Next.js 14/15 standards
export const viewport: Viewport = {
  themeColor: "#9b5c12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ሕንጸተ ሰብእ (Hinsete Seb)",
  description: "A digital manuscript for academic and spiritual excellence",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ሕንጸተ ሰብእ",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  lessonProgress?: { completed: number; total: number };
}

export default function RootLayout({
  children,
  lessonProgress,
}: RootLayoutProps) {
  return (
    <html lang="am" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fdfaf1] text-[#3d1c1d] selection:bg-[#9b5c12]/20`}>
        <ClientSecurity />
        <InstallModal lessonProgress={lessonProgress} />

        {/* Added pb-24 for mobile nav spacing */}
        <main className="min-h-screen relative pb-24 md:pb-0">{children}</main>

        {/* Global Navigation */}
        <MainNavigation />
      </body>
    </html>
  );
}
