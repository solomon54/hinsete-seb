// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallModal from "@/app/components/installation/InstallModal";
import ClientSecurity from "@/app/components/security/ClientSecurity";
import MainNavigation from "@/app/components/navigation/MainNavigation";
import UseMount from "@/app/components/navigation/UseMount";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#9b5c12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fdfaf1] text-[#3d1c1d] flex flex-col min-h-dvh`}>
        <ClientSecurity />
        <InstallModal />

        <main className="flex-1 md:pl-24">{children}</main>

        <UseMount>
          <MainNavigation />
        </UseMount>
      </body>
    </html>
  );
}
