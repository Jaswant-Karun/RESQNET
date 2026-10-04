"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Home,
  Navigation,
  Users,
} from "lucide-react";

export function TopKpiCards() {
  const {
    incident,
    zones,
    ambulances,
    rescueTeams,
    drones,
    shelters,
    simulationStage,
  } = useDashboard();

  const criticalZonesCount = zones.filter((z) => z.riskLevel === "CRITICAL").length;
  const availableAmbulancesCount = ambulances.filter(
    (a) => a.status === "AVAILABLE"
  ).length;
  const totalRescueTeamsCount = rescueTeams.length;
  const activeTeamsCount = rescueTeams.filter(
    (r) => r.status === "ON_MISSION" || r.status === "EN_ROUTE"
  ).length;
  const availableDronesCount = drones.filter(
    (d) => d.flightStatus === "STANDBY_PAD" || d.batteryPercentage > 50
  ).length;

  const totalShelterCapacity = shelters.reduce(
    (acc, s) => acc + s.totalCapacity,
    0
  );
  const totalShelterOccupancy = shelters.reduce(
    (acc, s) => acc + s.currentOccupancy,
    0
  );
  const availableShelterSpots = totalShelterCapacity - totalShelterOccupancy;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. Simulated Incident */}
      <Card
        glow="red"
        className="relative overflow-hidden bg-[#0a0f1e]/90 border-slate-800 hover:border-rose-500/60 transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-rose-400" />
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400">
              Simulated Incident
            </span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span>1</span>
              <span className="text-xs font-bold text-rose-400 uppercase font-mono">
                {incident.disasterType}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
              {incident.zoneName || "Zone A"} • <strong className="text-white">{incident.metrics.waterLevelMeters}m</strong>
            </div>
          </div>
          <div className="text-[10px] text-rose-400/90 font-mono uppercase flex items-center gap-1 font-bold pt-1 border-t border-slate-800/80">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            {incident.metrics.affectedPopulationEstimated.toLocaleString()} AFFECTED
          </div>
        </CardContent>
      </Card>

      {/* 2. Critical Zones */}
      <Card
        glow="amber"
        className="relative overflow-hidden bg-[#0a0f1e]/90 border-slate-800 hover:border-amber-500/60 transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400">
              Critical Zones
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{criticalZonesCount}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                / {zones.length} Sectors
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
              {simulationStage === "ESCALATED"
                ? "Zone A & B Submerged"
                : "Zone A Critical (2.4m)"}
            </div>
          </div>
          <div className="text-[10px] text-amber-400/90 font-mono uppercase font-bold pt-1 border-t border-slate-800/80 truncate">
            Blocked: {incident.blockedRoads?.join(", ") || "R1, R3"}
          </div>
        </CardContent>
      </Card>

      {/* 3. Available Ambulances */}
      <Card
        glow="green"
        className="relative overflow-hidden bg-[#0a0f1e]/90 border-slate-800 hover:border-emerald-500/60 transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-emerald-400" />
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
              Ambulances
            </span>
            <Ambulance className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{ambulances.length}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({availableAmbulancesCount} Ready)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {ambulances.length - availableAmbulancesCount} Assigned to Field
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono uppercase font-bold pt-1 border-t border-slate-800/80">
            CAD 108 Fleet Pool
          </div>
        </CardContent>
      </Card>

      {/* 4. Rescue Teams */}
      <Card
        glow="blue"
        className="relative overflow-hidden bg-[#0a0f1e]/90 border-slate-800 hover:border-blue-500/60 transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-400">
              Rescue Teams
            </span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{totalRescueTeamsCount}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({activeTeamsCount} Active)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
              SDRF & Coast Guard
            </div>
          </div>
          <div className="text-[10px] text-blue-400/90 font-mono uppercase font-bold pt-1 border-t border-slate-800/80">
            Swiftwater Units Mobilized
          </div>
        </CardContent>
      </Card>

      {/* 5. Available Drones */}
      <Card
        glow="purple"
        className="relative overflow-hidden bg-[#0a0f1e]/90 border-slate-800 hover:border-indigo-500/60 transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-indigo-400" />
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-400">
              Drones (UAV)
            </span>
            <Navigation className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{drones.length}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({availableDronesCount} Ready)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              FLIR Recon & Survey
            </div>
          </div>
          <div className="text-[10px] text-indigo-400 font-mono uppercase font-bold pt-1 border-t border-slate-800/80">
            Airborne Corridor Patrol
          </div>
        </CardContent>
      </Card>

      {/* 6. Shelters */}
      <Card
        glow="cyan"
        className="relative overflow-hidden bg-[#0a0f1e]/90 border-slate-800 hover:border-cyan-500/60 transition-all duration-200"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 to-cyan-400" />
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400">
              Shelters
            </span>
            <Home className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{totalShelterCapacity.toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                Beds
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
              Shelter B: 700 • Shelter C: 1,500
            </div>
          </div>
          <div className="text-[10px] text-cyan-400/90 font-mono uppercase font-bold pt-1 border-t border-slate-800/80 truncate">
            {availableShelterSpots.toLocaleString()} Beds Free
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
