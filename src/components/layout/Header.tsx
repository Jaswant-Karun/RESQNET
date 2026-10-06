"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Database,
  GitBranch,
  LogOut,
  Mail,
  Radio,
  Shield,
  UserCheck,
} from "lucide-react";
import { CommanderProfilePanel } from "./CommanderProfilePanel";

export function Header() {
  const router = useRouter();
  const {
    incident,
    simulationStage,
    unreadAlertCount,
    markAlertsRead,
    setActiveTab,
    workflowIntegrationStatus,
    databaseState,
    refreshDatabaseData,
  } = useDashboard();

  const [timeString, setTimeString] = useState<string>("");
  const [showCommanderPanel, setShowCommanderPanel] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string }>({
    name: "Cmdr Jaswant Karun",
    role: "COMMANDER",
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser({
            name: data.user.name || "Cmdr Jaswant Karun",
            role: data.user.role || "COMMANDER",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

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
    <>
      <header className="border-b border-slate-800 bg-[#080d1a]/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 py-2.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* MOBILE TOP BAR (< md) */}
            <div className="flex md:hidden items-center justify-between w-full py-0.5">
              {/* Left: RESQNET + SYSTEM ONLINE */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 via-blue-600 to-indigo-700 shadow-md shadow-blue-900/30 shrink-0">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
                <div>
                  <div className="text-base font-black tracking-widest text-white uppercase font-sans leading-tight">
                    RESQ<span className="text-red-500">NET</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold leading-none mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SYSTEM ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Right: Commander + Notifications */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    markAlertsRead();
                    setActiveTab("activity");
                  }}
                  className="relative p-2 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="View Alerts"
                >
                  <Bell className="h-4 w-4" />
                  {unreadAlertCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white shadow-sm">
                      {unreadAlertCount}
                    </span>
                  )}
                </button>

                <div
                  onClick={() => setShowCommanderPanel(true)}
                  className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-lg cursor-pointer hover:border-slate-700 transition-all min-h-[44px]"
                  title="Commander Clearance Profile"
                >
                  <div className="text-right font-mono leading-none">
                    <div className="text-[9px] text-amber-400 font-bold tracking-wider uppercase">
                      Commander:
                    </div>
                    <div className="text-slate-100 font-bold text-[11px] truncate max-w-[125px] mt-0.5">
                      {currentUser.name}
                    </div>
                  </div>
                  <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-900 to-indigo-900 border border-blue-500/40 flex items-center justify-center text-[10px] text-blue-300 font-mono font-bold shrink-0">
                    JK
                  </div>
                </div>
              </div>
            </div>

            {/* DESKTOP TOP BAR (>= md) */}
            <div className="hidden md:flex md:items-center md:justify-between w-full gap-3">
              {/* Left: Brand Identity & Subtitle */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 via-blue-600 to-indigo-700 shadow-md shadow-blue-900/30 shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-widest text-white uppercase font-sans">
                      RESQ<span className="text-red-500">NET</span>
                    </span>
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase hidden sm:inline font-mono">
                      Emergency Response Intelligence
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>EOC CENTRAL COMMAND</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold" suppressHydrationWarning>
                      {timeString || "SYNCHRONIZING..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: Current Incident Status Banner */}
              <div className="hidden 2xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/90 shadow-sm max-w-lg truncate">
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

              {/* Right Controls: System, Data, Database, Automation, Commander, Logout */}
              <div className="flex items-center gap-2.5 flex-nowrap">
              {/* System: ONLINE */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">System:</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>

              {/* Data: LIVE INTELLIGENCE + SIMULATION */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-600/50 font-mono text-[11px] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-slate-400">Data:</span>
                <span className="text-cyan-300 font-bold tracking-tight">LIVE INTELLIGENCE + SIMULATION</span>
              </div>

              {/* Database Persistence Status Badge */}
              <div
                onClick={() => refreshDatabaseData()}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[11px] shadow-sm cursor-pointer transition-all ${
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

              {/* n8n WORKFLOW ORCHESTRATION INDICATOR */}
              <div
                onClick={() => setActiveTab("automation")}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/80 font-mono text-[11px] text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer hover:bg-indigo-900/90 transition-all"
                title="n8n Automated Workflow Layer: Connected. Click to inspect."
              >
                <GitBranch className="h-3 w-3 text-indigo-400" />
                <span>n8n: {workflowIntegrationStatus?.n8n || "CONNECTED"}</span>
                {simulationStage === "ESCALATED" && (
                  <span className="text-rose-400 ml-0.5 text-[10px] font-black uppercase">
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

              {/* Emergency Email Alert Settings Button */}
              <button
                onClick={() => setShowCommanderPanel(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/70 border border-red-600/60 hover:bg-red-900/80 text-red-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm shadow-red-950/40"
                title="Open Emergency Email Alert Settings & Send Test Alert"
              >
                <Mail className="h-3.5 w-3.5 text-red-400" />
                <span>ALERT SETTINGS</span>
              </button>

              {/* COMMANDER Identity Display & Panel Trigger */}
              <div
                onClick={() => setShowCommanderPanel(true)}
                className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer hover:bg-slate-900/80 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-slate-800"
                title="View Commander Clearance & Authority Profile"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/40 flex items-center justify-center text-blue-300 font-mono text-xs font-bold shadow-md shadow-blue-950/50 shrink-0">
                  JK
                </div>
                <div className="text-left font-mono leading-tight">
                  <div className="text-[10px] text-amber-400 font-extrabold tracking-wider uppercase flex items-center gap-1">
                    <span>COMMANDER</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-slate-100 font-bold text-[11px] flex items-center gap-1">
                    <span className="truncate max-w-[130px] sm:max-w-none">
                      {currentUser.name}
                    </span>
                    <UserCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 px-2.5 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400 hover:border-red-900/60 hover:bg-red-950/40 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-mono font-bold shadow-sm"
                title="Sign out of command session"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* Interactive Commander Profile Panel Modal */}
      <CommanderProfilePanel
        isOpen={showCommanderPanel}
        onClose={() => setShowCommanderPanel(false)}
        onLogout={handleLogout}
        onViewActivity={() => setActiveTab("activity")}
      />
    </>
  );
}
