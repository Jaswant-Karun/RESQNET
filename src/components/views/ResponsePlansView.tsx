"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { ResponsePlanReview } from "@/components/dashboard/ResponsePlanReview";
import { Badge } from "@/components/ui/badge";
import { FileCheck2 } from "lucide-react";

import { ResourceAllocationPanel } from "@/components/dashboard/ResourceAllocationPanel";
import { WorkflowOrchestrationPanel } from "@/components/dashboard/WorkflowOrchestrationPanel";

export function ResponsePlansView() {
  const { plan } = useDashboard();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-indigo-400" />
            ADAPTIVE RESPONSE PLANS & HUMAN CLEARANCE
          </h2>
          <p className="text-xs text-slate-400">
            AI-synthesized tactical rescue directives, evacuation road corridors, and authorization audit trail.
          </p>
        </div>
        <Badge variant={plan.humanApproved ? "success" : "warning"}>
          {plan.humanApproved ? "AUTHORIZED FOR EXECUTION" : "AWAITING HUMAN APPROVAL"}
        </Badge>
      </div>

      <WorkflowOrchestrationPanel />

      <ResourceAllocationPanel />

      <ResponsePlanReview plan={plan} />
    </div>
  );
}
