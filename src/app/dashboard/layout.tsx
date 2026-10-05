import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100">
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
      </div>
    </DashboardProvider>
  );
}
