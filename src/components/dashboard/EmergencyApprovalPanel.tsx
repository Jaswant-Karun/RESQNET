"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  FileText,
  GitBranch,
  Info,
  Lock,
  Navigation,
  Radio,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

export function EmergencyApprovalPanel() {
  const {
    incident,
    plan,
    isActionApproved,
    isActionRejected,
    rejectionReason,
    approveAction,
    rejectAction,
    resourceAllocationState,
    workflowState,
    isTriggeringAutomation,
  } = useDashboard();

  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // If response plan doesn't require approval, do not display
  if (!plan || plan.approvalRequired === false) {
    return null;
  }

  // Dynamic values with clean fallbacks matching user prompt
  const isEscalated =
    plan.evacuationRoute === "R4" ||
    (incident.metrics?.waterLevelMeters ?? 0) >= 3.0 ||
    incident.blockedRoads?.includes("R2");
  const actionTitle =
    plan.immediateActions?.[0] ||
    (isEscalated ? "Evacuate Zone A & B" : "Evacuate Zone A");
  const affectedPopulation =
    incident.metrics?.affectedPopulationEstimated?.toLocaleString() ||
    (isEscalated ? "2,180" : "1,240");
  const targetShelterName =
    plan.targetShelter ||
    (isEscalated || plan.evacuationRoute === "R4" ? "Shelter C" : "Shelter B");
  const proposedRoute = `${plan.evacuationRoute || (isEscalated ? "R4" : "R2")} → ${targetShelterName}`;
  const assigned = resourceAllocationState.assigned;
  const ambulanceCount = assigned.ambulances || (isEscalated ? 4 : 2);
  const rescueTeamCount = assigned.rescueTeams || (isEscalated ? 3 : 2);
  const droneCount = assigned.drones || (isEscalated ? 2 : 1);

  return (
    <>
      <Card
        className={`relative overflow-hidden border-2 transition-all duration-300 shadow-2xl ${
          isActionApproved
            ? "border-emerald-600/80 bg-gradient-to-b from-[#061811] via-[#09151f] to-[#070b16] shadow-emerald-950/40"
            : isActionRejected
            ? "border-red-600/80 bg-gradient-to-b from-[#1a0808] via-[#150a12] to-[#070b16] shadow-red-950/40"
            : "border-amber-500/90 bg-gradient-to-b from-[#1c1206] via-[#140f1a] to-[#070b16] shadow-amber-950/50"
        }`}
      >
        {/* TOP GLOW ACCENT BAR */}
        <div
          className={`h-1.5 w-full ${
            isActionApproved
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
              : isActionRejected
              ? "bg-gradient-to-r from-red-500 via-rose-600 to-red-700"
              : "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 animate-pulse"
          }`}
        />

        {/* 1. THREE-TIER VISUAL DISTINCTION STRIP (HACKATHON JUDGE CLARITY) */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider">
            <Shield className="h-3 w-3 text-slate-400" />
            <span>Operational Architecture:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* TIER 1: AI RECOMMENDATION */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/50 border border-indigo-500/40 text-indigo-300">
              <Bot className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold text-xs">AI Recommendation</span>
              <span className="text-[9px] text-indigo-400/80 bg-indigo-900/60 px-1 py-0.2 rounded font-mono">
                Gemini
              </span>
            </div>

            <ArrowRight className="h-3 w-3 text-slate-600 hidden sm:inline" />

            {/* TIER 2: HUMAN APPROVAL */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-semibold text-xs ${
                isActionApproved
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                  : isActionRejected
                  ? "bg-red-950/60 border-red-500/50 text-red-300"
                  : "bg-amber-950/70 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/50 animate-pulse"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Human Approval</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold font-mono ${
                  isActionApproved
                    ? "bg-emerald-900/70 text-emerald-200"
                    : isActionRejected
                    ? "bg-red-900/70 text-red-200"
                    : "bg-amber-900/80 text-amber-200"
                }`}
              >
                {isActionApproved
                  ? "CLEARED"
                  : isActionRejected
                  ? "REJECTED"
                  : "REQUIRED"}
              </span>
            </div>

            <ArrowRight className="h-3 w-3 text-slate-600 hidden sm:inline" />

            {/* TIER 3: AUTOMATED WORKFLOW */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-semibold text-xs ${
                isActionApproved
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-900/60 border-slate-700/50 text-slate-500"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Automated Workflow</span>
              <span className="text-[9px] bg-slate-800 px-1 py-0.2 rounded text-slate-300 font-mono">
                n8n
              </span>
            </div>
          </div>
        </div>

        {/* 2. HEADER BANNER: CRITICAL ACTION REQUIRES APPROVAL */}
        <CardHeader className="py-3 px-4 sm:px-6 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${
                  isActionApproved
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-400"
                    : isActionRejected
                    ? "bg-red-950/80 border-red-500 text-red-400"
                    : "bg-amber-950/80 border-amber-500 text-amber-400 animate-pulse"
                }`}
              >
                {isActionApproved ? (
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                ) : isActionRejected ? (
                  <ShieldX className="h-6 w-6 text-red-400" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-amber-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-amber-400 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5 rounded">
                    MANDATORY OPERATOR CHECKPOINT
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    PROTOCOL: HITL-SEC-V2
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg font-black tracking-wide text-white uppercase mt-0.5 flex items-center gap-2">
                  CRITICAL ACTION REQUIRES HUMAN APPROVAL
                </CardTitle>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div>
              {isActionApproved ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-950/80 border-emerald-500 text-emerald-300 text-xs font-mono font-bold px-3 py-1 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  AUTHORIZED & DISPATCHED
                </Badge>
              ) : isActionRejected ? (
                <Badge
                  variant="outline"
                  className="bg-red-950/80 border-red-500 text-red-300 text-xs font-mono font-bold px-3 py-1 flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  RESPONSE REJECTED
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-950/80 border-amber-500 text-amber-300 text-xs font-mono font-bold px-3 py-1 flex items-center gap-1.5 animate-pulse"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  AWAITING CLEARANCE
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* 3. CORE METRICS GRID */}
        <CardContent className="p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            {/* ACTION */}
            <div className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                Action:
              </span>
              <div className="mt-1">
                <span className="text-base font-black text-amber-300 font-mono tracking-wide block">
                  {actionTitle}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Priority: IMMEDIATE FLOOD EXTRICATION
                </span>
              </div>
            </div>

            {/* AFFECTED POPULATION */}
            <div className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-400" />
                Affected population:
              </span>
              <div className="mt-1">
                <span className="text-base font-black text-blue-300 font-mono tracking-wide block">
                  {affectedPopulation}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Estimated in inundated lowlands
                </span>
              </div>
            </div>

            {/* PROPOSED ROUTE */}
            <div className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Route className="h-3.5 w-3.5 text-emerald-400" />
                Proposed route:
              </span>
              <div className="mt-1">
                <span className="text-base font-black text-emerald-300 font-mono tracking-wide flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-emerald-400 shrink-0" />
                  {proposedRoute}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  Highland Arterial (Dry passage clear)
                </span>
              </div>
            </div>

            {/* RESOURCES */}
            <div className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-900/60 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                <Ambulance className="h-3.5 w-3.5 text-cyan-400" />
                Resource Allocation:
              </span>
              <div className="mt-1 space-y-0.5 text-xs font-mono font-bold text-slate-200">
                <div className="text-cyan-300">• {ambulanceCount} ambulances</div>
                <div className="text-emerald-300">• {rescueTeamCount} rescue teams</div>
                <div className="text-indigo-300">
                  • {droneCount} drone{droneCount > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* STATUS NOTICES (APPROVED / REJECTED BANNER) */}
          {isActionApproved && (
            <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 flex items-start gap-3 text-xs leading-relaxed">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-emerald-300 font-mono text-sm flex items-center gap-2">
                  <span>CLEARANCE CONFIRMED — AUTOMATED EXECUTION ARMED</span>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-300 text-[10px]">
                    n8n DISPATCH ACTIVE
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs">
                  Authorized by <strong>Cmdr Jaswant Karun (Incident Commander)</strong>. {ambulanceCount} ambulances
                  assigned to CAD 108, {rescueTeamCount} SDRF motorized boat squads mobilized, and {droneCount} UAV{droneCount > 1 ? "s" : ""}{" "}
                  cleared to AIRBORNE PATROL.
                </p>
              </div>
            </div>
          )}

          {isActionRejected && (
            <div className="p-3.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-200 flex items-start gap-3 text-xs leading-relaxed">
              <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-red-300 font-mono text-sm">
                  CRITICAL RESPONSE REJECTED BY OPERATOR
                </div>
                <p className="text-slate-300 text-xs">
                  The automated simulated dispatch workflow was halted. No vehicles or drones were
                  mobilized. Awaiting further tactical instructions from the Incident Commander.
                </p>
                {rejectionReason && (
                  <div className="text-[11px] font-mono text-red-300 bg-red-950/80 px-2 py-1 rounded border border-red-800/60 inline-block">
                    Reason: {rejectionReason}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* 4. THREE BUTTONS FOOTER: APPROVE RESPONSE, REJECT, VIEW RESPONSE DETAILS */}
        <CardFooter className="py-3.5 px-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 w-full sm:w-auto">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>Human-in-the-Loop Safeguard:</span>
            <strong className="text-slate-200">
              {isActionApproved
                ? "AUTHORIZED"
                : isActionRejected
                ? "DISMISSED"
                : "PENDING DECISION"}
            </strong>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* BUTTON 3: VIEW RESPONSE DETAILS */}
            <Button
              onClick={() => setShowDetailsModal(true)}
              variant="outline"
              className="border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white font-mono text-xs px-3.5 min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto touch-manipulation"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              VIEW RESPONSE DETAILS
            </Button>

            {/* BUTTON 2: REJECT */}
            <Button
              onClick={() => rejectAction("Critical response rejected by operator.")}
              disabled={isActionRejected}
              variant="outline"
              className={`font-mono text-xs px-4 min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto touch-manipulation ${
                isActionRejected
                  ? "border-red-900/50 bg-red-950/30 text-red-500 cursor-not-allowed"
                  : "border-red-600/70 bg-red-950/50 text-red-300 hover:bg-red-900 hover:text-white hover:border-red-500"
              }`}
            >
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              REJECT
            </Button>

            {/* BUTTON 1: APPROVE RESPONSE */}
            <Button
              onClick={approveAction}
              disabled={isActionApproved || isTriggeringAutomation}
              className={`font-mono text-xs font-bold px-5 min-h-[44px] cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto touch-manipulation ${
                isActionApproved
                  ? "bg-emerald-950 border border-emerald-600 text-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-600/30 hover:shadow-emerald-500/40"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {isActionApproved ? "RESPONSE APPROVED" : "APPROVE RESPONSE"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* 5. RESPONSE DETAILS MODAL / EXPANDABLE DRAWER */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#090e1c] border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden font-mono">
            {/* MODAL HEADER */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-indigo-950 border border-indigo-500 text-indigo-300">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI RESPONSE PLAN & TACTICAL ANALYSIS
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Generated by Gemini Flash 2.5 • Confidence: {plan.confidenceScorePercentage || 94}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300 leading-relaxed">
              {/* RATIONALE & RISK ASSESSMENT */}
              <div className="p-3.5 rounded-lg border border-indigo-900/50 bg-indigo-950/20 space-y-2">
                <span className="text-[11px] font-bold uppercase text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Tactical Rationale & Risk Assessment
                </span>
                <p className="text-slate-300 text-xs">
                  {plan.explanation ||
                    plan.riskAssessmentSummary ||
                    "Zone A has exceeded the 2.4m flood threshold with sluice gate spillover. Immediate evacuation via Route R2 to Shelter B is the only highland path clear of standing water."}
                </p>
              </div>

              {/* ACTION BREAKDOWN */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2">
                <span className="text-[11px] font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  Immediate Tactical Directives
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {plan.immediateActions?.map((act, i) => (
                    <li key={i} className="text-xs">
                      {act}
                    </li>
                  )) || (
                    <>
                      <li>Evacuate Zone A residents (1,240 civilians) via Route R2.</li>
                      <li>Deploy 2 ALS ambulances from City General Hospital.</li>
                      <li>Deploy 2 SDRF motorized boat squads to lowland pockets.</li>
                      <li>Launch UAV Echo-1 for thermal FLIR perimeter scan.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* SIMULATION & AUTOMATION DETAILS */}
              <div className="p-3.5 rounded-lg border border-emerald-900/50 bg-emerald-950/20 space-y-2">
                <span className="text-[11px] font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                  Automated Dispatch Pipeline (n8n Layer)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">CAD 108 Dispatch:</span>
                    <strong className="text-slate-200">2 Units (Simulated Stubs)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SDRF Boat Squads:</span>
                    <strong className="text-slate-200">2 Teams (Simulated Stubs)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">UAV Recon Mission:</span>
                    <strong className="text-slate-200">Echo-1 (Altitude: 45m)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Public Emergency Alert:</span>
                    <strong className="text-slate-200">CAP v1.2 Cell Broadcast</strong>
                  </div>
                </div>
              </div>

              {/* HACKATHON DISCLAIMER */}
              <div className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded">
                ⚠ <strong>Hackathon Prototype Disclaimer:</strong> Real emergency services (EMS 108,
                NDRF, civil siren transmitters) are simulated via mock endpoints. No real sirens or
                vehicles are deployed.
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="outline"
                className="border-slate-700 text-slate-300 text-xs font-mono"
              >
                Close Details
              </Button>

              {!isActionApproved && !isActionRejected && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      rejectAction();
                    }}
                    variant="destructive"
                    className="text-xs font-mono"
                  >
                    Reject Plan
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      approveAction();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono"
                  >
                    Approve Response
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
