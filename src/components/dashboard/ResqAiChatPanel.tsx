"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  Flame,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  MessageSquare,
  Radio,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  User,
  Waves,
  Zap,
} from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "GEMINI_AI" | "FALLBACK";
  statusMessage?: string;
  stageSnapshot?: "BASELINE" | "ESCALATED";
}

interface ResqAiChatPanelProps {
  compact?: boolean;
  className?: string;
}

export function ResqAiChatPanel({ compact = false, className = "" }: ResqAiChatPanelProps) {
  const {
    incident,
    plan,
    resourceAllocationState,
    simulationStage,
    isActionApproved,
    isActionRejected,
    simulateApiFailure,
  } = useDashboard();

  const isEscalated = simulationStage === "ESCALATED";

  // Initial situation-aware greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Operational greetings, Cmdr Jaswant Karun. I am RESQ AI, your situation-aware AI Emergency Response Copilot synchronized with MongoDB Atlas and live EOC telemetry. I track active incident telemetry, multi-hazard risk forecasts, fleet readiness, evacuation corridors, and commander approval gates. How can I assist with tactical operations?",
      timestamp: "Just now",
      source: "GEMINI_AI",
      statusMessage: "Synchronized with MongoDB Atlas & Live Telemetry",
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [offlineSimMode, setOfflineSimMode] = useState(simulateApiFailure);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // The 12 exact suggested questions required by the prompt
  const primarySuggestedQuestions = [
    "What is the highest-risk area right now?",
    "Why is Zone A critical?",
    "What changed in the last 10 minutes?",
    "Which resources are available?",
    "Which resources are currently deployed?",
    "Why did the evacuation route change?",
    "Which alerts have been sent?",
    "What actions are waiting for my approval?",
    "Are there any new disaster-risk areas?",
    "What is causing the current risk score?",
    "Summarize the current emergency situation.",
    "Give me a response plan.",
  ];

  // Special command-style capabilities specified in the prompt
  const specialCommands = [
    { cmd: "/status", label: "/status", desc: "Overall command-center status" },
    { cmd: "/risk", label: "/risk", desc: "Disaster risk forecast" },
    { cmd: "/resources", label: "/resources", desc: "Fleet inventory breakdown" },
    { cmd: "/incidents", label: "/incidents", desc: "Active disaster telemetry" },
    { cmd: "/alerts", label: "/alerts", desc: "Dispatched emergency broadcasts" },
    { cmd: "/plan", label: "/plan", desc: "Structured response plan" },
    { cmd: "/summary", label: "/summary", desc: "Operations situation summary" },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsgTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: userMsgTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          incident,
          context: {
            plan: {
              evacuationRoute: plan.evacuationRoute,
              targetShelter: plan.targetShelter,
              approvalRequired: plan.approvalRequired,
              humanApproved: plan.humanApproved,
              immediateActions: plan.immediateActions,
            },
            resourceAllocation: resourceAllocationState,
            simulationStage,
            isActionApproved,
            isActionRejected,
          },
          simulateError: offlineSimMode,
        }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.answer || "No response received from telemetry core.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        source: data.source || "FALLBACK",
        statusMessage:
          data.statusMessage ||
          (data.source === "GEMINI_AI"
            ? "Situation-Aware Gemini Response"
            : "Deterministic State Fallback Engine"),
        stageSnapshot: isEscalated ? "ESCALATED" : "BASELINE",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Direct client fallback if API completely unreachable
      const fallbackText = isEscalated
        ? `Emergency command fallback: Zone A & B water level is 3.1m (critical). Route R2 is submerged. Convoys re-routed via Route R4 to Shelter C (Capacity: 1,500) with 4 Ambulances, 3 Rescue Teams, and 2 Drones.\n\nData used:\n- Current incident\n- Fallback rule engine\nTimestamp: ${new Date().toISOString()}`
        : `Emergency command fallback: Zone A water level is 2.4m (critical). Roads R1 and R3 are blocked. Evacuate via Route R2 to Shelter B with 2 Ambulances, 2 Rescue Teams, and 1 Drone.\n\nData used:\n- Current incident\n- Fallback rule engine\nTimestamp: ${new Date().toISOString()}`;

      const errorAiMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        source: "FALLBACK",
        statusMessage: "Network unreachable — offline deterministic rule engine active.",
        stageSnapshot: isEscalated ? "ESCALATED" : "BASELINE",
      };

      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        text: "Mission log cleared. RESQ AI standby for live tactical inquiries from Cmdr Jaswant Karun.",
        timestamp: "Just now",
        source: "GEMINI_AI",
        statusMessage: "Synchronized with MongoDB Atlas & Live Telemetry",
      },
    ]);
  };

  /**
   * Formats text content to highlight structured response plans and Sources Used blocks
   */
  const renderMessageContent = (text: string) => {
    const isPlan = text.includes("=== TACTICAL RESPONSE PLAN ===") || text.includes("RISK:");
    const sourcesIdx = text.indexOf("Data used:");

    if (sourcesIdx === -1) {
      return <p className="whitespace-pre-line font-sans leading-relaxed">{text}</p>;
    }

    const mainBody = text.substring(0, sourcesIdx).trim();
    const sourcesBlock = text.substring(sourcesIdx).trim();

    return (
      <div className="space-y-3">
        <div
          className={`whitespace-pre-line font-sans leading-relaxed ${
            isPlan ? "p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-slate-100 font-mono text-xs" : ""
          }`}
        >
          {mainBody}
        </div>
        <div className="p-2.5 rounded-lg bg-[#040814] border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase text-[10px]">
            <Database className="h-3 w-3" />
            <span>Verified Sources / Telemetry Trace</span>
          </div>
          <p className="whitespace-pre-line text-slate-300 text-[10px] leading-tight">
            {sourcesBlock}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`border-2 border-slate-800 bg-[#070b16] shadow-2xl flex flex-col font-sans overflow-hidden ${
        compact ? "h-[580px]" : "min-h-[720px]"
      } ${className}`}
    >
      {/* 1. HEADER: RESQ AI & AI Emergency Response Copilot */}
      <CardHeader className="py-3 px-4 sm:px-6 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-900/80 to-blue-950/80 border border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-950/40">
            <Bot className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg font-black tracking-wider text-white font-mono uppercase">
                RESQ AI
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-indigo-950/80 border-indigo-500/60 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-indigo-400" />
                GEMINI 2.5 FLASH
              </Badge>
              <Badge
                variant={isEscalated ? "critical" : "info"}
                className="text-[9px] font-mono uppercase"
                pulse={isEscalated}
              >
                {isEscalated ? "ESCALATED TELEMETRY" : "BASELINE TELEMETRY"}
              </Badge>
            </div>
            <p className="text-xs text-indigo-300 font-mono tracking-wide mt-0.5 font-semibold">
              AI Emergency Response Copilot
            </p>
          </div>
        </div>

        {/* Controls: Mode Switch & Clear */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOfflineSimMode(!offlineSimMode)}
            className={`h-7 px-2.5 text-[10px] font-mono cursor-pointer transition-colors ${
              offlineSimMode
                ? "bg-amber-950/70 border-amber-600 text-amber-300 hover:bg-amber-900/60"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
            }`}
            title="Toggle offline fallback simulation for hackathon demo"
          >
            <Cpu className="h-3 w-3 mr-1" />
            {offlineSimMode ? "FALLBACK: ON" : "GEMINI: LIVE"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-200 cursor-pointer"
            title="Clear Chat Log"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      {/* 2. LIVE TELEMETRY CONTEXT STRIP */}
      <div className="bg-[#0b1224] border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-bold">OPERATOR:</span>
          <span className="text-indigo-300 font-bold">Cmdr Jaswant Karun</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300">
          <span className="flex items-center gap-1">
            <span className="text-slate-500">Water:</span>
            <strong className={isEscalated ? "text-red-400" : "text-blue-300"}>
              {incident.metrics?.waterLevelMeters ?? 2.4}m
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-500">Affected:</span>
            <strong className="text-slate-100">
              {(incident.metrics?.affectedPopulationEstimated ?? 1240).toLocaleString()}
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-500">Route:</span>
            <strong className="text-emerald-300">
              {plan.evacuationRoute || (isEscalated ? "R4" : "R2")} → {plan.targetShelter || (isEscalated ? "Shelter C" : "Shelter B")}
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-500">Fleet:</span>
            <strong className="text-amber-300">
              {resourceAllocationState?.available?.ambulances ?? 6} Amb / {resourceAllocationState?.available?.rescueTeams ?? 4} Teams / {resourceAllocationState?.available?.drones ?? 2} Drones Avail
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-500">Gate:</span>
            <strong className={isActionApproved ? "text-emerald-400" : "text-amber-400"}>
              {isActionApproved ? "AUTHORIZED" : "PENDING"}
            </strong>
          </span>
        </div>
      </div>

      {/* 3. CHAT THREAD AREA */}
      <CardContent className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 font-sans bg-gradient-to-b from-[#060914] via-[#070d1c] to-[#060a16]">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`p-2 rounded-xl shrink-0 border shadow-md ${
                  isUser
                    ? "bg-blue-600 border-blue-400 text-white"
                    : msg.source === "GEMINI_AI"
                    ? "bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/60 text-indigo-300"
                    : "bg-amber-950/80 border-amber-500/60 text-amber-300"
                }`}
              >
                {isUser ? (
                  <User className="h-4 w-4" />
                ) : msg.source === "GEMINI_AI" ? (
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Cpu className="h-4 w-4 text-amber-400" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-xl text-xs sm:text-sm leading-relaxed transition-all ${
                  isUser
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none"
                    : "bg-slate-900/90 border border-slate-800/90 text-slate-100 rounded-tl-none"
                }`}
              >
                {/* Assistant Metadata Header */}
                {!isUser && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-indigo-400">RESQ AI</span>
                      <span className="text-slate-600">|</span>
                      <span
                        className={
                          msg.source === "GEMINI_AI"
                            ? "text-indigo-300"
                            : "text-amber-400"
                        }
                      >
                        {msg.source === "GEMINI_AI"
                          ? "Situation-Aware Gemini Copilot"
                          : "Deterministic Rule Fallback Engine"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Message Body with structured plan formatting */}
                {renderMessageContent(msg.text)}

                {/* Subtitle / status note */}
                {!isUser && msg.statusMessage && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono flex items-center justify-between gap-2">
                    <span>{msg.statusMessage}</span>
                    {msg.stageSnapshot && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {msg.stageSnapshot}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl shrink-0 bg-indigo-950/80 border border-indigo-500/60 text-indigo-400">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Querying MongoDB state & synthesizing situation-aware tactical reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* 4. SPECIAL COMMANDS BAR (/status, /risk, /resources, etc.) */}
      <div className="bg-[#080d1e] border-t border-slate-800/90 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 shrink-0">
          <Terminal className="h-3 w-3 text-indigo-400" />
          Commands:
        </span>
        {specialCommands.map((sc) => (
          <button
            key={sc.cmd}
            onClick={() => handleSendMessage(sc.cmd)}
            disabled={isLoading}
            className="text-[10px] font-mono bg-slate-900 hover:bg-indigo-950 border border-slate-700/80 hover:border-indigo-400 text-indigo-300 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-all shrink-0 disabled:opacity-50"
            title={sc.desc}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* 5. SUGGESTED QUESTIONS CHIP BAR (ALL 12 QUESTIONS FROM PROMPT) */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase">
          <HelpCircle className="h-3 w-3 text-indigo-400" />
          <span>Situation-Aware Suggested Inquiries:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
          {primarySuggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] font-mono bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 px-2.5 py-1 rounded-full transition-all cursor-pointer text-left shadow-sm disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 6. INPUT FOOTER */}
      <CardFooter className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask RESQ AI (e.g. /status, Give me a response plan, Why did route change?)..."
          disabled={isLoading}
          className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
        />

        <Button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputQuestion.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-mono text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-900/30 transition-all shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
