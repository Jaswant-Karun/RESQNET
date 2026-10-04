"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Bot,
  CheckCircle2,
  Droplets,
  Flame,
  Home,
  Navigation,
  RefreshCw,
  Route,
  ShieldAlert,
  Users,
  Waves,
  Zap,
} from "lucide-react";

export function EscalationComparisonPanel() {
  const { simulationStage, incident, plan, resourceAllocationState } = useDashboard();

  const isEscalated = simulationStage === "ESCALATED";

  return (
    <Card className="border-2 border-slate-800 bg-[#070c18] shadow-2xl overflow-hidden font-mono">
      {/* HEADER STRIP */}
      <CardHeader className="py-3 px-4 sm:px-6 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg border ${
              isEscalated
                ? "bg-red-950/80 border-red-500/70 text-red-400"
                : "bg-blue-950/80 border-blue-500/60 text-blue-400"
            }`}
          >
            {isEscalated ? (
              <Flame className="h-4 w-4 animate-pulse text-red-400" />
            ) : (
              <RefreshCw className="h-4 w-4 text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 uppercase">
                ADAPTIVE ESCALATION: BEFORE vs AFTER
              </CardTitle>
              <Badge
                variant={isEscalated ? "critical" : "info"}
                className="text-[10px] uppercase font-bold"
                pulse={isEscalated}
              >
                {isEscalated ? "ESCALATION ACTIVE" : "BASELINE SCENARIO"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Live proof of dynamic multi-criteria re-routing and autonomous resource scaling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-indigo-500/40 text-indigo-300 bg-indigo-950/40 text-[10px] hidden sm:flex items-center gap-1"
          >
            <Bot className="h-3 w-3 text-indigo-400" />
            Adaptive Response Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* SIDE-BY-SIDE COMPARISON GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* COLUMN 1: BEFORE ESCALATION */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              !isEscalated
                ? "bg-slate-900/80 border-blue-500/60 shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/30"
                : "bg-slate-950/40 border-slate-800/80 opacity-75"
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  BEFORE ESCALATION
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Baseline Flood
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* WATER LEVEL */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-blue-400" />
                  Water level:
                </span>
                <span className="font-bold text-slate-100">2.4m</span>
              </div>

              {/* AFFECTED POPULATION */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  Affected population:
                </span>
                <span className="font-bold text-slate-100">1,240</span>
              </div>

              {/* BLOCKED ROADS */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Blocked roads:
                </span>
                <span className="font-bold text-amber-300">R1, R3</span>
              </div>

              {/* EVACUATION ROUTE */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Route className="h-3.5 w-3.5 text-emerald-400" />
                  Evacuation route:
                </span>
                <span className="font-bold text-emerald-400">R2 (Clear)</span>
              </div>

              {/* SHELTER */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-indigo-400" />
                  Shelter:
                </span>
                <span className="font-bold text-indigo-300">Shelter B (Cap: 700)</span>
              </div>

              {/* RESOURCES */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/50 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Ambulance className="h-3.5 w-3.5 text-cyan-400" />
                  Resources:
                </span>
                <span className="font-bold text-cyan-300 text-[11px]">
                  2 Amb, 2 Rescue, 1 Drone
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: AFTER ESCALATION */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isEscalated
                ? "bg-gradient-to-b from-[#1c0a0a]/90 via-[#130b14]/90 to-[#080d1a]/90 border-red-500/80 shadow-xl shadow-red-950/40 ring-1 ring-red-500/40"
                : "bg-slate-950/30 border-slate-800/60 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  AFTER ESCALATION
                </span>
              </div>
              <span className="text-[10px] text-red-300 bg-red-950/80 border border-red-700/60 px-2 py-0.5 rounded font-bold">
                Adaptive Recalculation
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* WATER LEVEL */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-red-900/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-red-400" />
                  Water level:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-red-400 text-sm">3.1m</span>
                  <Badge variant="critical" className="text-[9px] px-1.5 py-0">
                    +0.7m Surge
                  </Badge>
                </div>
              </div>

              {/* AFFECTED POPULATION */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-red-900/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-red-400" />
                  Affected population:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-red-300 text-sm">2,180</span>
                  <Badge variant="critical" className="text-[9px] px-1.5 py-0">
                    +940 Civilians
                  </Badge>
                </div>
              </div>

              {/* BLOCKED ROADS */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-red-900/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  Blocked roads:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-red-300">R1, R2, R3</span>
                  <Badge variant="critical" className="text-[9px] px-1.5 py-0 animate-pulse">
                    R2 Submerged!
                  </Badge>
                </div>
              </div>

              {/* EVACUATION ROUTE */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-emerald-900/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Route className="h-3.5 w-3.5 text-emerald-400" />
                  Evacuation route:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-emerald-300 text-sm">R4</span>
                  <Badge variant="success" className="text-[9px] px-1.5 py-0">
                    Re-routed (Highland Pass)
                  </Badge>
                </div>
              </div>

              {/* SHELTER */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-indigo-900/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-indigo-400" />
                  Shelter:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-indigo-300">Shelter C</span>
                  <Badge variant="info" className="text-[9px] px-1.5 py-0">
                    Cap: 1,500
                  </Badge>
                </div>
              </div>

              {/* RESOURCES */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-cyan-900/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Ambulance className="h-3.5 w-3.5 text-cyan-400" />
                  Resources:
                </span>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-cyan-300 text-[11px]">4 Amb, 3 Rescue, 2 Drones</span>
                  <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                    Scaled +100%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADAPTIVE SUMMARY BANNER */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Adaptive Intelligence Rationale:</strong> When Route R2 failed, RESQNET
              instantly invalidated the prior plan, scaled strike units to 4 Amb / 3 Rescue / 2 UAVs,
              and shifted safe evacuation to <strong>Route R4 → Shelter C</strong>.
            </span>
          </div>

          <div className="text-[10px] text-slate-400 shrink-0 font-mono">
            ENGINE: <strong className="text-emerald-400">RESQNET ADAPTIVE CORE</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
