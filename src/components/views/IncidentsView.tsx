"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagon,
  AlertTriangle,
  CloudRain,
  Droplets,
  MapPin,
  ShieldAlert,
  Users,
  Waves,
} from "lucide-react";

export function IncidentsView() {
  const { incident, zones, simulationStage } = useDashboard();

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-500" />
            INCIDENT MANAGEMENT DIRECTORY
          </h2>
          <p className="text-xs text-slate-400">
            Current active crisis events, hydrological telemetry, and disaster impact sectors.
          </p>
        </div>
        <Badge variant="critical" pulse>
          1 ACTIVE CRISIS EVENT
        </Badge>
      </div>

      {/* Main Active Incident Detailed Card */}
      <Card glow="red" className="bg-[#080d1a] border-slate-800">
        <CardHeader className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                {incident.code}
              </span>
              <Badge variant="critical">{incident.severity}</Badge>
              <span suppressHydrationWarning className="text-xs text-slate-400 font-mono">
                {new Date(incident.detectedAt).toLocaleString()}
              </span>
            </div>
            <CardTitle className="text-base font-bold text-white">
              {incident.title}
            </CardTitle>
          </div>
          <div className="text-right font-mono text-xs hidden sm:block">
            <div className="text-slate-400">COMMAND CHIEF</div>
            <div className="text-white font-bold">{incident.commandChief}</div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {incident.operationalSummary}
          </p>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Water Level</div>
              <div className="text-lg font-bold text-blue-400 mt-1">
                {incident.metrics.waterLevelMeters} m
              </div>
              <div className="text-[10px] text-red-400">Trend: {incident.metrics.waterLevelTrend}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Precipitation</div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {incident.metrics.rainfallRateMmPerHour} mm/h
              </div>
              <div className="text-[10px] text-slate-400">Cloudburst Core</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">At-Risk Citizens</div>
              <div className="text-lg font-bold text-white mt-1">
                {incident.metrics.affectedPopulationEstimated.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400">
                Evacuated: {incident.metrics.confirmedEvacuated.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Stranded Victims</div>
              <div className="text-lg font-bold text-red-400 mt-1">
                {incident.metrics.reportedStranded.toLocaleString()} est.
              </div>
              <div className="text-[10px] text-amber-400">Terrace & Rooftops</div>
            </div>
          </div>

          {/* Threats List */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Identified Threat Vectors ({incident.primaryThreats.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {incident.primaryThreats.map((threat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="text-red-400 font-mono text-[10px] mt-0.5">▶</span>
                  <span>{threat}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
