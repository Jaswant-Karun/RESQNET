"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Brain,
  CheckCircle2,
  Cpu,
  Flame,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Waves,
  Workflow,
} from "lucide-react";

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
  } = useDashboard();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            RESQ AI ADAPTIVE REASONING ENGINE
          </h2>
          <p className="text-xs text-slate-400">
            AI-assisted situation analysis, decision recommendation logic, and multi-modal risk calculation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">ARCHITECTURE: GEMINI REASONING CORE</Badge>
          <Badge variant="neutral">ORCHESTRATION: N8N AGENTIC</Badge>
        </div>
      </div>

      {/* Simulator Trigger Banner inside AI View */}
      <Card className="bg-slate-950 border-slate-800 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              Scenario Reasoning Bench
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate disaster escalation to trigger dynamic recalculation of evacuation pathways and drone assets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={simulateFlood}
              variant="default"
              className="font-mono text-xs cursor-pointer"
            >
              <Waves className="h-3.5 w-3.5 mr-1.5" />
              Simulate Flood
            </Button>
            <Button
              onClick={simulateEscalation}
              variant="destructive"
              className="font-mono text-xs cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5 mr-1.5" />
              Simulate Escalation
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="font-mono text-xs cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

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
              <span className="text-[10px] text-blue-400">Elevation & Topo</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 3</span>
              <span className="font-bold text-white mt-1 block">Determine Risk</span>
              <span className="text-[10px] text-red-400">Zone Alpha Crit</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">STEP 4</span>
              <span className="font-bold text-white mt-1 block">Recommend Plan</span>
              <span className="text-[10px] text-amber-400">4-Stage Sequence</span>
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
              • <strong>No Real-world Predictive Claims:</strong> RESQNET assists in situation synthesis and response recommendation during confirmed disasters; it does not claim to predict onset disasters.
            </p>
            <p>
              • <strong>Mandatory Human Authorization:</strong> Evacuation route rerouting and drone payload drop commands require explicit incident commander clearance.
            </p>
            <p>
              • <strong>Deterministic Safety Auditing:</strong> All AI recommendations cross-reference real-time elevation charts and impassable road registries.
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
              <span>Model Confidence:</span>
              <span className="text-emerald-400 font-bold">{plan.confidenceScorePercentage}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Projected Casualty Reduction:</span>
              <span className="text-blue-300 font-bold">{plan.projectedCasualtyReductionPercentage}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Inundation Forecast Horizon:</span>
              <span className="text-amber-300 font-bold">+180 minutes</span>
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
