import React from "react";
import { Hospital, RoadSegment, Shelter } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  HeartPulse,
  Home,
  Navigation,
  ShieldX,
} from "lucide-react";

interface InfrastructureStatusProps {
  hospitals: Hospital[];
  shelters: Shelter[];
  roads: RoadSegment[];
}

export function InfrastructureStatus({
  hospitals,
  shelters,
  roads,
}: InfrastructureStatusProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Hospitals */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs sm:text-sm">
            <HeartPulse className="h-4 w-4 text-emerald-400" />
            Hospitals & Trauma Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 space-y-3">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-100">
                    {hosp.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {hosp.type.replace(/_/g, " ")} • {hosp.location.elevationMeters}m elev
                  </div>
                </div>
                <Badge
                  variant={
                    hosp.floodRisk === "FLOOD_SURROUNDED"
                      ? "critical"
                      : hosp.floodRisk === "MODERATE"
                      ? "warning"
                      : "success"
                  }
                >
                  {hosp.floodRisk.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Available Beds</div>
                  <div className="font-bold text-emerald-400">
                    {hosp.availableBeds} / {hosp.totalBeds}
                  </div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">ICU Capacity</div>
                  <div className="font-bold text-blue-400">
                    {hosp.icuAvailable} / {hosp.icuTotal}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>Power: <strong className={hosp.powerBackupStatus === "FAILING" ? "text-red-400" : "text-emerald-400"}>{hosp.powerBackupStatus}</strong></span>
                <span>Radio: {hosp.contactRadio}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Shelters & Evac Centers */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs sm:text-sm">
            <Home className="h-4 w-4 text-blue-400" />
            Designated Relief Shelters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 space-y-3">
          {shelters.map((shelter) => {
            const occupancyPct = Math.round(
              (shelter.currentOccupancy / shelter.totalCapacity) * 100
            );

            return (
              <div
                key={shelter.id}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-100">
                      {shelter.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {shelter.type.replace(/_/g, " ")}
                    </div>
                  </div>
                  <Badge
                    variant={
                      shelter.status === "FULL"
                        ? "critical"
                        : shelter.status === "NEAR_CAPACITY"
                        ? "warning"
                        : "success"
                    }
                  >
                    {shelter.status}
                  </Badge>
                </div>

                {/* Occupancy bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="text-slate-200 font-bold">
                      {shelter.currentOccupancy.toLocaleString()} / {shelter.totalCapacity.toLocaleString()} ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        occupancyPct >= 100
                          ? "bg-red-500"
                          : occupancyPct > 80
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>Water: {shelter.waterSupplyDays} Days</span>
                  <span>Rations: {shelter.foodRationsDays} Days</span>
                  <span>Med Station: {shelter.medicalStationPresent ? "YES" : "NO"}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 3. Road Network & Arterials */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs sm:text-sm">
            <Navigation className="h-4 w-4 text-amber-400" />
            Critical Road Corridors & Bridges
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 space-y-2.5">
          {roads.map((road) => (
            <div
              key={road.id}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <span>{road.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {road.routeCode}
                  </div>
                </div>
                <Badge
                  variant={
                    road.status === "SUBMERGED" || road.status === "IMPASSABLE"
                      ? "critical"
                      : road.status === "WATERLOGGED"
                      ? "warning"
                      : "success"
                  }
                >
                  {road.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Water Depth:</span>
                <span className={road.waterDepthCm > 50 ? "text-red-400 font-bold" : "text-slate-200"}>
                  {road.waterDepthCm} cm
                </span>
              </div>

              {road.detourRouteName && (
                <div className="text-[10px] font-mono text-amber-400/90 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                  Detour: {road.detourRouteName}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
