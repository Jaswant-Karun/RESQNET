"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ambulance,
  HeartPulse,
  Home,
  Navigation,
  Radio,
  Truck,
  Users,
} from "lucide-react";

import { ResourceAllocationPanel } from "@/components/dashboard/ResourceAllocationPanel";

export function ResourcesView() {
  const { ambulances, rescueTeams, hospitals, shelters, roads } = useDashboard();
  const [filter, setFilter] = useState<"ALL" | "TEAMS" | "AMBULANCES" | "FACILITIES">("ALL");

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-400" />
            FIELD RESOURCE & INFRASTRUCTURE REGISTRY
          </h2>
          <p className="text-xs text-slate-400">
            Real-time status of ambulances, rescue boat battalions, hospital beds, and relief shelters.
          </p>
        </div>
      </div>

      {/* Intelligent Resource Allocation Panel */}
      <ResourceAllocationPanel />

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-md text-xs font-mono">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "ALL" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter("TEAMS")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "TEAMS" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            TEAMS ({rescueTeams.length})
          </button>
          <button
            onClick={() => setFilter("AMBULANCES")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "AMBULANCES" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            MEDIC ({ambulances.length})
          </button>
          <button
            onClick={() => setFilter("FACILITIES")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "FACILITIES" ? "bg-blue-600 text-white font-bold" : "text-slate-400"
            }`}
          >
            FACILITIES
          </button>
        </div>
      </div>

      {/* Rescue Teams & Ambulances */}
      {(filter === "ALL" || filter === "TEAMS") && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-400" />
            Swiftwater & Civil Defence Teams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rescueTeams.map((team) => (
              <Card key={team.id} className="bg-slate-950/80 border-slate-800">
                <CardHeader className="p-3.5 border-b border-slate-800/80 flex flex-row items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {team.callsign}
                    </span>
                    <div className="text-xs font-semibold text-white">{team.name}</div>
                  </div>
                  <Badge variant={team.status === "ON_MISSION" ? "critical" : "success"}>
                    {team.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Commander:</span>
                    <span className="text-white">{team.commander}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Personnel / Cap:</span>
                    <span className="text-white">
                      {team.personnelCount} rescuers / {team.capacityPersons} cap
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Location:</span>
                    <span className="text-blue-300 truncate max-w-[150px]">
                      {team.currentLocation.address}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                    Eq: {team.equipmentInventory.join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ambulances */}
      {(filter === "ALL" || filter === "AMBULANCES") && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
            <Ambulance className="h-4 w-4 text-emerald-400" />
            Emergency Medical Service (108 ALS Fleet)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ambulances.map((amb) => (
              <Card key={amb.id} className="bg-slate-950/80 border-slate-800">
                <CardHeader className="p-3.5 border-b border-slate-800/80 flex flex-row items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {amb.callsign}
                    </span>
                    <div className="text-xs font-semibold text-white">{amb.name}</div>
                  </div>
                  <Badge variant={amb.status === "ON_MISSION" ? "critical" : "success"}>
                    {amb.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Lead Paramedic:</span>
                    <span className="text-white">{amb.commander}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fuel / Battery:</span>
                    <span className="text-emerald-400 font-bold">{amb.fuelOrBatteryLevel}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ETA:</span>
                    <span className="text-amber-400 font-bold">
                      {amb.etaMinutes ? `${amb.etaMinutes} mins` : "On Site"}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-[10px] text-emerald-300">
                    Equipment: {amb.equipmentInventory.join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Hospitals and Shelters */}
      {(filter === "ALL" || filter === "FACILITIES") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Hospitals */}
          <Card className="bg-slate-950/80 border-slate-800">
            <CardHeader className="p-3.5 border-b border-slate-800">
              <CardTitle className="text-xs font-mono uppercase text-white flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-red-400" />
                Hospitals & Trauma Institutes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-white font-semibold">{hosp.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Beds: {hosp.availableBeds}/{hosp.totalBeds} • ICU: {hosp.icuAvailable}/{hosp.icuTotal}
                    </div>
                  </div>
                  <Badge variant={hosp.floodRisk === "FLOOD_SURROUNDED" ? "critical" : "success"}>
                    {hosp.floodRisk}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shelters */}
          <Card className="bg-slate-950/80 border-slate-800">
            <CardHeader className="p-3.5 border-b border-slate-800">
              <CardTitle className="text-xs font-mono uppercase text-white flex items-center gap-2">
                <Home className="h-4 w-4 text-emerald-400" />
                Relief Shelters & Hubs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              {shelters.map((shelter) => (
                <div
                  key={shelter.id}
                  className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-white font-semibold">{shelter.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Occupancy: {shelter.currentOccupancy} / {shelter.totalCapacity} ({Math.round((shelter.currentOccupancy/shelter.totalCapacity)*100)}%)
                    </div>
                  </div>
                  <Badge variant={shelter.status === "FULL" ? "critical" : "success"}>
                    {shelter.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
