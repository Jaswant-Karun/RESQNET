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
  Cpu,
  HeartPulse,
  Info,
  Loader2,
  Lock,
  Megaphone,
  Navigation,
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
    plan,
    isActionApproved,
    isActionRejected,
    rejectionReason,
    approveAction,
    rejectAction,
    isAiLoading,
    aiStatusMessage,
    simulateApiFailure,
    setSimulateApiFailure,
    simulateFlood,
    resourceAllocationState,
  } = useDashboard();

  // Extract from the ResponsePlan (either Gemini AI or Fallback)
  const isAiDecision = plan.decisionEngine === "GEMINI_AI";
  const riskLevel = plan.riskLevel || incident.severity || "CRITICAL";
  const priorityZones = plan.priorityZones?.length ? plan.priorityZones : ["Zone A"];
  const immediateActions = plan.immediateActions || [
    "Evacuate Zone A",
    "Deploy Drone 01",
    "Dispatch 2 ambulances",
    "Assign 2 rescue teams",
    "Route evacuees to Shelter B",
  ];
  const resourceAllocation = resourceAllocationState.assigned;
  const evacuationRoute = plan.evacuationRoute || "R2";
  const publicAlert = plan.publicAlert || "";
  const explanation = plan.explanation || "";
  const approvalRequired = plan.approvalRequired ?? true;

  return (
    <Card
      glow={isActionApproved ? "green" : isAiDecision ? "blue" : "red"}
      className="border-slate-800 bg-[#080d1a] shadow-xl flex flex-col justify-between transition-all duration-300"
    >
      {/* Header */}
      <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded border transition-colors ${
                isAiDecision
                  ? "bg-indigo-950/80 border-indigo-500/80 text-indigo-300"
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
            >
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-1">
                  AI RECOMMENDATION
                </CardTitle>
                {isAiDecision ? (
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                ) : (
                  <Cpu className="h-3.5 w-3.5 text-amber-400" />
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span>SCENARIO: {priorityZones.join(", ")}</span>
                <span>•</span>
                <span>WATER LEVEL: {incident.metrics.waterLevelMeters}m</span>
              </div>
            </div>
          </div>

          {/* Decision Engine Indicator: "AI Decision" vs "Fallback Decision" */}
          <div className="flex items-center gap-1.5">
            {isAiLoading ? (
              <Badge
                variant="outline"
                className="border-indigo-500/60 text-indigo-300 bg-indigo-950/40 text-[10px] font-mono px-2 py-0.5 animate-pulse"
              >
                <Loader2 className="h-3 w-3 mr-1 animate-spin text-indigo-400" />
                Analyzing with Gemini...
              </Badge>
            ) : isAiDecision ? (
              <Badge
                variant="outline"
                className="border-indigo-500/70 text-indigo-300 bg-indigo-950/50 text-[10px] font-mono px-2 py-0.5 font-bold shadow-sm shadow-indigo-950"
              >
                <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
                AI Recommendation
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/60 text-amber-300 bg-amber-950/40 text-[10px] font-mono px-2 py-0.5 font-semibold"
              >
                <Cpu className="h-3 w-3 mr-1 text-amber-400" />
                Deterministic Recommendation
              </Badge>
            )}

            <Badge
              variant={riskLevel === "CRITICAL" ? "critical" : "warning"}
              pulse
            >
              {riskLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5 text-xs font-sans">
        {/* Friendly AI Fallback Status Banner (Zero raw error exposure) */}
        {!isAiDecision && (
          <div className="p-2 rounded-lg bg-amber-950/25 border border-amber-800/50 flex items-center justify-between text-[11px] font-sans text-amber-200">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{aiStatusMessage || "AI service unavailable — emergency fallback activated."}</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 uppercase font-semibold">
              SAFEGUARD ACTIVE
            </span>
          </div>
        )}

        {isAiDecision && (
          <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-[11px] font-sans text-indigo-200">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>AI Recommendation: Gemini cognitive situation synthesis active.</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 uppercase font-semibold">
              VERIFIED
            </span>
          </div>
        )}

        {/* 1. RISK LEVEL & PRIORITY ZONE BANNER */}
        <div className="grid grid-cols-2 gap-2">
          {/* Risk Level */}
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Risk Level
            </div>
            <div className="text-xs font-black text-red-400 font-mono flex items-center gap-1 mt-1">
              <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span className="truncate">{riskLevel}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Water Depth: <span className="text-blue-300 font-bold">{incident.metrics.waterLevelMeters}m</span>
            </div>
          </div>

          {/* Priority Zone */}
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Priority Zone
            </div>
            <div className="text-xs font-black text-white font-mono flex items-center gap-1 mt-1">
              <span className="text-red-400 font-bold">{priorityZones.join(", ")}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Affected: <span className="text-white font-bold">{incident.metrics.affectedPopulationEstimated.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 2. IMMEDIATE ACTIONS (1 to 5) */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
            <span>Immediate Actions</span>
            <span className="text-amber-400 font-mono text-[10px]">{immediateActions.length} Step Protocol</span>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-slate-200 space-y-1.5">
            {immediateActions.map((action, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 font-mono text-[11px] py-0.5 border-b border-slate-800/60 last:border-0"
              >
                <span className="h-4 w-4 rounded-full bg-blue-900/70 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-200 font-medium">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RESOURCE ALLOCATION */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
            <span>Resource Allocation</span>
            <span className="text-slate-400 font-mono text-[10px]">
              {isAiDecision ? "Gemini Allocated" : "Deterministic Dispatch"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Ambulance className="h-3.5 w-3.5 text-emerald-400 mx-auto mb-1" />
              <div className="text-white font-bold">
                {resourceAllocationState.assigned.ambulances}{" "}
                <span className="text-[10px] text-slate-500 font-normal">
                  / {resourceAllocationState.available.ambulances}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Ambulances</div>
              <div className="text-[9px] text-emerald-400 font-bold mt-0.5">READY</div>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Users className="h-3.5 w-3.5 text-purple-400 mx-auto mb-1" />
              <div className="text-white font-bold">
                {resourceAllocationState.assigned.rescueTeams}{" "}
                <span className="text-[10px] text-slate-500 font-normal">
                  / {resourceAllocationState.available.rescueTeams}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Rescue Teams</div>
              <div className="text-[9px] text-amber-400 font-bold mt-0.5">DEPLOYING</div>
            </div>
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-center">
              <Navigation className="h-3.5 w-3.5 text-cyan-400 mx-auto mb-1" />
              <div className="text-white font-bold">
                {resourceAllocationState.assigned.drones}{" "}
                <span className="text-[10px] text-slate-500 font-normal">
                  / {resourceAllocationState.available.drones}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Drones</div>
              <div className="text-[9px] text-cyan-400 font-bold mt-0.5">MISSION CREATED</div>
            </div>
          </div>
        </div>

        {/* 4. EVACUATION ROUTE & DESTINATION */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center justify-between">
            <span>Evacuation Route & Shelters</span>
            <Badge variant="success" className="text-[9px]">
              Route {evacuationRoute} Clear
            </Badge>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Route className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Route {evacuationRoute} (Kotturpuram High Bypass) &rarr; Shelter B</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Dest: Shelter B (700 cap)</span>
              <span className="text-red-400 font-bold">R1 & R3 BLOCKED</span>
            </div>
          </div>

          {/* Hospital Capacity Usage Ticker */}
          <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-slate-300 flex items-center gap-1">
              <HeartPulse className="h-3 w-3 text-blue-400" />
              Hospitals:
            </span>
            <span className="text-slate-300">H1: <strong className="text-blue-400">80%</strong></span>
            <span className="text-slate-300">H2: <strong className="text-blue-400">42%</strong></span>
            <span className="text-slate-300">H3: <strong className="text-red-400">95%</strong></span>
          </div>
        </div>

        {/* 5. PUBLIC ALERT MESSAGE */}
        {publicAlert && (
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1 text-amber-300">
              <Megaphone className="h-3 w-3 text-amber-400" />
              Public Emergency Alert
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-200 text-[11px] leading-relaxed font-sans">
              {publicAlert}
            </div>
          </div>
        )}

        {/* 6. EXPLANATION / RATIONALE */}
        {explanation && (
          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/90 text-[10px] font-mono text-slate-300 space-y-1">
            <div className="flex items-center gap-1 text-indigo-300 font-semibold">
              <Info className="h-3 w-3 text-indigo-400" />
              <span>
                {isAiDecision ? "Gemini Situation Reasoning" : "Decision Rationale (Fallback Engine)"}
              </span>
            </div>
            <div className="text-slate-400 leading-snug">
              {explanation}
            </div>
          </div>
        )}

        {/* 7. DEVELOPER TEST TOGGLE: Simulate API Failure */}
        <div className="p-2 rounded bg-slate-950/50 border border-slate-800/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <label htmlFor="simulate-fail" className="flex items-center gap-1.5 cursor-pointer">
            <input
              id="simulate-fail"
              type="checkbox"
              checked={simulateApiFailure}
              onChange={(e) => {
                setSimulateApiFailure(e.target.checked);
              }}
              className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
            />
            <span>Test Mode: Simulate API Failure</span>
          </label>
          <span className="text-[9px] text-slate-500">
            {simulateApiFailure ? "Simulated Disconnection" : "Standard Route"}
          </span>
        </div>

        {/* 8. APPROVAL REQUIRED */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
              Approval Status
            </span>
            <Badge
              variant={isActionApproved ? "success" : isActionRejected ? "critical" : "warning"}
              pulse={!isActionApproved && !isActionRejected && approvalRequired}
            >
              {isActionApproved
                ? "AUTHORIZED"
                : isActionRejected
                ? "REJECTED BY OPERATOR"
                : "APPROVAL REQUIRED"}
            </Badge>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
              isActionApproved
                ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                : isActionRejected
                ? "bg-red-950/30 border-red-800/60 text-red-300"
                : "bg-amber-950/30 border-amber-800/60 text-amber-300"
            }`}
          >
            {isActionApproved ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : isActionRejected ? (
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-[11px] leading-tight">
              {isActionApproved ? (
                <>
                  <strong className="block text-emerald-200 font-semibold">
                    Authorized by Commander Raghav Menon
                  </strong>
                  Dispatch protocol armed for {priorityZones.join(", ")} rescue units. Automated dispatch order validated.
                </>
              ) : isActionRejected ? (
                <>
                  <strong className="block text-red-200 font-semibold">
                    Response Rejected by Operator
                  </strong>
                  {rejectionReason || "Simulated dispatch halted. No units deployed."}
                </>
              ) : (
                <>
                  <strong className="block text-amber-200 font-semibold">
                    Human Authorization Safeguard Active
                  </strong>
                  Critical rescue actions require EOC officer clearance prior to resource deployment.
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="p-3 bg-slate-950 border-t border-slate-800">
        {!isActionApproved && !isActionRejected ? (
          <div className="w-full flex items-center gap-2">
            <Button
              onClick={() => rejectAction("Critical response rejected by operator.")}
              variant="outline"
              className="w-1/3 border-red-700/60 bg-red-950/30 text-red-300 hover:bg-red-900/60 hover:text-white font-mono text-[11px] py-2 cursor-pointer"
            >
              REJECT
            </Button>
            <Button
              onClick={approveAction}
              variant="destructive"
              className="w-2/3 flex items-center justify-center gap-1.5 font-mono text-[11px] py-2 shadow-lg hover:shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              APPROVE & AUTHORIZE
            </Button>
          </div>
        ) : isActionRejected ? (
          <div className="w-full flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-red-400">PLAN REJECTED</span>
            <Button
              onClick={approveAction}
              variant="outline"
              className="border-emerald-600/60 text-emerald-300 bg-emerald-950/30 font-mono text-[11px] py-1.5 cursor-pointer"
            >
              RE-AUTHORIZE PLAN
            </Button>
          </div>
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
