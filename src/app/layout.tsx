import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardProvider } from "@/context/DashboardContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RESQNET — Emergency Operations Center Dashboard",
  description:
    "From disaster detection to rescue decision — in seconds. AI-Powered Adaptive Disaster Response & Rescue Coordination Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080d1a] text-slate-100 selection:bg-blue-600 selection:text-white">
        <DashboardProvider>
          <Header />
          <div className="flex-1 flex overflow-hidden w-full">
            <Sidebar className="hidden md:flex" />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#060a14]">
              <div className="max-w-[1700px] mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
          <Footer />
        </DashboardProvider>
      </body>
    </html>
  );
}
