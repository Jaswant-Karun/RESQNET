"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagon,
  Flame,
  RotateCcw,
  Sparkles,
  Waves,
} from "lucide-react";

export function SimulationControls() {
  const {
    simulateFlood,
    simulateEscalation,
    resetSimulation,
    simulationStage,
  } = useDashboard();

  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Scenario Indicator & Description */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
          <Waves className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              EOC Disaster Scenario Simulator
            </span>
            <Badge
              variant={
                simulationStage === "ESCALATED"
                  ? "critical"
                  : simulationStage === "FLOOD_ACTIVE"
                  ? "warning"
                  : "neutral"
              }
              pulse={simulationStage !== "NORMAL"}
            >
              {simulationStage === "ESCALATED"
                ? "ESCALATION TIER 2"
                : simulationStage === "FLOOD_ACTIVE"
                ? "FLOOD SCENARIO ACTIVE"
                : "READY"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test AI situation analysis, drone payload tasking, and human-in-the-loop evacuation protocols.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* Large Primary Button: SIMULATE FLOOD */}
        <Button
          onClick={simulateFlood}
          variant="default"
          className="flex-1 md:flex-initial h-10 px-5 text-xs font-bold font-mono tracking-wider bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-900/30 cursor-pointer"
        >
          <Waves className="h-4 w-4 mr-2" />
          SIMULATE FLOOD
        </Button>

        {/* Secondary Button: SIMULATE ESCALATION */}
        <Button
          onClick={simulateEscalation}
          variant="destructive"
          className="flex-1 md:flex-initial h-10 px-5 text-xs font-bold font-mono tracking-wider bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-md shadow-red-900/30 cursor-pointer"
        >
          <Flame className="h-4 w-4 mr-2" />
          SIMULATE ESCALATION
        </Button>

        {/* Reset Simulation */}
        <Button
          onClick={resetSimulation}
          variant="outline"
          className="h-10 px-3 text-xs font-mono text-slate-400 hover:text-white border-slate-700 hover:border-slate-600 cursor-pointer"
          title="Reset Simulation State"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
