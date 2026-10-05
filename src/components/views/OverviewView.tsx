"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { SimulationControls } from "@/components/dashboard/SimulationControls";
import { IncidentBanner } from "@/components/dashboard/IncidentBanner";
import { TopKpiCards } from "@/components/dashboard/TopKpiCards";
import { EmergencyApprovalPanel } from "@/components/dashboard/EmergencyApprovalPanel";
import { CrisisMap } from "@/components/dashboard/CrisisMap";
import { AiResponseStatusPanel } from "@/components/dashboard/AiResponseStatusPanel";
import { ResqAiChatPanel } from "@/components/dashboard/ResqAiChatPanel";
import { EscalationComparisonPanel } from "@/components/dashboard/EscalationComparisonPanel";
import { ResourceAllocationPanel } from "@/components/dashboard/ResourceAllocationPanel";
import { WorkflowOrchestrationPanel } from "@/components/dashboard/WorkflowOrchestrationPanel";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { ResilienceTestingPanel } from "@/components/dashboard/ResilienceTestingPanel";
import { TacticalNotificationToast } from "@/components/dashboard/TacticalNotificationToast";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagon,
  Bot,
  Cpu,
  Flame,
  GitBranch,
  History,
  Layers,
  MapPin,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Waves,
} from "lucide-react";

interface SectionHeaderProps {
  number: string;
  title: string;
  badgeText?: string;
  badgePulse?: boolean;
  badgeColor?: "red" | "amber" | "emerald" | "blue" | "indigo" | "purple";
  icon: React.ElementType;
  description: string;
}

function SectionHeader({
  number,
  title,
  badgeText,
  badgePulse = false,
  badgeColor = "blue",
  icon: Icon,
  description,
}: SectionHeaderProps) {
  const getBadgeClass = () => {
    switch (badgeColor) {
      case "red":
        return "bg-rose-950/80 border-rose-500/70 text-rose-300";
      case "amber":
        return "bg-amber-950/80 border-amber-500/70 text-amber-300";
      case "emerald":
        return "bg-emerald-950/80 border-emerald-500/70 text-emerald-300";
      case "indigo":
        return "bg-indigo-950/80 border-indigo-500/70 text-indigo-300";
      case "purple":
        return "bg-purple-950/80 border-purple-500/70 text-purple-300";
      case "blue":
      default:
        return "bg-blue-950/80 border-blue-500/70 text-blue-300";
    }
  };

  return (
    <div className="relative p-3 rounded-lg bg-gradient-to-r from-slate-950 via-[#0a1122] to-slate-950 border border-slate-800/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-[11px] font-black text-blue-400 bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded shadow-sm">
          {number}
        </span>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-xs sm:text-sm font-black font-mono tracking-wider text-slate-100 uppercase">
            {title}
          </h2>
        </div>
        {badgeText && (
          <Badge
            variant="outline"
            pulse={badgePulse}
            className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 border shadow-sm ${getBadgeClass()}`}
          >
            {badgeText}
          </Badge>
        )}
      </div>
      <p className="text-[11px] text-slate-400 font-sans sm:text-right font-medium">
        {description}
      </p>
    </div>
  );
}

export function OverviewView() {
  const { incident, simulationStage, setActiveTab } = useDashboard();

  const isEscalated = simulationStage === "ESCALATED";

  return (
    <div className="space-y-8 pb-12">
      {/* 0. TACTICAL SIMULATION CONTROLS (SIMULATE FLOOD, SIMULATE ESCALATION, RESET) */}
      <SimulationControls />

      {/* ========================================================
          SECTION 1: INCIDENT STATUS
          Answers: 1. There is an emergency. 2. Where it is. 3. How severe it is.
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 01"
          title="INCIDENT STATUS"
          badgeText="SIMULATION MODE"
          badgePulse={true}
          badgeColor="red"
          icon={AlertOctagon}
          description="Simulated emergency detection, affected sector, and threat metrics"
        />

        {/* Hero Narrative Banner */}
        <IncidentBanner incident={incident} />

        {/* KPI Summary Cards */}
        <TopKpiCards />
      </section>

      {/* ========================================================
          NEW MODULE: LIVE DISASTER RISK MAP
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="MODULE"
          title="LIVE DISASTER RISK MAP"
          badgeText="OPEN-METEO + GDACS + NASA FIRMS"
          badgeColor="red"
          icon={ShieldAlert}
          description="Multisource observed hazards, meteorological forecasts, and deterministic risk scoring"
        />

        <div className="p-4 rounded-xl bg-[#080d1a] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <strong className="text-white font-mono text-sm uppercase">
                Zone A - Kotturpuram Riverfront Basin (Risk Score: {isEscalated ? "96" : "88"}/100 • CRITICAL)
              </strong>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live multisource intelligence correlated: Open-Meteo precipitation forecast, GDACS regional alerts, and RESQNET deterministic risk engine.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("risk-intelligence")}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center gap-1.5"
            >
              <span>Launch Live Disaster Risk Intelligence</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: APPROVAL
          Answers: 6. What requires human approval.
          Highlights: AI Recommendation -> Human Approval -> Automated Workflow
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 02"
          title="APPROVAL"
          badgeText="HUMAN APPROVAL REQUIRED"
          badgePulse={true}
          badgeColor="amber"
          icon={ShieldCheck}
          description="Mandatory operator authorization before simulated execution"
        />

        <EmergencyApprovalPanel />
      </section>

      {/* ========================================================
          SECTIONS 3 & 4: CRISIS MAP & AI RESPONSE (2-Column Command View)
          Answers: 2. Where it is happening (Map). 4. What the AI recommends.
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: SECTION 3 - CRISIS MAP (8 cols) */}
        <section className="lg:col-span-8 space-y-3.5 flex flex-col">
          <SectionHeader
            number="SECTION 03"
            title="CRISIS MAP"
            badgeText="GIS SECTOR OVERLAY"
            badgeColor="blue"
            icon={MapPin}
            description="Hazard inundation zone, blocked roads, and evacuation corridor"
          />

          <CrisisMap />
        </section>

        {/* RIGHT: SECTION 4 - AI RESPONSE (4 cols) */}
        <section className="lg:col-span-4 space-y-3.5 flex flex-col">
          <SectionHeader
            number="SECTION 04"
            title="AI RESPONSE"
            badgeText="AI RECOMMENDATION"
            badgeColor="indigo"
            icon={Bot}
            description="Evacuation plan reasoning & situational assistant"
          />

          <div className="space-y-4">
            <AiResponseStatusPanel />
            <ResqAiChatPanel compact />
          </div>
        </section>
      </div>

      {/* ========================================================
          SECTION 5: ADAPTIVE RESPONSE
          Answers: 8. How the system adapts when conditions change.
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 05"
          title="ADAPTIVE RESPONSE"
          badgeText={isEscalated ? "ESCALATION ACTIVE" : "ADAPTIVE ENGINE ARMED"}
          badgePulse={isEscalated}
          badgeColor={isEscalated ? "red" : "purple"}
          icon={Flame}
          description="Demonstrates dynamic rerouting and resource recalculation when Route R2 floods"
        />

        <EscalationComparisonPanel />
      </section>

      {/* ========================================================
          SECTION 6: RESOURCE STATUS
          Answers: 5. What resources are available.
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 06"
          title="RESOURCE STATUS"
          badgeText="RESOURCE ALLOCATION"
          badgeColor="blue"
          icon={Truck}
          description="Available emergency pool, recommended units, and fleet readiness"
        />

        <ResourceAllocationPanel />
      </section>

      {/* ========================================================
          SECTION 7: AUTOMATION STATUS
          Answers: 7. What n8n is automating.
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 07"
          title="AUTOMATION STATUS"
          badgeText="AUTOMATED WORKFLOW (n8n)"
          badgeColor="emerald"
          icon={GitBranch}
          description="Simulated webhook orchestration layer executing verified emergency playbooks"
        />

        <WorkflowOrchestrationPanel />
      </section>

      {/* ========================================================
          SECTION 8: INCIDENT TIMELINE
          Answers: Full chronological audit log of all events.
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 08"
          title="INCIDENT TIMELINE"
          badgeText="CHRONOLOGICAL EVENT LOG"
          badgeColor="blue"
          icon={History}
          description="Complete audit trail tracking detections, decisions, approvals, and dispatches"
        />

        <IncidentTimeline />
      </section>

      {/* ========================================================
          SECTION 9: SYSTEM RESILIENCE & FAILURE RECOVERY
          Answers: Full failure-handling pass & external service fallback testing
      ======================================================== */}
      <section className="space-y-3.5">
        <SectionHeader
          number="SECTION 09"
          title="SYSTEM RESILIENCE & FAILURE RECOVERY"
          badgeText="ZERO-CRASH TOLERANCE"
          badgeColor="emerald"
          icon={ShieldCheck}
          description="Interactive verification of all 9 external service failure cases and deterministic fallbacks"
        />

        <ResilienceTestingPanel />
      </section>

      {/* Global Tactical Toast */}
      <TacticalNotificationToast />
    </div>
  );
}
