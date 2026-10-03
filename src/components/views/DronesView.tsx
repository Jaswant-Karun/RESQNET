"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatteryCharging,
  Crosshair,
  LifeBuoy,
  Navigation,
  Radio,
  Wifi,
} from "lucide-react";

export function DronesView() {
  const { drones } = useDashboard();

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Navigation className="h-5 w-5 text-indigo-400" />
            UNMANNED AERIAL VEHICLE (UAV) COMMAND
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry, thermal reconnaissance video feed, and payload dispatch status.
          </p>
        </div>
        <Badge variant="info">
          {drones.length} FLEET UNITS SYNCED
        </Badge>
      </div>

      {/* Drones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {drones.map((drone) => (
          <Card key={drone.id} glow="blue" className="bg-[#080d1a] border-slate-800">
            <CardHeader className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-row items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-400">
                  {drone.callsign}
                </span>
                <CardTitle className="text-sm font-bold text-white">
                  {drone.model}
                </CardTitle>
              </div>
              <Badge
                variant={
                  drone.flightStatus === "AIRBORNE_PATROL"
                    ? "info"
                    : drone.flightStatus === "HOVERING_INSPECTION"
                    ? "warning"
                    : "success"
                }
                pulse={drone.flightStatus !== "STANDBY_PAD"}
              >
                {drone.flightStatus.replace(/_/g, " ")}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Tactical Role:</span>
                  <span className="text-white font-semibold">
                    {drone.role.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Altitude:</span>
                  <span className="text-blue-300 font-bold">{drone.altitudeMeters} meters</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ground Speed:</span>
                  <span className="text-white">{drone.groundSpeedKmH} km/h</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Telemetry Link:</span>
                  <span className="text-emerald-400 font-bold">{drone.telemetryLinkStrength}% Signal</span>
                </div>
              </div>

              {/* Payload item */}
              {drone.payloadItemDescription && (
                <div className="p-2 rounded bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-200 flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Payload: {drone.payloadItemDescription}</span>
                </div>
              )}

              {/* Battery & Flight Time */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <BatteryCharging className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold">{drone.batteryPercentage}%</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  ~{drone.estimatedFlightTimeRemainingMin}m airtime left
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
