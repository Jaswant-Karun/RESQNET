"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Ambulance,
  Bot,
  CheckCircle2,
  HeartPulse,
  Home,
  Lock,
  Navigation,
  Radio,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export function AiResponseStatusPanel() {
  const {
    incident,
    zones,
    hospitals,
    shelters,
    ambulances,
    rescueTeams,
    drones,
    plan,
    isActionApproved,
    approveAction,
    simulationStage,
  } = useDashboard();

  // Priority Zone: Zone A
  const priorityZone =
    zones.find((z) => z.riskLevel === "CRITICAL") || zones[0];

  const primaryAction = plan.actions[0] || {
    title: "Deploy Swiftwater Boats & Life Vests",
    description: "Extract isolated citizens from Zone A and supply aerial floatation pods.",
    priority: "IMMEDIATE",
    estimatedMinutesToDeploy: 3,
  };

  const primaryRoute = {
    routeName: "Route R4 Highland Arterial -> Shelter C Stadium",
    safetyScore: 92,
    estimatedTransitMin: 14,
    status: "OPEN (Bypasses Submerged Roads R1 & R3)",
  };

  return (
    <Card
      glow={isActionApproved ? "green" : "red"}
      className="border-slate-800 bg-[#080d1a] shadow-xl flex flex-col justify-between"
    >
      {/* Header */}
      <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-1.5">
                AI RESPONSE STATUS
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </CardTitle>
              <div className="text-[10px] font-mono text-slate-400">
                SCENARIO: {incident.zoneName || "Zone A"} • WATER LEVEL: {incident.metrics.waterLevelMeters}m
              </div>
            </div>
          </div>

          <Badge
            variant={incident.severity === "CRITICAL" ? "critical" : "warning"}
            pulse
          >
            {incident.severity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs font-sans">
        {/* 1. RISK LEVEL */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Risk Level
            </div>
            <div className="text-sm font-black text-red-400 font-mono flex items-center gap-1.5 mt-0.5">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span>{incident.severity} — FLOOD INUNDATION</span>
            </div>
          </div>
          <div className="text-right font-mono text-[11px]">
            <div className="text-slate-400">Water Level</div>
            <div className="text-blue-300 font-black text-sm">{incident.metrics.waterLevelMeters} meters</div>
          </div>
        </div>

        {/* 2. PRIORITY ZONE */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
            <span>Priority Zone</span>
            <span className="text-red-400 font-bold">{priorityZone.code}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200">
            <div className="font-semibold text-xs text-white flex items-center justify-between">
              <span>{priorityZone.name}</span>
              <span className="text-red-400 font-mono text-[10px] font-bold">DEPTH: {priorityZone.waterDepthMeters}m</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
              <span>Affected: <strong className="text-white">{incident.metrics.affectedPopulationEstimated.toLocaleString()}</strong></span>
              <span className="text-amber-400">Blocked: {incident.blockedRoads?.join(", ") || "R1, R3"}</span>
            </div>
          </div>
        </div>

        {/* 3. RECOMMENDED ACTION */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Recommended Action
          </div>
          <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-300">
              <span className="font-mono text-[10px] px-1 py-0.2 bg-blue-900/60 rounded">STEP 01</span>
              <span>Deploy Swiftwater Boats & Life Vests to Zone A</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Direct NDRF boat squads to extract 180 stranded residents in Zone A. Dispatch UAV-02 with self-inflating life vests.
            </p>
            <div className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
              <span>DEPLOYMENT ETA:</span>
              <span className="font-bold">~3 minutes to target coordinates</span>
            </div>
          </div>
        </div>

        {/* 4. ASSIGNED RESOURCES (8 Ambulances, 4 Teams, 3 Drones) */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
            <span>Assigned Resources</span>
            <span className="text-slate-400 font-mono text-[10px]">{ambulances.length + rescueTeams.length + drones.length} Assets Linked</span>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Ambulance className="h-3.5 w-3.5 text-emerald-400 mx-auto mb-1" />
              <div className="text-white font-bold">{ambulances.length} Units</div>
              <div className="text-[10px] text-slate-400 truncate">8 Ambulances</div>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Users className="h-3.5 w-3.5 text-purple-400 mx-auto mb-1" />
              <div className="text-white font-bold">{rescueTeams.length} Teams</div>
              <div className="text-[10px] text-slate-400 truncate">4 Rescue Teams</div>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Navigation className="h-3.5 w-3.5 text-cyan-400 mx-auto mb-1" />
              <div className="text-white font-bold">{drones.length} Drones</div>
              <div className="text-[10px] text-slate-400 truncate">3 UAV Fleet</div>
            </div>
          </div>
        </div>

        {/* 5. EVACUATION ROUTE & HOSPITALS USAGE */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
            <span>Evacuation Route & Shelters</span>
            <Badge variant="success" className="text-[9px]">
              Safety {primaryRoute.safetyScore}%
            </Badge>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Route className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{primaryRoute.routeName}</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Shelters: B (700 cap) • C (1500 cap)</span>
              <span className="text-emerald-400 font-bold">R1 & R3 BLOCKED</span>
            </div>
          </div>

          {/* Quick Hospital Capacity Usage Ticker */}
          <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-slate-300 flex items-center gap-1">
              <HeartPulse className="h-3 w-3 text-blue-400" />
              Hospital Usage:
            </span>
            <span className="text-slate-300">H1: <strong className="text-blue-400">80%</strong></span>
            <span className="text-slate-300">H2: <strong className="text-blue-400">42%</strong></span>
            <span className="text-slate-300">H3: <strong className="text-red-400">95%</strong></span>
          </div>
        </div>

        {/* 6. APPROVAL REQUIRED */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
              Approval Status
            </span>
            <Badge
              variant={isActionApproved ? "success" : "warning"}
              pulse={!isActionApproved}
            >
              {isActionApproved ? "AUTHORIZED" : "APPROVAL REQUIRED"}
            </Badge>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
              isActionApproved
                ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                : "bg-amber-950/30 border-amber-800/60 text-amber-300"
            }`}
          >
            {isActionApproved ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-[11px] leading-tight">
              {isActionApproved ? (
                <>
                  <strong className="block text-emerald-200 font-semibold">
                    Authorized by Commander Raghav Menon
                  </strong>
                  Dispatch protocol armed for Zone A rescue units. Automated n8n webhook notification ready for execution.
                </>
              ) : (
                <>
                  <strong className="block text-amber-200 font-semibold">
                    Human Authorization Safeguard Active
                  </strong>
                  Critical water-breach dispatch to Zone A requires command clearance.
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-slate-950 border-t border-slate-800">
        {!isActionApproved ? (
          <Button
            onClick={approveAction}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2 font-mono text-xs py-2 shadow-lg hover:shadow-red-600/20 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            APPROVE & AUTHORIZE RESCUE ACTION
          </Button>
        ) : (
          <Button
            disabled
            variant="outline"
            className="w-full border-emerald-600/50 text-emerald-400 bg-emerald-950/30 font-mono text-xs py-2"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            DISPATCH PROTOCOL AUTHORIZED
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
