import React from "react";
import { DisasterDataSet } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Ambulance,
  Compass,
  HeartPulse,
  Home,
  Navigation,
} from "lucide-react";

interface MetricsOverviewProps {
  data: DisasterDataSet;
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  const { incident, zones, hospitals, shelters, ambulances, rescueTeams, drones } = data;

  const totalHospitalBeds = hospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const shelterFreeSpots = totalShelterCapacity - totalShelterOccupancy;

  const activeAmbulances = ambulances.filter((a) => a.status === "AVAILABLE" || a.status === "ON_MISSION").length;
  const activeTeams = rescueTeams.filter((r) => r.status === "ON_MISSION" || r.status === "AVAILABLE").length;
  const airborneDrones = drones.filter((d) => d.flightStatus === "AIRBORNE_PATROL" || d.flightStatus === "HOVERING_INSPECTION").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. Threat & Basin Status */}
      <Card glow="red" className="bg-slate-900/90">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium">Risk Status</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-red-400 font-mono tracking-tight">
              CRITICAL
            </div>
            <div className="text-[11px] text-slate-400">
              Depth: {incident.metrics.waterLevelMeters}m (+0.4m/h)
            </div>
          </div>
          <div className="text-[10px] text-red-400/80 font-mono uppercase">
            Embankment Gate 7 Overtopped
          </div>
        </CardContent>
      </Card>

      {/* 2. Population At Risk */}
      <Card glow="orange" className="bg-slate-900/90">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium">Affected Pop</span>
            <Compass className="h-4 w-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-amber-400 font-mono tracking-tight">
              {incident.metrics.affectedPopulationEstimated.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Evacuated: {incident.metrics.confirmedEvacuated.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono uppercase">
            36% Evacuation Progress
          </div>
        </CardContent>
      </Card>

      {/* 3. Rescue Units On Field */}
      <Card glow="blue" className="bg-slate-900/90">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium">Rescue Units</span>
            <Ambulance className="h-4 w-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-blue-400 font-mono tracking-tight">
              {activeTeams + activeAmbulances}{" "}
              <span className="text-xs font-normal text-slate-400">Deployed</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {activeTeams} Boats/Squads • {activeAmbulances} Ambulances
            </div>
          </div>
          <div className="text-[10px] text-blue-400/80 font-mono uppercase">
            NDRF & SDRF Mobilized
          </div>
        </CardContent>
      </Card>

      {/* 4. UAV Drone Recon */}
      <Card glow="blue" className="bg-slate-900/90">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium">UAV Fleet</span>
            <Navigation className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-indigo-400 font-mono tracking-tight">
              {airborneDrones}/{drones.length}{" "}
              <span className="text-xs font-normal text-slate-400">Airborne</span>
            </div>
            <div className="text-[11px] text-slate-400">
              1 Thermal • 1 Life-Drop • 1 Med
            </div>
          </div>
          <div className="text-[10px] text-indigo-300 font-mono uppercase">
            Continuous Telemetry Link
          </div>
        </CardContent>
      </Card>

      {/* 5. Hospital ICU & Bed Availability */}
      <Card glow="green" className="bg-slate-900/90">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium">Available Beds</span>
            <HeartPulse className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
              {totalHospitalBeds}{" "}
              <span className="text-xs font-normal text-slate-400">Total Free</span>
            </div>
            <div className="text-[11px] text-slate-400">
              7 Acute ICU Beds Available
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono uppercase">
            Apex Trauma Online
          </div>
        </CardContent>
      </Card>

      {/* 6. Shelters & Relief Hubs */}
      <Card glow="green" className="bg-slate-900/90">
        <CardContent className="p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-mono font-medium">Shelter Capacity</span>
            <Home className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
              {shelterFreeSpots.toLocaleString()}{" "}
              <span className="text-xs font-normal text-slate-400">Open Spots</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {totalShelterOccupancy.toLocaleString()} / {totalShelterCapacity.toLocaleString()} Occupied
            </div>
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono uppercase">
            Alandur Stadium Receiving
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
