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
    setSimulateApiFailure,
  } = useDashboard();

  const isEscalated = simulationStage === "ESCALATED";

  // Messages state with an initial situation-aware greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Operational greetings, Commander. I am RESQ AI, your situation-aware response assistant synchronized with live EOC telemetry. I track live water levels, impassable road corridors, dynamic resource routing, and human-in-the-loop approval gates. How can I assist with tactical operations?",
      timestamp: "Just now",
      source: "GEMINI_AI",
      statusMessage: "Connected to live EOC telemetry feed",
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

  // Suggested questions specified in prompt
  const suggestedQuestions = [
    "Why is this incident critical?",
    "Why did the route change?",
    "What resources are available?",
    "What needs approval?",
    "What changed after escalation?",
  ];

  const secondaryQuestions = [
    "Why is Zone A critical?",
    "Why was Route R2 selected?",
    "How many ambulances are available?",
    "Why do we need more rescue teams?",
    "What happened after the escalation?",
    "What actions are waiting for approval?",
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
        statusMessage: data.statusMessage || (data.source === "GEMINI_AI" ? "Situation-Aware Gemini Intelligence" : "Deterministic Offline Fallback"),
        stageSnapshot: isEscalated ? "ESCALATED" : "BASELINE",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Direct client fallback if API completely unreachable
      const fallbackText = isEscalated
        ? "Emergency fallback: Zone A & B water level is 3.1m (critical). Route R2 is submerged. Convoys re-routed via Route R4 to Shelter C (Capacity: 1,500) with 4 Ambulances, 3 Rescue Teams, and 2 Drones."
        : "Emergency fallback: Zone A water level is 2.4m (critical). Roads R1 and R3 are blocked. Evacuate via Route R2 to Shelter B with 2 Ambulances, 2 Rescue Teams, and 1 Drone.";

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
        text: "Mission log cleared. RESQ AI standby for live tactical inquiries.",
        timestamp: "Just now",
        source: "GEMINI_AI",
        statusMessage: "Connected to live EOC telemetry feed",
      },
    ]);
  };

  return (
    <Card
      className={`border-2 border-slate-800 bg-[#070b16] shadow-2xl flex flex-col font-sans overflow-hidden ${
        compact ? "h-[560px]" : "min-h-[700px]"
      } ${className}`}
    >
      {/* 1. HEADER: RESQ AI & SITUATION-AWARE SUBTITLE */}
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
                {isEscalated ? "ESCALATED CONTEXT" : "BASELINE CONTEXT"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 font-sans italic mt-0.5">
              &quot;Situation-aware response assistant&quot;
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

      {/* 2. LIVE TELEMETRY CONTEXT STRIP (SHOWS ASSISTANT IS AWARE OF CURRENT STATE) */}
      <div className="bg-[#0b1224] border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-bold">SYNCHRONIZED TELEMETRY:</span>
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
            <span className="text-slate-500">Blocked:</span>
            <strong className="text-amber-300">
              {incident.blockedRoads?.join(", ") || "R1, R3"}
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-500">Route:</span>
            <strong className="text-emerald-300">
              {plan.evacuationRoute || (isEscalated ? "R4" : "R2")} → {plan.targetShelter || (isEscalated ? "Shelter C" : "Shelter B")}
            </strong>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-slate-500">Gate:</span>
            <strong className={isActionApproved ? "text-emerald-400" : "text-amber-400"}>
              {isActionApproved ? "APPROVED" : "PENDING"}
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
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-xl text-xs sm:text-sm leading-relaxed transition-all ${
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
                          ? "Gemini Intelligence"
                          : "Deterministic Rule Fallback"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <p className="whitespace-pre-line font-sans">{msg.text}</p>

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
              <span>Analyzing live telemetry & calculating situation-aware reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* 4. SUGGESTED QUESTIONS CHIP BAR */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase">
          <HelpCircle className="h-3 w-3 text-indigo-400" />
          <span>Suggested Questions:</span>
        </div>

        {/* Primary 5 Suggested Questions from User Prompt */}
        <div className="flex flex-wrap items-center gap-1.5">
          {suggestedQuestions.map((q, idx) => (
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

        {/* Secondary Tactical Drill-Down Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {secondaryQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-md transition-all cursor-pointer text-left disabled:opacity-50"
            >
              • {q}
            </button>
          ))}
        </div>
      </div>

      {/* 5. INPUT FOOTER */}
      <CardFooter className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask RESQ AI (e.g. Why did the route change? What needs approval?)..."
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
