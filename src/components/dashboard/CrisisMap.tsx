"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Crosshair,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  Maximize2,
  Navigation2,
  Radio,
  ShieldAlert,
  Waves,
} from "lucide-react";

export function CrisisMap() {
  const {
    incident,
    zones,
    selectedZone,
    setSelectedZone,
    drones,
    rescueTeams,
    ambulances,
    hospitals,
    shelters,
    roads,
    simulationStage,
  } = useDashboard();

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    floodHeatmap: true,
    drones: true,
    rescueUnits: true,
    infrastructure: true,
    roads: true,
  });

  const [activeViewMode, setActiveViewMode] = useState<"TERRAIN" | "THERMAL_IR" | "ELEVATION">("TERRAIN");

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="border-slate-800 bg-[#080d1a] overflow-hidden shadow-2xl flex flex-col">
      {/* Map Control Header */}
      <CardHeader className="py-2.5 px-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </div>
          <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-2">
            CRISIS TACTICAL GIS MAP
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-[11px] text-blue-400 font-semibold font-mono">
              ADYAR RIVERFRONT SECTOR
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

          <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono text-[11px]">
            WGS84 • EPSG:4326
          </Badge>
        </div>
      </CardHeader>

      {/* Main Interactive Map Surface */}
      <CardContent className="p-0 relative h-[480px] sm:h-[540px] w-full flex flex-col justify-between tactical-grid bg-[#0a0f1d] overflow-hidden select-none">
        {/* Radar concentric tactical sweep circles */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-[300px] h-[300px] rounded-full border border-blue-500/30" />
          <div className="w-[500px] h-[500px] rounded-full border border-blue-500/20 absolute" />
          <div className="w-[700px] h-[700px] rounded-full border border-blue-500/10 absolute" />
          <div className="w-full h-[1px] bg-blue-500/20 absolute" />
          <div className="h-full w-[1px] bg-blue-500/20 absolute" />
        </div>

        {/* Top HUD: Coordinates & Quick Layer Filters */}
        <div className="p-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-slate-950/80 to-transparent">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/90 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 backdrop-blur-sm">
            <Crosshair className="h-3.5 w-3.5 text-blue-400" />
            <span>ORIGIN: 13.0135° N, 80.2312° E</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">SURGE: {incident.metrics.waterLevelMeters}m</span>
          </div>

          {/* Quick Layer Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <button
              onClick={() => toggleLayer("floodHeatmap")}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                layers.floodHeatmap
                  ? "bg-blue-950/80 border-blue-600 text-blue-300"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
              }`}
            >
              <Waves className="h-3 w-3" />
              Flood Poly
            </button>
            <button
              onClick={() => toggleLayer("drones")}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                layers.drones
                  ? "bg-indigo-950/80 border-indigo-600 text-indigo-300"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
              }`}
            >
              <Navigation2 className="h-3 w-3" />
              Drones ({drones.length})
            </button>
            <button
              onClick={() => toggleLayer("rescueUnits")}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                layers.rescueUnits
                  ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
                  : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
              }`}
            >
              <MapPin className="h-3 w-3" />
              Rescue Units
            </button>
          </div>
        </div>

        {/* Center: Tactical Sector Grid Visualization */}
        <div className="relative flex-1 p-4 grid grid-cols-2 gap-3 z-10 overflow-hidden">
          {zones.map((zone) => {
            const isSelected = selectedZone?.id === zone.id;
            const isCritical = zone.riskLevel === "CRITICAL";
            const isHigh = zone.riskLevel === "HIGH";

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`relative rounded-lg p-3 cursor-pointer transition-all border flex flex-col justify-between backdrop-blur-sm ${
                  isCritical
                    ? "bg-red-950/30 border-red-600/70 hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    : isHigh
                    ? "bg-amber-950/25 border-amber-600/60 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : zone.riskLevel === "MODERATE"
                    ? "bg-blue-950/20 border-blue-600/50 hover:border-blue-400"
                    : "bg-emerald-950/20 border-emerald-600/50 hover:border-emerald-400"
                } ${isSelected ? "ring-2 ring-white/60" : ""}`}
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-white border border-slate-700">
                      {zone.code}
                    </span>
                    <h5 className="text-xs font-semibold text-white mt-1">
                      {zone.name}
                    </h5>
                  </div>
                  <Badge
                    variant={
                      isCritical ? "critical" : isHigh ? "warning" : "info"
                    }
                    pulse={isCritical}
                    className="text-[10px]"
                  >
                    {zone.riskLevel}
                  </Badge>
                </div>

                {/* Zone Telemetry */}
                <div className="my-2 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Inundation Depth:</span>
                    <span
                      className={`font-bold ${
                        isCritical
                          ? "text-red-400"
                          : isHigh
                          ? "text-amber-400"
                          : "text-blue-300"
                      }`}
                    >
                      {zone.waterDepthMeters > 0
                        ? `${zone.waterDepthMeters}m depth`
                        : "Dry Land (Highland)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Population:</span>
                    <span className="text-slate-200">
                      {zone.populationEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Evac Progress:</span>
                    <span className="text-emerald-400 font-bold">
                      {zone.evacuationProgressPercentage}%
                    </span>
                  </div>
                </div>

                {/* Tactical Assets inside this zone */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    {zone.id === "zone-red-alpha" && (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <Crosshair className="h-3 w-3" />
                        STRANDED VICTIMS DETECTED
                      </span>
                    )}
                    {zone.id === "zone-green-delta" && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        PRIMARY STAGING CAMP
                      </span>
                    )}
                    {zone.id === "zone-orange-bravo" && (
                      <span className="text-amber-400 font-bold">
                        BRIDGE ROUTE CLOSED
                      </span>
                    )}
                    {zone.id === "zone-yellow-charlie" && (
                      <span className="text-blue-400">
                        APEX HOSPITAL SECURE
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500">
                    [{zone.center.latitude.toFixed(3)}, {zone.center.longitude.toFixed(3)}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Drone & Asset Overlay Bar */}
        {layers.drones && (
          <div className="mx-3 mb-2 p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-10">
            <div className="flex items-center gap-2 text-indigo-400">
              <Navigation2 className="h-3.5 w-3.5 animate-pulse" />
              <span className="font-bold">ACTIVE UAV SURVEILLANCE VECTORS:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              {drones.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">{d.callsign}</span>
                  <span className="text-slate-400">
                    Alt {d.altitudeMeters}m • {d.batteryPercentage}% bat
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Status & GIS Staging Info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 z-10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-semibold">
              OpenStreetMap + Leaflet Engine Ready
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Active Scenario: {incident.title}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            CLICK ON ANY SECTOR CARD TO INSPECT INFRASTRUCTURE & DISPATCH
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
