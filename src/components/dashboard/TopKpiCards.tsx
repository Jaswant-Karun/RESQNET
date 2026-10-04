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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. Active Incidents */}
      <Card
        glow="red"
        className="bg-slate-900/90 border-slate-800 hover:border-red-700/60 transition-colors"
      >
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium tracking-wider">
              Simulated Incident
            </span>
            <AlertOctagon className="h-4 w-4 text-red-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
              <span>1</span>
              <span className="text-xs font-normal text-red-400 uppercase font-sans">
                {incident.disasterType}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              {incident.zoneName || "Zone A"} • {incident.metrics.waterLevelMeters}m
            </div>
          </div>
          <div className="text-[10px] text-red-400/90 font-mono uppercase flex items-center gap-1 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            {incident.metrics.affectedPopulationEstimated.toLocaleString()} AFFECTED
          </div>
        </CardContent>
      </Card>

      {/* 2. Critical Zones */}
      <Card
        glow={criticalZonesCount > 1 ? "red" : "orange"}
        className="bg-slate-900/90 border-slate-800 hover:border-amber-700/60 transition-colors"
      >
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium tracking-wider">
              Critical Zones
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{criticalZonesCount}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                / {zones.length} Sectors
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              {simulationStage === "ESCALATED"
                ? "Zone A & Zone B Submerged"
                : "Zone A Critical (2.4m)"}
            </div>
          </div>
          <div className="text-[10px] text-amber-400/90 font-mono uppercase font-bold">
            Blocked: {incident.blockedRoads?.join(", ") || "R1, R3"}
          </div>
        </CardContent>
      </Card>

      {/* 3. Available Ambulances */}
      <Card
        glow="green"
        className="bg-slate-900/90 border-slate-800 hover:border-emerald-700/60 transition-colors"
      >
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium tracking-wider">
              Ambulances
            </span>
            <Ambulance className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{ambulances.length}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                Units ({availableAmbulancesCount} Free)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {ambulances.length - availableAmbulancesCount} On Field / Triage
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono uppercase font-bold">
            ALS 108 Fleet (8 Total)
          </div>
        </CardContent>
      </Card>

      {/* 4. Rescue Teams */}
      <Card
        glow="blue"
        className="bg-slate-900/90 border-slate-800 hover:border-blue-700/60 transition-colors"
      >
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium tracking-wider">
              Rescue Teams
            </span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-blue-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{totalRescueTeamsCount}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                Teams ({activeTeamsCount} Active)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              NDRF, SDRF & Coast Guard
            </div>
          </div>
          <div className="text-[10px] text-blue-400/90 font-mono uppercase font-bold">
            62 Rescuers Mobilized
          </div>
        </CardContent>
      </Card>

      {/* 5. Available Drones */}
      <Card
        glow="blue"
        className="bg-slate-900/90 border-slate-800 hover:border-indigo-700/60 transition-colors"
      >
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium tracking-wider">
              Available Drones
            </span>
            <Navigation className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{drones.length}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                UAVs ({availableDronesCount} Ready)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              2 Airborne / 1 Standby
            </div>
          </div>
          <div className="text-[10px] text-indigo-400 font-mono uppercase font-bold">
            Thermal & Payload Drops
          </div>
        </CardContent>
      </Card>

      {/* 6. Shelters */}
      <Card
        glow="green"
        className="bg-slate-900/90 border-slate-800 hover:border-emerald-700/60 transition-colors"
      >
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium tracking-wider">
              Shelters
            </span>
            <Home className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{totalShelterCapacity.toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                Total Beds
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Shelter B: 700 • Shelter C: 1,500
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono uppercase font-bold">
            {availableShelterSpots.toLocaleString()} Free Bed Spots
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
