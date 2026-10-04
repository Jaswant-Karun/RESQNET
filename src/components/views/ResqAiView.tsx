"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Cpu,
  Flame,
  Loader2,
  Lock,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Waves,
  Workflow,
} from "lucide-react";

import { ResqAiChatPanel } from "@/components/dashboard/ResqAiChatPanel";

export function ResqAiView() {
  const {
    incident,
    plan,
    simulationStage,
    simulateFlood,
    simulateEscalation,
    resetSimulation,
    isActionApproved,
    approveAction,
    simulateApiFailure,
    isAiLoading,
  } = useDashboard();

  return (
    <div className="space-y-6">
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/60 text-indigo-400 shadow-xl shadow-indigo-950/40">
            <Bot className="h-7 w-7 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white uppercase">
                RESQ AI
              </h1>
              <Badge variant="outline" className="border-indigo-500/60 text-indigo-300 bg-indigo-950/60 font-mono text-[11px]">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                Gemini 2.5 Flash
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-sans italic mt-0.5">
              &quot;Situation-aware response assistant&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={simulationStage === "ESCALATED" ? "critical" : "info"} pulse={simulationStage === "ESCALATED"}>
            {simulationStage === "ESCALATED" ? "CRITICAL ESCALATION CONTEXT" : "BASELINE SCENARIO CONTEXT"}
          </Badge>
          <Badge variant="neutral" className="border-emerald-700/60 bg-emerald-950/40 text-emerald-300">
            ZERO HALLUCINATION GUARDRAILS
          </Badge>
        </div>
      </div>

      {/* 2. SCENARIO REASONING BENCH (SIMULATE FLOOD & ESCALATION) */}
      <Card className="bg-slate-950 border-slate-800 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              Interactive Simulation Controller
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trigger baseline flood or multi-hazard escalation to evaluate real-time adaptive AI reasoning.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={simulateFlood}
              variant="default"
              className="font-mono text-xs cursor-pointer bg-blue-600 hover:bg-blue-500"
            >
              <Waves className="h-3.5 w-3.5 mr-1.5" />
              Simulate Flood
            </Button>
            <Button
              onClick={simulateEscalation}
              variant="destructive"
              className="font-mono text-xs cursor-pointer bg-red-600 hover:bg-red-500"
            >
              <Flame className="h-3.5 w-3.5 mr-1.5" />
              Simulate Escalation
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="font-mono text-xs cursor-pointer border-slate-700 text-slate-300 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. DEDICATED RESQ AI SITUATION-AWARE CHAT PANEL */}
      <ResqAiChatPanel />

      {/* AI Pipeline Architecture Diagram */}
      <Card className="bg-[#080d1a] border-slate-800">
        <CardHeader className="p-4 bg-slate-950/80 border-b border-slate-800">
          <CardTitle className="text-xs font-mono text-slate-200 uppercase flex items-center gap-2">
            <Workflow className="h-4 w-4 text-blue-400" />
            Tactical Decision Pipeline (From Detection to Rescue Decision in Seconds)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 1</span>
              <span className="font-bold text-white mt-1 block">Simulate Disaster</span>
              <span className="text-[10px] text-emerald-400">Hydro Sensors</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 2</span>
              <span className="font-bold text-white mt-1 block">Analyze Situation</span>
              <span className="text-[10px] text-blue-400">Gemini / Fallback</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 3</span>
              <span className="font-bold text-white mt-1 block">Determine Risk</span>
              <span className="text-[10px] text-red-400">Zone Alpha Crit</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 4</span>
              <span className="font-bold text-white mt-1 block">Recommend Plan</span>
              <span className="text-[10px] text-amber-400">Structured Output</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 ring-1 ring-amber-500/50">
              <span className="text-[10px] text-amber-400 block font-bold">STEP 5</span>
              <span className="font-bold text-white mt-1 block">Human Approval</span>
              <span className="text-[10px] text-amber-300">
                {isActionApproved ? "AUTHORIZED" : "GUARDRAIL ACTIVE"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 6</span>
              <span className="font-bold text-white mt-1 block">Orchestrate</span>
              <span className="text-[10px] text-indigo-400">n8n Dispatch</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Safeguards & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-950/80 border-slate-800">
          <CardHeader className="p-4 border-b border-slate-800">
            <CardTitle className="text-xs font-mono uppercase text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Safety Protocols & Operational Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs text-slate-300 font-sans">
            <p>
              • <strong>Deterministic Offline Fallback:</strong> If Gemini is unconfigured, unreachable, or times out, the deterministic response engine guarantees instantaneous response recommendations without downtime.
            </p>
            <p>
              • <strong>Mandatory Human Authorization:</strong> Evacuation route rerouting and drone payload drop commands require explicit incident commander clearance.
            </p>
            <p>
              • <strong>Zero Raw Error Exposure:</strong> Network interruptions or missing keys fail safely into the offline rule engine with friendly status messages.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/80 border-slate-800">
          <CardHeader className="p-4 border-b border-slate-800">
            <CardTitle className="text-xs font-mono uppercase text-slate-200 flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-400" />
              Active Inference Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Decision Core:</span>
              <span className="text-indigo-300 font-bold">
                {plan.decisionEngine === "GEMINI_AI" ? "Gemini 2.5 Flash" : "Fallback Engine"}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Confidence Score:</span>
              <span className="text-emerald-400 font-bold">{plan.confidenceScorePercentage}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Projected Casualty Reduction:</span>
              <span className="text-blue-300 font-bold">{plan.projectedCasualtyReductionPercentage}%</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span>Command Clearance:</span>
              {isActionApproved ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  CONFIRMED
                </span>
              ) : (
                <Button
                  onClick={approveAction}
                  size="sm"
                  variant="destructive"
                  className="text-[10px] font-mono cursor-pointer"
                >
                  Authorize Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
