import React from "react";
import { Incident } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CloudRain, MapPin, Users, Waves } from "lucide-react";

interface IncidentBannerProps {
  incident: Incident;
}

export function IncidentBanner({ incident }: IncidentBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-red-900/60 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Incident Summary */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-900/50 border border-red-700/60 text-red-200 font-bold tracking-wider">
              {incident.code}
            </span>
            <Badge variant="critical" pulse>
              {incident.severity} PRIORITY
            </Badge>
            <Badge variant="warning">
              DISASTER: {incident.disasterType}
            </Badge>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <MapPin className="h-3 w-3 text-red-400" />
              {incident.primaryLocation.name} ({incident.primaryLocation.address})
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {incident.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {incident.operationalSummary}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
            <span>
              <strong className="text-slate-200">Incident Commander:</strong> {incident.commandChief}
            </span>
            <span>•</span>
            <span suppressHydrationWarning>
              <strong className="text-slate-200">Detected:</strong> {new Date(incident.detectedAt).toLocaleTimeString()} IST
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-200">Status:</strong>{" "}
              <span className="text-red-400 font-bold uppercase">{incident.status}</span>
            </span>
          </div>
        </div>

        {/* Real-time telemetry badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 min-w-[260px] bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Waves className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-mono">Water Level</div>
              <div className="text-sm font-bold text-blue-300 font-mono">
                {incident.metrics.waterLevelMeters}m{" "}
                <span className="text-[10px] text-red-400 font-normal">▲ RAPID RISE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <CloudRain className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-mono">Precipitation</div>
              <div className="text-sm font-bold text-amber-300 font-mono">
                {incident.metrics.rainfallRateMmPerHour} mm/h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
            <div className="p-2 rounded bg-red-950/80 border border-red-800/60 text-red-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-mono">Stranded Civilians</div>
              <div className="text-sm font-bold text-red-400 font-mono">
                {incident.metrics.reportedStranded.toLocaleString()} est.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Threats Ticker */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase shrink-0">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Active Threats:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {incident.primaryThreats.map((threat, idx) => (
            <span
              key={idx}
              className="text-xs text-slate-300 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-full"
            >
              {threat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
