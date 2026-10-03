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

  // Ask RESQ AI interactive state
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{
    answer: string;
    source: "GEMINI_AI" | "FALLBACK";
    statusMessage: string;
  } | null>(null);

  const handleAskQuestion = async (customQ?: string) => {
    const q = customQ || question;
    if (!q.trim()) return;

    setIsAsking(true);
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          incident,
          simulateError: simulateApiFailure,
        }),
      });

      const data = await res.json();
      setAiAnswer({
        answer: data.answer,
        source: data.source || "FALLBACK",
        statusMessage: data.statusMessage || "AI service unavailable — emergency fallback activated.",
      });
    } catch {
      setAiAnswer({
        answer: `[Emergency Fallback] Zone A is submerged at ${incident.metrics.waterLevelMeters}m depth with ${incident.metrics.affectedPopulationEstimated.toLocaleString()} residents affected. Roads ${incident.blockedRoads?.join(", ") || "R1, R3"} are blocked. Proceed via designated safe Route R2 to Shelter B.`,
        source: "FALLBACK",
        statusMessage: "AI service unavailable — emergency fallback activated.",
      });
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = [
    "What is the safest evacuation route from Zone A?",
    "What is the operational status of Hospital H3?",
    "How many rescue teams and boats are assigned to Zone A?",
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            RESQ AI ADAPTIVE REASONING ENGINE
          </h2>
          <p className="text-xs text-slate-400">
            Gemini situation analysis, explanation, and natural-language reasoning backed by deterministic offline fallback.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">
            {plan.decisionEngine === "GEMINI_AI" ? "ENGINE: GEMINI 2.5 FLASH" : "ENGINE: DETERMINISTIC FALLBACK"}
          </Badge>
          <Badge variant="neutral">SAFETY: HUMAN GUARDRAILS ACTIVE</Badge>
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

      {/* Interactive Ask RESQ AI Tactical Console (Trigger 3) */}
      <Card className="bg-[#080d1a] border-slate-800">
        <CardHeader className="p-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-mono text-slate-200 uppercase flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Interactive Tactical Query: Ask RESQ AI
            </CardTitle>
            <span className="text-[10px] font-mono text-slate-400">
              Only queried on user question or simulation event
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3 font-sans text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
              placeholder="Ask RESQ AI a question (e.g. Which route is safe to evacuate Zone A?)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Button
              onClick={() => handleAskQuestion()}
              disabled={isAsking || !question.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isAsking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Query AI</span>
            </Button>
          </div>

          {/* Quick preset questions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400">Preset Scenarios:</span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleAskQuestion(q);
                }}
                className="text-[10px] font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded px-2 py-1 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* AI Response Display */}
          {aiAnswer && (
            <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${
                      aiAnswer.source === "GEMINI_AI"
                        ? "border-indigo-500/70 text-indigo-300 bg-indigo-950/50"
                        : "border-amber-500/60 text-amber-300 bg-amber-950/40"
                    }`}
                  >
                    {aiAnswer.source === "GEMINI_AI" ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        AI Decision
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-amber-400" />
                        Fallback Decision
                      </span>
                    )}
                  </Badge>
                  <span className="text-[11px] text-slate-400">{aiAnswer.statusMessage}</span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                {aiAnswer.answer}
              </p>
            </div>
          )}
        </CardContent>
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
