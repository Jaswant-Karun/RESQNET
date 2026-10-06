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
import { CriticalRiskAlertBanner } from "@/components/dashboard/CriticalRiskAlertBanner";
import { Badge } from "@/components/ui/badge";
import {
  AlertOctagon,
  Bot,
  Flame,
  GitBranch,
  History,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Truck,
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
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 pb-16 md:pb-12">
      {/* ========================================================
          MOBILE PRIORITY 1 / DESKTOP ROW 1: CRITICAL ALERTS & CONTROLS
      ======================================================== */}
      <div className="order-1 lg:order-1 lg:col-span-12 space-y-4">
        {/* Tactical Simulation Controls */}
        <SimulationControls />

        {/* Critical Risk Detection & Commander Review Banner */}
        <CriticalRiskAlertBanner />
      </div>

      {/* ========================================================
          MOBILE PRIORITY 2 / DESKTOP ROW 3: CURRENT RISK
      ======================================================== */}
      <section className="order-2 lg:order-4 lg:col-span-12 space-y-3.5">
        <SectionHeader
          number="MODULE"
          title="CURRENT RISK & HAZARDS"
          badgeText="OPEN-METEO + GDACS + NASA FIRMS"
          badgeColor="red"
          icon={ShieldAlert}
          description="Multisource observed hazards, meteorological forecasts, and deterministic risk scoring"
        />

        <div className="p-4 rounded-xl bg-[#080d1a] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <strong className="text-white font-mono text-xs sm:text-sm uppercase">
                Zone A - Kotturpuram Riverfront Basin (Risk Score: {isEscalated ? "96" : "88"}/100 • CRITICAL)
              </strong>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live multisource intelligence correlated: Open-Meteo precipitation forecast, GDACS regional alerts, and RESQNET deterministic risk engine.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => setActiveTab("risk-intelligence")}
              className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
            >
              <span>Launch Live Disaster Risk Intelligence</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          MOBILE PRIORITY 3 / DESKTOP ROW 2: ACTIVE INCIDENT
      ======================================================== */}
      <section className="order-3 lg:order-3 lg:col-span-12 space-y-3.5">
        <SectionHeader
          number="SECTION 01"
          title="ACTIVE INCIDENT STATUS"
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
          MOBILE PRIORITY 4 / DESKTOP ROW 4 (LEFT): CRISIS MAP
      ======================================================== */}
      <section className="order-4 lg:order-6 lg:col-span-7 space-y-3.5 flex flex-col">
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

      {/* ========================================================
          MOBILE PRIORITY 5 / DESKTOP ROW 6: RESOURCE STATUS
      ======================================================== */}
      <section className="order-5 lg:order-10 lg:col-span-12 space-y-3.5">
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
          MOBILE PRIORITY 6 / DESKTOP ROW 3.5: APPROVAL REQUESTS
      ======================================================== */}
      <section className="order-6 lg:order-5 lg:col-span-12 space-y-3.5">
        <SectionHeader
          number="SECTION 02"
          title="APPROVAL REQUESTS"
          badgeText="HUMAN APPROVAL REQUIRED"
          badgePulse={true}
          badgeColor="amber"
          icon={ShieldCheck}
          description="Mandatory operator authorization before simulated execution"
        />

        <EmergencyApprovalPanel />
      </section>

      {/* DESKTOP ROW 4 (RIGHT): AI RESPONSE (evacuation plan reasoning) */}
      <section className="order-7 lg:order-7 lg:col-span-5 space-y-3.5 flex flex-col">
        <SectionHeader
          number="SECTION 04"
          title="AI RESPONSE"
          badgeText="AI RECOMMENDATION"
          badgeColor="indigo"
          icon={Bot}
          description="Evacuation plan reasoning & situational assistant"
        />

        <AiResponseStatusPanel />
      </section>

      {/* ========================================================
          MOBILE PRIORITY 7 / DESKTOP ROW 5 (LEFT): RESQ AI COPILOT
      ======================================================== */}
      <section className="order-8 lg:order-8 lg:col-span-7 space-y-3.5 flex flex-col">
        <ResqAiChatPanel compact />
      </section>

      {/* ========================================================
          SECONDARY OPERATIONAL PANELS: ADAPTIVE, AUTOMATION, TIMELINE, RESILIENCE
      ======================================================== */}

      {/* SECTION 5: ADAPTIVE RESPONSE */}
      <section className="order-9 lg:order-9 lg:col-span-12 space-y-3.5">
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

      {/* SECTION 7: AUTOMATION STATUS (n8n) */}
      <section className="order-10 lg:order-11 lg:col-span-12 space-y-3.5">
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

      {/* SECTION 8: INCIDENT TIMELINE */}
      <section className="order-11 lg:order-12 lg:col-span-12 space-y-3.5">
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

      {/* SECTION 9: SYSTEM RESILIENCE & FAILURE RECOVERY */}
      <section className="order-12 lg:order-13 lg:col-span-12 space-y-3.5">
        <SectionHeader
          number="SECTION 09"
          title="SYSTEM RESILIENCE & FAILURE RECOVERY"
          badgeText="ZERO-CRASH TOLERANCE"
          badgeColor="emerald"
          icon={ShieldCheck}
          description="Interactive verification of all external service failure cases and deterministic fallbacks"
        />

        <ResilienceTestingPanel />
      </section>

      {/* Global Tactical Toast */}
      <TacticalNotificationToast />
    </div>
  );
}
