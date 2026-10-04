"use client";

import React from "react";
import { TopKpiCards } from "@/components/dashboard/TopKpiCards";
import { CrisisMap } from "@/components/dashboard/CrisisMap";
import { AiResponseStatusPanel } from "@/components/dashboard/AiResponseStatusPanel";
import { IncidentTimeline } from "@/components/dashboard/IncidentTimeline";
import { SimulationControls } from "@/components/dashboard/SimulationControls";
import { useDashboard } from "@/context/DashboardContext";
import { AlertCircle, AlertTriangle, Droplets, MapPin, Users } from "lucide-react";

import { ResourceAllocationPanel } from "@/components/dashboard/ResourceAllocationPanel";
import { WorkflowOrchestrationPanel } from "@/components/dashboard/WorkflowOrchestrationPanel";

export function OverviewView() {
  const { incident, simulationStage } = useDashboard();

  return (
    <div className="space-y-5">
      {/* 1. Tactical Simulation Control Strip (with SIMULATE FLOOD & SIMULATE ESCALATION) */}
      <SimulationControls />

      {/* 2. Top KPI Cards */}
      <TopKpiCards />

      {/* 3. Main Center/Right Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT / CENTER: Large Crisis Map Placeholder Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <CrisisMap />
        </div>

        {/* RIGHT: AI Response Status Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <AiResponseStatusPanel />
        </div>
      </div>

      {/* 4. n8n Workflow Orchestration Layer Panel */}
      <WorkflowOrchestrationPanel />

      {/* 5. Intelligent Resource Allocation Panel */}
      <ResourceAllocationPanel />

      {/* 6. BOTTOM: Incident Timeline */}
      <IncidentTimeline />
    </div>
  );
}
