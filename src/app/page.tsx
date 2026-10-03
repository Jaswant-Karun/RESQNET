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

export default function DashboardPage() {
  const { activeTab } = useDashboard();

  switch (activeTab) {
    case "incidents":
      return <IncidentsView />;
    case "resources":
      return <ResourcesView />;
    case "drones":
      return <DronesView />;
    case "plans":
      return <ResponsePlansView />;
    case "activity":
      return <ActivityLogView />;
    case "ai":
      return <ResqAiView />;
    case "overview":
    default:
      return <OverviewView />;
  }
}
