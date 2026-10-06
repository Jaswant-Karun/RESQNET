"use client";

import React from "react";
import { CrisisMap } from "@/components/dashboard/CrisisMap";
import { useDashboard } from "@/context/DashboardContext";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Radio, ShieldAlert } from "lucide-react";

export function CrisisMapView() {
  const { incident, simulationStage, setActiveTab } = useDashboard();
  const isEscalated = simulationStage === "ESCALATED";

  return (
    <div className="space-y-4 pb-12">
      {/* Mobile Top Header Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-950 via-[#0a1122] to-slate-950 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/50 text-blue-400 shrink-0 shadow-md shadow-blue-950/40">
            <MapPin className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black font-mono tracking-wider text-white uppercase">
                TACTICAL CRISIS MAP
              </h1>
              <Badge
                variant={isEscalated ? "critical" : "warning"}
                pulse
                className="text-[10px] font-mono uppercase"
              >
                {isEscalated ? "CATASTROPHIC 6.2m" : "ACTIVE 4.85m"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live GIS Inundation Overlay & GPS Fleet Tracking
            </p>
          </div>
        </div>

        {/* Quick Route Context Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-emerald-400" />
            <span>Route {isEscalated ? "R4 (Clear)" : "R2 (Clear)"}</span>
          </div>

          <button
            onClick={() => setActiveTab("risk-intelligence")}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-600/60 hover:bg-indigo-900/80 text-indigo-200 font-mono text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
            <span>Risk Intel →</span>
          </button>
        </div>
      </div>

      {/* Real Crisis Map Container */}
      <CrisisMap />

      {/* Mobile Tactical Footnote */}
      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          GPS Mesh Sentinel Online
        </span>
        <span className="text-[10px] text-slate-500">
          Refreshed: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
