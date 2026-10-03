"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { TimelineFeed } from "@/components/dashboard/TimelineFeed";
import { Activity, Bell } from "lucide-react";

export function ActivityLogView() {
  const { alerts, timeline } = useDashboard();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            OPERATIONAL ACTIVITY AUDIT & ALERTS
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of sensor telemetry warnings, civic alerts, and mission timeline transitions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AlertsFeed alerts={alerts} />
        <TimelineFeed timeline={timeline} />
      </div>
    </div>
  );
}
