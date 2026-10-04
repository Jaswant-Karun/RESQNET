"use client";

import React from "react";
import { DashboardTab, useDashboard } from "@/context/DashboardContext";
import {
  Activity,
  AlertOctagon,
  Bot,
  FileCheck2,
  GitBranch,
  LayoutDashboard,
  Navigation,
  Radio,
  Truck,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const {
    activeTab,
    setActiveTab,
    incident,
    drones,
    rescueTeams,
    ambulances,
    plan,
    isActionApproved,
    timeline,
    workflowState,
  } = useDashboard();

  const navItems: {
    id: DashboardTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: "red" | "amber" | "blue" | "emerald";
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "incidents",
      label: "Incidents",
      icon: AlertOctagon,
      badge: "1 ACTIVE",
      badgeColor: "red",
    },
    {
      id: "resources",
      label: "Resources",
      icon: Truck,
      badge: `${rescueTeams.length + ambulances.length}`,
      badgeColor: "blue",
    },
    {
      id: "drones",
      label: "Drones",
      icon: Navigation,
      badge: `${drones.length}`,
      badgeColor: "blue",
    },
    {
      id: "plans",
      label: "Response Plans",
      icon: FileCheck2,
      badge: isActionApproved ? "APPROVED" : "PENDING",
      badgeColor: isActionApproved ? "emerald" : "amber",
    },
    {
      id: "automation",
      label: "Orchestration (n8n)",
      icon: GitBranch,
      badge: workflowState.isSimulationMode ? "SIM MODE" : "RUNNING",
      badgeColor: workflowState.isSimulationMode ? "amber" : "emerald",
    },
    {
      id: "activity",
      label: "Activity Log",
      icon: Activity,
      badge: `${timeline.length}`,
      badgeColor: "blue",
    },
    {
      id: "ai",
      label: "RESQ AI",
      icon: Bot,
      badge: "ACTIVE",
      badgeColor: "emerald",
    },
  ];

  return (
    <aside
      className={`w-64 shrink-0 bg-[#080d1a] border-r border-slate-800/90 flex flex-col justify-between py-4 ${className}`}
    >
      <div className="space-y-6 px-3">
        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Command Center Console
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600/20 text-white border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-400" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        item.badgeColor === "red"
                          ? "bg-red-950/80 text-red-400 border border-red-800/60"
                          : item.badgeColor === "amber"
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                          : item.badgeColor === "emerald"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Tactical Status */}
      <div className="px-3 pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">DEFCON LEVEL</span>
            <span className="text-red-400 font-bold">2 - SEVERE</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-red-500 h-1.5 rounded-full w-4/5 animate-pulse" />
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            Target Sector: {incident.primaryLocation.name}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>COMMS: SECURE</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Radio className="h-3 w-3" />
            100% LINK
          </span>
        </div>
      </div>
    </aside>
  );
}
