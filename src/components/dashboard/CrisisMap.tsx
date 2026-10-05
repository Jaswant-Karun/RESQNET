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
  const {
    incident,
    simulationStage,
    drones,
    simulateTileError,
    setSimulateTileError,
  } = useDashboard();

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    riskForecastAreas: true, // NEW LAYER: RISK FORECAST AREAS
    liveEvents: true,        // LIVE / OBSERVED (GDACS, FIRMS)
    simulatedIncidents: true,// SIMULATED (Exercise flood zones & drill contour)
    infrastructure: true,   // HOSPITAL & SHELTER
    rescueUnits: true,      // RESOURCE (Ambulance, Rescue)
    drones: true,           // RESOURCE (Drones)
    roads: true,            // ROADS & CORRIDORS
  });

  const [activeViewMode, setActiveViewMode] = useState<"TERRAIN" | "THERMAL_IR" | "ELEVATION">("TERRAIN");
  const [showLegend, setShowLegend] = useState(true);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="border-slate-800 bg-[#080d1a] overflow-hidden shadow-2xl flex flex-col">
      {/* 1. MANDATORY SIMULATION WARNING BANNER & TAXONOMY CLASSIFICATION */}
      <div className="bg-amber-950/80 border-b border-amber-600/70 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono font-bold text-amber-300 gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="tracking-wide">
            SIMULATION DATA — NOT LIVE EMERGENCY INFORMATION
          </span>
          <span className="hidden md:inline px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-500/50 text-[10px] text-amber-200">
            NOT AN OFFICIAL EMERGENCY WARNING
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-amber-400/90 font-normal">
            EXERCISE: ADYAR RIVER BASIN
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-indigo-400 font-semibold">
            LIVE RISK ENGINE CONNECTED
          </span>
        </div>
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
          <Badge variant="outline" className="text-[9px] font-mono border-indigo-500/60 text-indigo-300 hidden xl:inline-flex">
            FORECAST / RISK ASSESSMENT
          </Badge>
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

          {/* Map Tile Resilience Simulation Toggle */}
          <button
            onClick={() => setSimulateTileError(!simulateTileError)}
            className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 font-bold ${
              simulateTileError
                ? "bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle Map Tiles Unavailable"
          >
            <span>{simulateTileError ? "TILES OFFLINE (SIM)" : "TILES ONLINE"}</span>
          </button>

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

      {/* 3. Layer Filter Pills Bar with Strict Separation: LIVE, FORECAST, SIMULATED */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
            LAYERS:
          </span>

          {/* NEW LAYER: RISK FORECAST AREAS */}
          <button
            onClick={() => toggleLayer("riskForecastAreas")}
            className={`px-2.5 py-0.5 rounded text-[11px] border font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              layers.riskForecastAreas
                ? "bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-red-950/90 border-orange-500 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.25)]"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
            title="Forecast Risk Zones: Low (Green), Moderate (Yellow), High (Orange), Critical (Red)"
          >
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 animate-pulse" />
            RISK FORECAST AREAS
          </button>

          {/* LIVE / OBSERVED */}
          <button
            onClick={() => toggleLayer("liveEvents")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.liveEvents
                ? "bg-rose-950/80 border-rose-500 text-rose-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
            title="Live Observed Events: GDACS & NASA FIRMS"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            LIVE / OBSERVED
          </button>

          {/* SIMULATED INCIDENTS */}
          <button
            onClick={() => toggleLayer("simulatedIncidents")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.simulatedIncidents
                ? "bg-amber-950/80 border-dashed border-amber-500 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
            title="Simulated Incidents: Zones A & B Drill Exercise"
          >
            <span className="h-1.5 w-1.5 rounded-full border border-amber-400 bg-amber-500/40" />
            SIMULATED INCIDENTS
          </button>

          {/* HOSPITALS & SHELTERS */}
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

          {/* RESCUE UNITS */}
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

          {/* DRONES */}
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

          {/* ROADS */}
          <button
            onClick={() => toggleLayer("roads")}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 cursor-pointer ${
              layers.roads
                ? "bg-amber-950/80 border-amber-600 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Roads & Corridors
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

        {/* TACTICAL OVERLAY LEGEND WITH EXACT REQUIRED TAXONOMY */}
        {showLegend && (
          <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl shadow-2xl backdrop-blur-md max-w-sm text-xs font-mono select-none">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                TACTICAL MAP CLASSIFICATION
              </span>
              <span className="text-[10px] text-slate-500">RESQNET GIS</span>
            </div>

            <div className="space-y-2 text-[11px]">
              {/* 1. LIVE EVENT */}
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-rose-600 border border-rose-400 shadow-[0_0_8px_#e11d48] shrink-0" />
                <div>
                  <span className="text-rose-300 font-bold">● LIVE EVENT</span>
                  <div className="text-[10px] text-slate-400">Observed real-time events (GDACS alerts & FIRMS satellite fire hotspots)</div>
                </div>
              </div>

              {/* 2. FORECAST RISK */}
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 border border-slate-400 shadow-[0_0_8px_#f59e0b] shrink-0" />
                <div>
                  <span className="text-amber-300 font-bold">● FORECAST RISK</span>
                  <div className="text-[10px] text-slate-400">
                    Risk Forecast Areas:{" "}
                    <span className="text-emerald-400 font-semibold">LOW (green)</span>,{" "}
                    <span className="text-yellow-400 font-semibold">MODERATE (yellow)</span>,{" "}
                    <span className="text-orange-400 font-semibold">HIGH (orange)</span>,{" "}
                    <span className="text-red-400 font-semibold">CRITICAL (red)</span>
                  </div>
                </div>
              </div>

              {/* 3. SIMULATED INCIDENT */}
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-amber-500/20 border-2 border-dashed border-amber-400 shrink-0" />
                <div>
                  <span className="text-amber-400 font-bold">● SIMULATED INCIDENT</span>
                  <div className="text-[10px] text-slate-400">Exercise scenario (Zone A & B drill flood plain, hydro-telemetry)</div>
                </div>
              </div>

              {/* 4. RESOURCE */}
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_8px_#22d3ee] shrink-0" />
                <div>
                  <span className="text-cyan-300 font-bold">● RESOURCE</span>
                  <div className="text-[10px] text-slate-400">Ambulances, Rescue Teams (Boats), UAV Drones</div>
                </div>
              </div>

              {/* 5. SHELTER */}
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-emerald-500 border border-emerald-300 shadow-[0_0_8px_#10b981] shrink-0" />
                <div>
                  <span className="text-emerald-400 font-bold">● SHELTER</span>
                  <div className="text-[10px] text-slate-400">Designated Evacuation Shelters B & C</div>
                </div>
              </div>

              {/* 6. HOSPITAL */}
              <div className="flex items-start gap-2">
                <span className="h-3 w-3 mt-0.5 rounded-full bg-blue-500 border border-blue-300 shadow-[0_0_8px_#3b82f6] shrink-0" />
                <div>
                  <span className="text-blue-400 font-bold">● HOSPITAL</span>
                  <div className="text-[10px] text-slate-400">Regional Trauma Centers & Medical ICUs H1–H3</div>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>Next 24h Projections</span>
              <span className="text-amber-400 font-semibold">NOT AN OFFICIAL WARNING</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
    </Card>
  );
}
