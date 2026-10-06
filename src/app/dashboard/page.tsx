"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { OverviewView } from "@/components/views/OverviewView";
import { IncidentsView } from "@/components/views/IncidentsView";
import { ResourcesView } from "@/components/views/ResourcesView";
import { DronesView } from "@/components/views/DronesView";
import { ResponsePlansView } from "@/components/views/ResponsePlansView";
import { ActivityLogView } from "@/components/views/ActivityLogView";
import { ResqAiView } from "@/components/views/ResqAiView";
import { AutomationView } from "@/components/views/AutomationView";
import { RiskIntelligenceView } from "@/components/views/RiskIntelligenceView";
import { CrisisMapView } from "@/components/views/CrisisMapView";

export default function DashboardPage() {
  const { activeTab } = useDashboard();

  switch (activeTab) {
    case "map":
      return <CrisisMapView />;
    case "risk-intelligence":
      return <RiskIntelligenceView />;
    case "incidents":
      return <IncidentsView />;
    case "resources":
      return <ResourcesView />;
    case "drones":
      return <DronesView />;
    case "plans":
      return <ResponsePlansView />;
    case "automation":
      return <AutomationView />;
    case "activity":
      return <ActivityLogView />;
    case "ai":
      return <ResqAiView />;
    case "overview":
    default:
      return <OverviewView />;
  }
}
