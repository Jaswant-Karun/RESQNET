"use client";

import React, { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Database,
  Radio,
  Shield,
  UserCheck,
  Wifi,
} from "lucide-react";

export function Header() {
  const {
    incident,
    simulationStage,
    unreadAlertCount,
    markAlertsRead,
    setActiveTab,
    workflowState,
    databaseState,
    refreshDatabaseData,
  } = useDashboard();

  const [timeString, setTimeString] = useState<string>("");
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toISOString().replace("T", " ").substring(0, 19) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-[#080d1a]/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-red-600 via-blue-600 to-indigo-700 shadow-md shadow-blue-900/30">
              <Shield className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-widest text-white uppercase">
                  RESQ<span className="text-red-500">NET</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase hidden sm:inline">
                  Emergency Response Intelligence
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>EOC CENTRAL COMMAND</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold" suppressHydrationWarning>{timeString || "SYNCHRONIZING..."}</span>
              </div>
            </div>
          </div>

          {/* Center: Current Incident Status Banner */}
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/90 shadow-sm max-w-xl">
            <Radio className="h-3.5 w-3.5 text-rose-500 animate-pulse shrink-0" />
            <div className="truncate text-xs font-mono">
              <span className="text-slate-400 font-semibold">SIMULATED INCIDENT: </span>
              <span className="text-white font-bold">{incident.code}</span>
              <span className="text-slate-500"> — </span>
              <span className="text-rose-400 font-semibold truncate">{incident.title}</span>
            </div>
            <Badge
              variant={incident.severity === "CRITICAL" ? "critical" : "warning"}
              pulse
              className="shrink-0 text-[10px]"
            >
              {incident.status}
            </Badge>
          </div>

          {/* Right Controls: Status, Sim Indicator, Notifications, Operator */}
          <div className="flex items-center gap-3">
            {/* System Status: ONLINE */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">SYS:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>

            {/* Database Persistence Status Badge */}
            <div
              onClick={() => refreshDatabaseData()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[11px] shadow-sm cursor-pointer transition-all ${
                databaseState.mode === "mongodb" && databaseState.connected
                  ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-300 hover:bg-emerald-900/80"
                  : databaseState.mode === "mongodb" && !databaseState.connected
                  ? "bg-amber-950/70 border-amber-600/70 text-amber-300 hover:bg-amber-900/80"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
              title={
                databaseState.mode === "mongodb"
                  ? databaseState.connected
                    ? `MongoDB Atlas: Connected (${databaseState.latencyMs ?? 0}ms). Click to refresh.`
                    : `MongoDB Mode: Offline fallback to local simulation (${databaseState.error || "Unreachable"}). Click to retry.`
                  : "DATABASE_MODE=local (Deterministic Simulation Engine). Click to check status."
              }
            >
              <Database className="h-3 w-3 shrink-0" />
              {databaseState.mode === "mongodb" ? (
                databaseState.connected ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>DB: MONGODB</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>DB: FALLBACK</span>
                  </>
                )
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span>DB: LOCAL</span>
                </>
              )}
            </div>

            {/* AUTOMATION & SIMULATION MODE INDICATOR */}
            <div
              onClick={() => setActiveTab("automation")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-500/80 font-mono text-[11px] text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer hover:bg-amber-900/90 transition-all"
              title="Workflow Orchestration: Running in Simulation Mode"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>SIMULATION MODE</span>
              {simulationStage === "ESCALATED" && (
                <span className="text-rose-400 ml-1 text-[10px] font-black uppercase">
                  [ESCALATED]
                </span>
              )}
            </div>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  markAlertsRead();
                  setActiveTab("activity");
                }}
                className="relative p-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                title="View Live Tactical Alerts"
              >
                <Bell className="h-4 w-4" />
                {unreadAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-mono font-bold text-white shadow-sm">
                    {unreadAlertCount}
                  </span>
                )}
              </button>
            </div>

            {/* Operator Profile Placeholder */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-blue-500/50 flex items-center justify-center text-blue-400 font-mono text-xs font-bold shadow-inner">
                RM
              </div>
              <div className="hidden lg:block text-left text-[11px] font-mono leading-tight">
                <div className="text-slate-200 font-semibold flex items-center gap-1">
                  <span>Cmdr. R. Menon</span>
                  <UserCheck className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="text-slate-500 text-[10px]">Duty Commander</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
