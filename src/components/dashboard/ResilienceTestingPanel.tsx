"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  FileCode,
  Flame,
  GitBranch,
  Layers,
  Map,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WifiOff,
  Zap,
} from "lucide-react";

export function ResilienceTestingPanel() {
  const {
    activeResilienceTest,
    triggerResilienceTest,
    resetAllResilienceTests,
    plan,
    workflowState,
    resourceAllocationState,
    aiStatusMessage,
    simulateTileError,
  } = useDashboard();

  const [isRunning, setIsRunning] = useState<string | null>(null);

  const handleRunTest = async (testId: string) => {
    setIsRunning(testId);
    try {
      await triggerResilienceTest(testId);
    } finally {
      setIsRunning(null);
    }
  };

  const isGeminiFallback = plan.decisionEngine === "FALLBACK";
  const isN8nSim = workflowState.isSimulationMode;
  const isResourceCapped = resourceAllocationState.hasWarning;

  const testCases = [
    {
      id: "GEMINI_KEY_MISSING",
      number: "01",
      title: "Gemini API Key Missing",
      category: "AI ENGINE",
      icon: KeyIcon,
      expected: "Deterministic Fallback Engine",
      expectedMessage: "AI service unavailable — fallback decision engine active.",
      statusActive: isGeminiFallback && activeResilienceTest === "GEMINI_KEY_MISSING",
    },
    {
      id: "GEMINI_QUOTA_EXCEEDED",
      number: "02",
      title: "Gemini API Quota Exceeded (429)",
      category: "AI ENGINE",
      icon: ServerCrash,
      expected: "Deterministic Fallback Engine (No 429 UI exposure)",
      expectedMessage: "AI service unavailable — fallback decision engine active.",
      statusActive: isGeminiFallback && activeResilienceTest === "GEMINI_QUOTA_EXCEEDED",
    },
    {
      id: "GEMINI_INVALID_JSON",
      number: "03",
      title: "Gemini Returns Invalid JSON",
      category: "AI ENGINE",
      icon: FileCode,
      expected: "Syntax error intercepted -> Deterministic Fallback",
      expectedMessage: "AI service unavailable — fallback decision engine active.",
      statusActive: isGeminiFallback && activeResilienceTest === "GEMINI_INVALID_JSON",
    },
    {
      id: "GEMINI_TIMEOUT",
      number: "04",
      title: "Gemini Request Times Out",
      category: "AI ENGINE",
      icon: Clock,
      expected: "AbortController timeout -> Deterministic Fallback",
      expectedMessage: "AI service unavailable — fallback decision engine active.",
      statusActive: isGeminiFallback && activeResilienceTest === "GEMINI_TIMEOUT",
    },
    {
      id: "N8N_UNAVAILABLE",
      number: "05",
      title: "n8n Webhook Unavailable",
      category: "AUTOMATION",
      icon: GitBranch,
      expected: "Local high-fidelity workflow simulation mode",
      expectedMessage: "n8n unavailable — automation simulation active.",
      statusActive: isN8nSim && activeResilienceTest === "N8N_UNAVAILABLE",
    },
    {
      id: "N8N_URL_MISSING",
      number: "06",
      title: "N8N_WEBHOOK_URL Missing",
      category: "AUTOMATION",
      icon: WifiOff,
      expected: "Zero crash -> Clean local orchestration simulation",
      expectedMessage: "n8n unavailable — automation simulation active.",
      statusActive: isN8nSim && activeResilienceTest === "N8N_URL_MISSING",
    },
    {
      id: "MAP_TILES_UNAVAILABLE",
      number: "07",
      title: "Map Tiles Unavailable",
      category: "GIS MAPPING",
      icon: Map,
      expected: "Tactical offline coordinate grid + overlays active",
      expectedMessage: "External service unavailable — local emergency simulation continues.",
      statusActive: simulateTileError || activeResilienceTest === "MAP_TILES_UNAVAILABLE",
    },
    {
      id: "INVALID_RESPONSE_DATA",
      number: "08",
      title: "Invalid Response Data",
      category: "AI ENGINE",
      icon: AlertTriangle,
      expected: "Schema validation fails -> Deterministic Fallback",
      expectedMessage: "AI service unavailable — fallback decision engine active.",
      statusActive: isGeminiFallback && activeResilienceTest === "INVALID_RESPONSE_DATA",
    },
    {
      id: "RESOURCE_OVERALLOCATION",
      number: "09",
      title: "Resource Over-Allocation",
      category: "DISPATCH GUARD",
      icon: Layers,
      expected: "Allocation strictly prevented; clamped to fleet limits",
      expectedMessage: "Resource Cap Exceeded — Safety Protocol Engaged",
      statusActive: isResourceCapped,
    },
  ];

  return (
    <Card className="border-slate-800 bg-[#080d1a] shadow-2xl overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />

      <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                  <span>SYSTEM RESILIENCE & FAILURE-HANDLING DIAGNOSTICS</span>
                </CardTitle>
                <Badge variant="outline" className="border-emerald-600/70 text-emerald-300 bg-emerald-950/40 text-[9px] font-mono">
                  ZERO-CRASH GUARANTEE
                </Badge>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Simulate external service failures and verify deterministic fallbacks in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={resetAllResilienceTests}
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-mono py-1 px-3 h-8 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
              Reset All Tests
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Live System Status Indicators Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Gemini AI Status */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-400" />
              <div className="text-xs font-mono">
                <div className="text-slate-300 font-bold">GEMINI COGNITIVE AI</div>
                <div className="text-[10px] text-slate-500">
                  {isGeminiFallback ? "Fallback Engine Active" : "Cognitive API Connected"}
                </div>
              </div>
            </div>
            <Badge
              variant={isGeminiFallback ? "warning" : "success"}
              className="text-[10px] font-mono"
            >
              {isGeminiFallback ? "FALLBACK" : "ONLINE"}
            </Badge>
          </div>

          {/* n8n Automation Status */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              <div className="text-xs font-mono">
                <div className="text-slate-300 font-bold">n8n AUTOMATION</div>
                <div className="text-[10px] text-slate-500">
                  {isN8nSim ? "Simulation Mode Active" : "Live Webhook Connected"}
                </div>
              </div>
            </div>
            <Badge
              variant={isN8nSim ? "warning" : "success"}
              className="text-[10px] font-mono"
            >
              {isN8nSim ? "SIMULATION" : "LIVE HOOK"}
            </Badge>
          </div>

          {/* Map Tiles Status */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-emerald-400" />
              <div className="text-xs font-mono">
                <div className="text-slate-300 font-bold">MAP TILE SERVICE</div>
                <div className="text-[10px] text-slate-500">
                  {simulateTileError ? "Tactical Grid Fallback" : "OpenStreetMap Online"}
                </div>
              </div>
            </div>
            <Badge
              variant={simulateTileError ? "warning" : "success"}
              className="text-[10px] font-mono"
            >
              {simulateTileError ? "GRID FALLBACK" : "ONLINE"}
            </Badge>
          </div>
        </div>

        {/* The 9 Resilience Test Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {testCases.map((tc) => {
            const Icon = tc.icon;
            const isCurrentRunning = isRunning === tc.id;

            return (
              <div
                key={tc.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                  tc.statusActive
                    ? "bg-amber-950/30 border-amber-600/80 shadow-md shadow-amber-950/30"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      CASE {tc.number} • {tc.category}
                    </span>
                    {tc.statusActive ? (
                      <Badge variant="warning" pulse className="text-[9px] font-mono">
                        FALLBACK ACTIVE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] font-mono text-slate-500 border-slate-800">
                        STANDBY
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {tc.title}
                      </div>
                      <div className="text-[11px] font-sans text-slate-400 mt-1 leading-snug">
                        <span className="text-slate-500 font-mono text-[10px]">EXPECTED: </span>
                        {tc.expected}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-amber-300/90 bg-slate-900/90 border border-slate-800 p-1.5 rounded truncate">
                    &quot;{tc.expectedMessage}&quot;
                  </div>

                  <Button
                    onClick={() => handleRunTest(tc.id)}
                    disabled={isCurrentRunning}
                    size="sm"
                    variant={tc.statusActive ? "outline" : "default"}
                    className={`w-full text-xs font-mono py-1 h-7.5 cursor-pointer ${
                      tc.statusActive
                        ? "border-amber-600/70 text-amber-300 bg-amber-950/40"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {isCurrentRunning ? "Simulating Failure..." : tc.statusActive ? "Re-Test Failure" : "Simulate Failure"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}
