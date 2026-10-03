import React from "react";
import { Zone } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Layers, Map, Navigation2 } from "lucide-react";

interface MapPlaceholderProps {
  zones: Zone[];
}

export function MapPlaceholder({ zones }: MapPlaceholderProps) {
  return (
    <Card className="overflow-hidden border-slate-800">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-xs sm:text-sm">
            GIS Tactical Spatial Command Canvas
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Badge variant="outline" className="border-blue-800 text-blue-300">
            <Layers className="h-3 w-3 mr-1" />
            4 FLOOD LAYERS
          </Badge>
          <span className="text-slate-400 hidden sm:inline">
            CENTER: 13.0135° N, 80.2312° E
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative min-h-[300px] flex flex-col justify-between bg-slate-950/90 tactical-grid">
        {/* Tactical HUD Header */}
        <div className="p-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-emerald-400 tracking-wider">
              GIS SATELLITE OVERLAY READY
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            DATUM: WGS84 • EPSG:4326
          </div>
        </div>

        {/* Center Tactical Schematic View */}
        <div className="my-auto py-8 px-4 text-center z-10">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 mb-3 shadow-[0_0_25px_rgba(59,130,246,0.25)]">
            <Crosshair className="h-6 w-6 animate-spin text-blue-400" style={{ animationDuration: "20s" }} />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Spatial Flood Inundation & Asset Positioning
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-sans">
            Adyar River Embankment Corridor • 4 Sectors (Alpha/Bravo/Charlie/Delta) with multi-polygon flood telemetry staged for Leaflet OpenStreetMap renderer.
          </p>

          {/* Quick zone status pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {zones.map((z) => (
              <div
                key={z.id}
                className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono flex items-center gap-1.5"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    z.riskLevel === "CRITICAL"
                      ? "bg-red-500"
                      : z.riskLevel === "HIGH"
                      ? "bg-amber-500"
                      : z.riskLevel === "MODERATE"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                  }`}
                />
                <span className="text-slate-300 font-semibold">{z.code}:</span>
                <span className="text-slate-400">{z.waterDepthMeters}m depth</span>
              </div>
            ))}
          </div>
        </div>

        {/* HUD Footer Coordinates */}
        <div className="p-3 border-t border-slate-800/70 bg-slate-950/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 z-10">
          <span className="flex items-center gap-1 text-slate-300">
            <Navigation2 className="h-3 w-3 text-blue-400" />
            STAGING MAP: LEAFLET & OSM ENGINE PRE-CONFIGURED
          </span>
          <span className="text-slate-500">
            SW: [12.990, 80.190] • NE: [13.030, 80.250]
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
