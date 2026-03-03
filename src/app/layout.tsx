// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/app/components/installation/InstallPrompt";
import InstallModal from "@/app/components/installation/InstallModal";
import ClientSecurity from "@/app/components/security/ClientSecurity";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ሕንጸተ ሰብእ (Hinsete Seb)",
  description: "A digital manuscript for academic and spiritual excellence",
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
    <html lang="am" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fdfaf1] text-[#3d1c1d]`}>
        {/* 🔒 Client-side inspection deterrence */}
        <ClientSecurity />

        {/* Silent background install + SW update handling */}
        <InstallPrompt />

        {/* Optional visual modal for install engagement */}
        <InstallModal lessonProgress={lessonProgress} />

        {/* Main app content */}
        <main className="min-h-screen relative">{children}</main>
      </body>
    </html>
  );
}
