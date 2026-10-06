"use client";

import React from "react";
import { DashboardTab, useDashboard } from "@/context/DashboardContext";
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  Truck,
  Bot,
} from "lucide-react";

export function MobileBottomNav() {
  const {
    activeTab,
    setActiveTab,
    riskIntelligence,
    rescueTeams,
    ambulances,
  } = useDashboard();

  const totalResources = rescueTeams.length + ambulances.length;
  const hasCriticalRisk =
    riskIntelligence?.highestRiskArea?.riskLevel === "CRITICAL" ||
    (riskIntelligence?.highestRiskArea?.riskScore ?? 0) >= 75;

  const navItems: {
    id: DashboardTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: "red" | "emerald" | "blue" | "indigo";
  }[] = [
    {
      id: "overview",
      label: "Home",
      icon: LayoutDashboard,
    },
    {
      id: "map",
      label: "Map",
      icon: MapPin,
    },
    {
      id: "risk-intelligence",
      label: "Risks",
      icon: ShieldAlert,
      badge: hasCriticalRisk ? "ALERT" : "LIVE",
      badgeColor: hasCriticalRisk ? "red" : "emerald",
    },
    {
      id: "resources",
      label: "Resources",
      icon: Truck,
      badge: `${totalResources}`,
      badgeColor: "blue",
    },
    {
      id: "ai",
      label: "RESQ AI",
      icon: Bot,
      badge: "AI",
      badgeColor: "indigo",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070b16]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_25px_rgba(0,0,0,0.5)]"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer active:scale-95 touch-manipulation ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active Indicator Top Glow Line */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_12px_#3b82f6]" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-950/80 text-blue-400 border border-blue-500/50 shadow-md shadow-blue-950/50"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Badge if present */}
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[9px] font-mono font-black px-1 py-0.2 rounded-full border shadow-sm ${
                      item.badgeColor === "red"
                        ? "bg-rose-950 text-rose-300 border-rose-600 animate-pulse"
                        : item.badgeColor === "emerald"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                        : item.badgeColor === "indigo"
                        ? "bg-indigo-950 text-indigo-300 border-indigo-600"
                        : "bg-blue-950 text-blue-300 border-blue-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-mono tracking-tight mt-1 truncate ${
                  isActive ? "text-blue-300 font-black" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
