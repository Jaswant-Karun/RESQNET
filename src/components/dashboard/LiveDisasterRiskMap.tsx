"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  CloudRain,
  Flame,
  AlertTriangle,
  Waves,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  AreaRiskAssessment,
  GdacsAlertEvent,
  FirmsFireDetection,
  WeatherDataPoint,
} from "@/lib/disaster-data/types";

// Dynamically import Leaflet component with SSR disabled
const LiveDisasterRiskMapLeaflet = dynamic(
  () =>
    import("./LiveDisasterRiskMapLeaflet").then(
      (mod) => mod.LiveDisasterRiskMapLeaflet
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] sm:h-[540px] flex flex-col items-center justify-center bg-[#060a14] tactical-grid text-slate-400 font-mono relative overflow-hidden">
        <div className="h-12 w-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
          Loading Live Disaster Risk Map...
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-mono">
          Synchronizing Open-Meteo, GDACS & RESQNET Risk Models
        </div>
      </div>
    ),
  }
);

interface LiveDisasterRiskMapProps {
  assessments: AreaRiskAssessment[];
  gdacsAlerts: GdacsAlertEvent[];
  fireDetections: FirmsFireDetection[];
  weatherForecasts: WeatherDataPoint[];
  onSelectArea?: (area: AreaRiskAssessment) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function LiveDisasterRiskMap({
  assessments,
  gdacsAlerts,
  fireDetections,
  weatherForecasts,
  onSelectArea,
  onRefresh,
  isRefreshing,
}: LiveDisasterRiskMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    riskZones: true,
    weatherPrecipitation: true,
    gdacsAlerts: true,
    firmsHotspots: true,
    simulatedFlood: true,
  });

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <Card
      className={`border border-slate-800 bg-[#080d1a] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none w-screen h-screen"
          : "rounded-xl"
      }`}
    >
      {/* Map Tactical Header */}
      <CardHeader className="py-2.5 px-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                LIVE DISASTER RISK MAP
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-indigo-500/50 text-indigo-300">
                MULTISOURCE GIS
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Open-Meteo Precipitation • GDACS Global Alerts • NASA FIRMS • RESQNET Risk Index
            </p>
          </div>
        </div>

        {/* Layer Controls & Actions */}
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleLayer("riskZones")}
            className={`h-7 px-2.5 text-[10px] font-mono font-bold cursor-pointer transition-all ${
              activeLayers.riskZones
                ? "bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-red-950/90 border-orange-500 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.25)]"
                : "bg-slate-900 border-slate-800 text-slate-500 line-through"
            }`}
            title="Forecast Risk Zones: Low (Green), Moderate (Yellow), High (Orange), Critical (Red)"
          >
            <Shield className="h-3 w-3 mr-1 text-orange-400" />
            RISK FORECAST AREAS
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleLayer("weatherPrecipitation")}
            className={`h-7 px-2 text-[10px] font-mono cursor-pointer transition-colors ${
              activeLayers.weatherPrecipitation
                ? "bg-blue-950/80 border-blue-500 text-blue-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            <CloudRain className="h-3 w-3 mr-1" />
            Weather Forecast
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleLayer("gdacsAlerts")}
            className={`h-7 px-2 text-[10px] font-mono cursor-pointer transition-colors ${
              activeLayers.gdacsAlerts
                ? "bg-red-950/80 border-red-500 text-red-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Live: GDACS
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleLayer("firmsHotspots")}
            className={`h-7 px-2 text-[10px] font-mono cursor-pointer transition-colors ${
              activeLayers.firmsHotspots
                ? "bg-amber-950/80 border-amber-500 text-amber-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            <Flame className="h-3 w-3 mr-1" />
            Live: FIRMS
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleLayer("simulatedFlood")}
            className={`h-7 px-2 text-[10px] font-mono cursor-pointer transition-colors ${
              activeLayers.simulatedFlood
                ? "bg-cyan-950/80 border-dashed border-cyan-500 text-cyan-300"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            <Waves className="h-3 w-3 mr-1" />
            Simulated Flood
          </Button>

          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title="Refresh Live Feeds"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 w-7 p-0 bg-slate-900 border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Map View Container */}
      <CardContent className="p-0 relative flex-1 min-h-[480px] sm:min-h-[520px]">
        <LiveDisasterRiskMapLeaflet
          assessments={assessments}
          gdacsAlerts={gdacsAlerts}
          fireDetections={fireDetections}
          weatherForecasts={weatherForecasts}
          activeLayers={activeLayers}
          onSelectArea={onSelectArea}
        />

        {/* In-map Tactical Classification Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl flex flex-col gap-2 text-[10px] font-mono text-slate-300 shadow-2xl pointer-events-auto max-w-xl">
          {/* Main 6 Classification Categories */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600 border border-rose-400 shadow-[0_0_6px_#e11d48]" />
              <strong className="text-rose-300">● LIVE EVENT</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-amber-200 shadow-[0_0_6px_#f59e0b]" />
              <strong className="text-amber-300">● FORECAST RISK</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/30 border border-dashed border-amber-400" />
              <strong className="text-amber-400">● SIMULATED INCIDENT</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 border border-cyan-200" />
              <strong className="text-cyan-300">● RESOURCE</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-emerald-300" />
              <strong className="text-emerald-400">● SHELTER</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-blue-300" />
              <strong className="text-blue-400">● HOSPITAL</strong>
            </span>
          </div>

          {/* Risk Level Color Palette */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-500 font-bold uppercase">Risk Scale:</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                <span className="text-red-400">CRITICAL (red)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                <span className="text-orange-400">HIGH (orange)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                <span className="text-yellow-400">MODERATE (yellow)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-400">LOW (green)</span>
              </span>
            </div>
            <span className="text-amber-400 font-semibold text-[9px]">NOT AN OFFICIAL EMERGENCY WARNING</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
