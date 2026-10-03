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
  ShieldAlert,
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
              Active Incidents
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
              {incident.code}
            </div>
          </div>
          <div className="text-[10px] text-red-400/90 font-mono uppercase flex items-center gap-1 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            {simulationStage === "ESCALATED" ? "ESCALATED TIER 1" : "SEVERITY CRITICAL"}
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
                ? "Sectors 7A & 7B Submerged"
                : "Sector 7A Inundated"}
            </div>
          </div>
          <div className="text-[10px] text-amber-400/90 font-mono uppercase font-bold">
            Water depth {incident.metrics.waterLevelMeters}m
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
              <span>{availableAmbulancesCount}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                / {ambulances.length} Free
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {ambulances.length - availableAmbulancesCount} En route to Triage
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono uppercase font-bold">
            ALS 108 Fleet Linked
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
                ({activeTeamsCount} Deployed)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              NDRF & SDRF Boat Units
            </div>
          </div>
          <div className="text-[10px] text-blue-400/90 font-mono uppercase font-bold">
            48 Field Rescuers
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
              <span>{availableDronesCount}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                / {drones.length} Operational
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              2 Airborne Recon / 1 Standby
            </div>
          </div>
          <div className="text-[10px] text-indigo-400 font-mono uppercase font-bold">
            Telemetry 96% Signal
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
              <span>{shelters.length}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                Centers Open
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {availableShelterSpots.toLocaleString()} Free Bed Spots
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/90 font-mono uppercase font-bold">
            Alandur & Guindy Active
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
