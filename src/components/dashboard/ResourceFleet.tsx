"use client";

import React, { useState } from "react";
import { Drone, Resource } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatteryCharging,
  LifeBuoy,
  Radio,
} from "lucide-react";

interface ResourceFleetProps {
  rescueTeams: Resource[];
  ambulances: Resource[];
  drones: Drone[];
}

export function ResourceFleet({
  rescueTeams,
  ambulances,
  drones,
}: ResourceFleetProps) {
  const [activeTab, setActiveTab] = useState<"teams" | "ambulances" | "drones">(
    "drones"
  );

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs sm:text-sm">
            <Radio className="h-4 w-4 text-blue-400" />
            Tactical Asset Readiness & Fleet Deployment
          </CardTitle>

          {/* Tactical Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => setActiveTab("drones")}
              className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-wider transition-colors ${
                activeTab === "drones"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Drones ({drones.length})
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-wider transition-colors ${
                activeTab === "teams"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Rescue Teams ({rescueTeams.length})
            </button>
            <button
              onClick={() => setActiveTab("ambulances")}
              className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-wider transition-colors ${
                activeTab === "ambulances"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ambulances ({ambulances.length})
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* DRONES TAB */}
        {activeTab === "drones" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {drone.callsign}
                    </span>
                    <div className="text-xs text-slate-300 font-medium">
                      {drone.model}
                    </div>
                  </div>
                  <Badge
                    variant={
                      drone.flightStatus === "AIRBORNE_PATROL"
                        ? "info"
                        : drone.flightStatus === "HOVERING_INSPECTION"
                        ? "warning"
                        : "success"
                    }
                    pulse={drone.flightStatus === "AIRBORNE_PATROL"}
                  >
                    {drone.flightStatus.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Role:</span>
                    <span className="text-slate-200 font-mono font-medium">
                      {drone.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Altitude / Speed:</span>
                    <span className="text-slate-200 font-mono">
                      {drone.altitudeMeters}m @ {drone.groundSpeedKmH} km/h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telemetry Link:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {drone.telemetryLinkStrength}%
                    </span>
                  </div>
                </div>

                {drone.payloadItemDescription && (
                  <div className="p-1.5 rounded bg-blue-950/40 border border-blue-900/50 text-[11px] text-blue-300 flex items-center gap-1.5">
                    <LifeBuoy className="h-3 w-3 shrink-0 text-blue-400" />
                    <span className="truncate">{drone.payloadItemDescription}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-300 font-mono">
                    <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{drone.batteryPercentage}%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {drone.estimatedFlightTimeRemainingMin}m airtime left
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESCUE TEAMS TAB */}
        {activeTab === "teams" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rescueTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {team.callsign}
                    </span>
                    <div className="text-xs text-slate-200 font-medium">
                      {team.name}
                    </div>
                  </div>
                  <Badge
                    variant={
                      team.status === "ON_MISSION"
                        ? "critical"
                        : team.status === "EN_ROUTE"
                        ? "warning"
                        : "success"
                    }
                  >
                    {team.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Commander:</span>
                    <span className="text-slate-200">{team.commander}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Personnel / Cap:</span>
                    <span className="text-slate-200 font-mono">
                      {team.personnelCount} rescuers / {team.capacityPersons} capacity
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Current Zone:</span>
                    <span className="text-blue-400 font-mono">
                      {team.assignedZoneId || "STAGING"}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono truncate">
                  Eq: {team.equipmentInventory.slice(0, 2).join(", ")}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">
                    Location: {team.currentLocation.address}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AMBULANCES TAB */}
        {activeTab === "ambulances" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {amb.callsign}
                    </span>
                    <div className="text-xs text-slate-200 font-medium">
                      {amb.name}
                    </div>
                  </div>
                  <Badge
                    variant={
                      amb.status === "ON_MISSION"
                        ? "critical"
                        : amb.status === "EN_ROUTE"
                        ? "warning"
                        : "success"
                    }
                  >
                    {amb.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>EMT Lead:</span>
                    <span className="text-slate-200">{amb.commander}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medical Capacity:</span>
                    <span className="text-slate-200 font-mono">
                      {amb.capacityPersons} Critical Bed(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ETA to Target:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {amb.etaMinutes ? `${amb.etaMinutes} mins` : "On Site"}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-900/40 text-[10px] text-emerald-300 font-mono truncate">
                  Pack: {amb.equipmentInventory.slice(0, 2).join(", ")}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">
                    Position: {amb.currentLocation.address}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
