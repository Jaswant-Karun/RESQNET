"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Compass,
  Crosshair,
  Layers,
  MapPin,
  Maximize2,
  Navigation2,
  Radio,
  ShieldAlert,
  Waves,
} from "lucide-react";

// Dynamically import Leaflet with SSR disabled to prevent window/document undefined issues
const CrisisMapLeaflet = dynamic(
  () =>
    import("./CrisisMapLeaflet").then((mod) => mod.CrisisMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] sm:h-[540px] flex flex-col items-center justify-center bg-[#060a14] tactical-grid text-slate-400 font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative mb-3.5 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border border-blue-500/30 border-t-blue-400 animate-spin" />
          <Crosshair className="h-6 w-6 text-blue-400 absolute" />
        </div>
        <div className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
          Initializing Leaflet GIS & OpenStreetMap Engine...
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-mono">
          Synchronizing Hydro-Telemetry & Active Evacuation Corridors
        </div>
      </div>
    ),
  }
);

export function CrisisMap() {
  const { incident, simulationStage, drones } = useDashboard();

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    floodHeatmap: true,
    drones: true,
    rescueUnits: true,
    infrastructure: true,
    roads: true,
  });

  const [activeViewMode, setActiveViewMode] = useState<"TERRAIN" | "THERMAL_IR" | "ELEVATION">("TERRAIN");
  const [showLegend, setShowLegend] = useState(true);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="border-slate-800 bg-[#080d1a] overflow-hidden shadow-2xl flex flex-col">
      {/* 1. MANDATORY SIMULATION WARNING BANNER */}
      <div className="bg-amber-950/80 border-b border-amber-600/70 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="tracking-wide">
            SIMULATION DATA — NOT LIVE EMERGENCY INFORMATION
          </span>
        </div>
        <span className="hidden sm:inline text-amber-400/90 text-[10px] font-normal">
          DISASTER EXERCISE: HACKATHON FLOOD SCENARIO
        </span>
      </div>

      {/* 2. Map Control Header */}
      <CardHeader className="py-2.5 px-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </div>
          <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-2">
            LEAFLET GIS CRISIS MAP
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-[11px] text-blue-400 font-semibold font-mono truncate">
              {incident.primaryLocation.name}
            </span>
          </CardTitle>
        </div>

        {/* View Mode & Layers Switch */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setActiveViewMode("TERRAIN")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                activeViewMode === "TERRAIN"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              TERRAIN
            </button>
            <button
              onClick={() => setActiveViewMode("THERMAL_IR")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                activeViewMode === "THERMAL_IR"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              THERMAL IR
            </button>
            <button
              onClick={() => setActiveViewMode("ELEVATION")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                activeViewMode === "ELEVATION"
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ELEVATION
            </button>
          </div>

          <button
            onClick={() => setShowLegend((v) => !v)}
            className={`px-2 py-1 rounded border text-[11px] transition-colors cursor-pointer font-bold ${
              showLegend
                ? "bg-slate-800 text-white border-slate-600"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            LEGEND {showLegend ? "▲" : "▼"}
          </button>
        </div>
      </CardHeader>

      {/* 3. Layer Filter Pills Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
            LAYERS:
          </span>
          <button
            onClick={() => toggleLayer("floodHeatmap")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.floodHeatmap
                ? "bg-red-950/80 border-red-600 text-red-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Zones A & B
          </button>
          <button
            onClick={() => toggleLayer("infrastructure")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.infrastructure
                ? "bg-blue-950/80 border-blue-600 text-blue-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Hospitals & Shelters
          </button>
          <button
            onClick={() => toggleLayer("rescueUnits")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.rescueUnits
                ? "bg-purple-950/80 border-purple-600 text-purple-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Ambulances & Boats
          </button>
          <button
            onClick={() => toggleLayer("drones")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.drones
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Drones ({drones.length})
          </button>
          <button
            onClick={() => toggleLayer("roads")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.roads
                ? "bg-amber-950/80 border-amber-600 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Blocked Roads
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          SURGE: <strong className="text-white">{incident.metrics.waterLevelMeters}m</strong> (
          <span className="text-red-400 font-bold">
            {simulationStage === "ESCALATED" ? "ESCALATED 6.2m" : "ACTIVE 4.85m"}
          </span>
          )
        </div>
      </div>

      {/* 4. Interactive Map Container with Overlay Legend */}
      <CardContent className="p-0 relative min-h-[480px] sm:min-h-[540px] flex flex-col justify-between overflow-hidden">
        {/* Real Leaflet Map */}
        <div className="absolute inset-0 z-0">
          <CrisisMapLeaflet
            layers={layers}
            activeViewMode={activeViewMode}
          />
        </div>

        {/* TACTICAL OVERLAY LEGEND */}
        {showLegend && (
          <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/95 border border-slate-800 p-3 rounded-lg shadow-2xl backdrop-blur-md max-w-xs text-xs font-mono select-none">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
              <span>MAP TACTICAL LEGEND</span>
              <span className="text-[10px] text-slate-500">EOC CODE</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              {/* RED */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-600 border border-red-400 shadow-[0_0_8px_#ef4444]" />
                <span className="text-slate-300">
                  <strong className="text-red-400">RED:</strong> Critical Zone A
                </span>
              </div>

              {/* ORANGE */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-amber-500 border border-amber-300 shadow-[0_0_8px_#f97316]" />
                <span className="text-slate-300">
                  <strong className="text-amber-400">ORANGE:</strong> High-risk Zone B
                </span>
              </div>

              {/* GREEN */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-300 shadow-[0_0_8px_#10b981]" />
                <span className="text-slate-300">
                  <strong className="text-emerald-400">GREEN:</strong> Shelters B & C
                </span>
              </div>

              {/* BLUE */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-500 border border-blue-300 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-slate-300">
                  <strong className="text-blue-400">BLUE:</strong> Hospitals H1-H3
                </span>
              </div>

              {/* WHITE/BLUE */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-100 border border-sky-400 shadow-[0_0_8px_#38bdf8]" />
                <span className="text-slate-300">
                  <strong className="text-sky-300">WHITE/BLUE:</strong> Ambulance
                </span>
              </div>

              {/* PURPLE */}
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-600 border border-purple-400 shadow-[0_0_8px_#a855f7]" />
                <span className="text-slate-300">
                  <strong className="text-purple-300">PURPLE:</strong> Rescue Teams
                </span>
              </div>

              {/* CYAN */}
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_8px_#22d3ee]" />
                <span className="text-slate-300">
                  <strong className="text-cyan-300">CYAN:</strong> UAV Drones (with flight vectors)
                </span>
              </div>

              {/* BLOCKED ROADS */}
              <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-800">
                <span className="h-0.5 w-4 bg-red-500 border-t border-dashed border-red-300" />
                <span className="text-red-400 font-bold text-[10px]">
                  RED DASHED: Blocked / Submerged Road
                </span>
              </div>

              {/* EVACUATION CORRIDOR */}
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="h-0.5 w-4 bg-emerald-400 border-t border-dashed border-emerald-200" />
                <span className="text-emerald-400 font-bold text-[10px]">
                  GREEN DASHED: Safe Evacuation Corridor
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
