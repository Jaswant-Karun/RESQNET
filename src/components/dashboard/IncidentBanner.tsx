import React from "react";
import { Incident } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CloudRain, MapPin, Users, Waves, ShieldAlert } from "lucide-react";

interface IncidentBannerProps {
  incident: Incident;
}

export function IncidentBanner({ incident }: IncidentBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-2xl hud-corner transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Incident Summary */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-rose-950/80 border border-rose-600/70 text-rose-200 font-bold tracking-wider shadow-sm">
              {incident.code}
            </span>
            <Badge variant="critical" pulse className="px-2 py-0.5">
              {incident.severity} PRIORITY
            </Badge>
            <Badge variant="neutral" className="bg-amber-950/70 border-amber-600/70 text-amber-300 font-mono font-bold text-[10px]">
              SIMULATED INCIDENT • {incident.disasterType}
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-900/80 text-slate-300 font-mono text-[10px]">
              SIMULATION MODE
            </Badge>
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
              <MapPin className="h-3 w-3 text-rose-400" />
              {incident.primaryLocation.name}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
            <span>{incident.title}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {incident.operationalSummary}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono">
            <span>
              <strong className="text-slate-200 font-semibold">Incident Commander:</strong> {incident.commandChief}
            </span>
            <span>•</span>
            <span suppressHydrationWarning>
              <strong className="text-slate-200 font-semibold">Detected:</strong> {new Date(incident.detectedAt).toLocaleTimeString()} IST
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-200 font-semibold">Status:</strong>{" "}
              <span className="text-rose-400 font-bold uppercase">{incident.status}</span>
            </span>
          </div>
        </div>

        {/* Real-time telemetry badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 min-w-[280px] bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-500/50 text-blue-400 shrink-0">
              <Waves className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Water Level</div>
              <div className="text-sm font-black text-blue-300 font-mono">
                {incident.metrics.waterLevelMeters}m{" "}
                <span className="text-[10px] text-rose-400 font-bold">▲ RAPID RISE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-400 shrink-0">
              <CloudRain className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Precipitation</div>
              <div className="text-sm font-black text-amber-300 font-mono">
                {incident.metrics.rainfallRateMmPerHour} mm/h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-400 shrink-0">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Stranded Civilians</div>
              <div className="text-sm font-black text-rose-400 font-mono">
                {incident.metrics.reportedStranded.toLocaleString()} est.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Threats Ticker */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase shrink-0 font-mono">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Active Threats:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {incident.primaryThreats.map((threat, idx) => (
            <span
              key={idx}
              className="text-xs text-slate-200 bg-slate-950/90 border border-slate-800 px-3 py-0.5 rounded-full font-sans shadow-sm"
            >
              {threat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
