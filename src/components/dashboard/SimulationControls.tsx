"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagon,
  AlertTriangle,
  Flame,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";

export function SimulationControls() {
  const {
    simulateFlood,
    simulateEscalation,
    resetSimulation,
    simulationStage,
    simulationStatus,
    incident,
  } = useDashboard();

  return (
    <div className="space-y-2">
      {/* 1. Main Action Strip */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Scenario Indicator & Description */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                EOC Disaster Simulation Engine
              </span>
              <Badge variant="neutral" className="border-amber-600/50 bg-amber-950/40 text-amber-300 font-bold font-mono text-[10px]">
                SIMULATION MODE
              </Badge>
              <Badge
                variant={
                  simulationStage === "ESCALATED"
                    ? "critical"
                    : "warning"
                }
                pulse
                className="font-mono text-[10px]"
              >
                {simulationStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Deterministic incident generation for hackathon crisis coordination. Not real-world emergency telemetry.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Large Primary Button: SIMULATE FLOOD */}
          <Button
            onClick={simulateFlood}
            variant="default"
            className="flex-1 md:flex-initial h-10 px-6 text-xs font-bold font-mono tracking-wider bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-900/30 cursor-pointer"
          >
            <Waves className="h-4 w-4 mr-2" />
            SIMULATE FLOOD
          </Button>

          {/* Secondary Button: SIMULATE ESCALATION */}
          <Button
            onClick={simulateEscalation}
            variant="destructive"
            className="flex-1 md:flex-initial h-10 px-5 text-xs font-bold font-mono tracking-wider bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-lg shadow-red-900/30 cursor-pointer"
          >
            <Flame className="h-4 w-4 mr-2" />
            SIMULATE ESCALATION
          </Button>

          {/* Reset Simulation */}
          <Button
            onClick={resetSimulation}
            variant="outline"
            className="h-10 px-3 text-xs font-mono text-slate-400 hover:text-white border-slate-700 hover:border-slate-600 cursor-pointer"
            title="Reset Simulation Scenario"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. Structured Simulation Telemetry Summary Pill Bar */}
      <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            STATUS: {simulationStatus}
          </span>
          <span className="text-slate-600">|</span>
          <span>
            LOCATION: <strong className="text-white">{incident.zoneName || "Zone A"}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            WATER LEVEL: <strong className="text-blue-300">{incident.metrics.waterLevelMeters}m</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            AFFECTED POP: <strong className="text-amber-300">{incident.metrics.affectedPopulationEstimated.toLocaleString()}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            BLOCKED ROADS: <strong className="text-red-400">{incident.blockedRoads?.join(", ") || "R1, R3"}</strong>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="h-3 w-3 text-slate-400" />
          <span>Deterministic seed: reproducible evaluation scenario</span>
        </div>
      </div>
    </div>
  );
}
