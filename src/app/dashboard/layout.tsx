import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 overflow-x-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden w-full">
          <Sidebar className="hidden md:flex shrink-0" />
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 bg-[#060a14]">
            <div className="max-w-[1700px] mx-auto w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
        <MobileBottomNav />
      </div>
    </DashboardProvider>
  );
}
