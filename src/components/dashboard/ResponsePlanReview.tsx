"use client";

import React, { useState } from "react";
import { ResponsePlan } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Lock,
  Route,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface ResponsePlanReviewProps {
  plan: ResponsePlan;
}

export function ResponsePlanReview({ plan: initialPlan }: ResponsePlanReviewProps) {
  const [approved, setApproved] = useState(initialPlan.humanApproved);
  const [approvingOfficer, setApprovingOfficer] = useState<string | null>(null);

  const handleSimulateApproval = () => {
    setApproved(true);
    setApprovingOfficer("Commander Raghav Menon (EOC Command)");
  };

  return (
    <Card glow={approved ? "green" : "orange"} className="border-slate-800">
      <CardHeader className="py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <div>
              <CardTitle className="text-sm">
                AI Adaptive Response Recommendation
              </CardTitle>
              <div className="text-[11px] text-slate-400 font-mono">
                Plan ID: {initialPlan.id} • Version {initialPlan.planVersion}.0
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info">
              Confidence: {initialPlan.confidenceScorePercentage}%
            </Badge>
            <Badge variant={approved ? "success" : "warning"} pulse={!approved}>
              {approved ? "HUMAN APPROVED" : "AWAITING HUMAN APPROVAL"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Risk Assessment Summary */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
          <strong className="text-indigo-400 uppercase font-mono block mb-1">
            Tactical Situation Assessment:
          </strong>
          {initialPlan.riskAssessmentSummary}
        </div>

        {/* Primary Objectives */}
        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase font-mono mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
            Strategic Objectives ({initialPlan.primaryObjectives.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {initialPlan.primaryObjectives.map((obj, i) => (
              <div
                key={i}
                className="p-2 rounded bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="font-mono text-[10px] text-blue-400 font-bold mt-0.5">
                  0{i + 1}.
                </span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Tactical Actions */}
        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase font-mono mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            Recommended Response Sequence
          </div>
          <div className="space-y-2">
            {initialPlan.actions.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      STEP {act.stepNumber}
                    </span>
                    <Badge
                      variant={
                        act.priority === "IMMEDIATE" ? "critical" : "warning"
                      }
                    >
                      {act.priority}
                    </Badge>
                    {act.requiresHumanClearance && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                        <Lock className="h-2.5 w-2.5" />
                        Human Clearance Required
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {act.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {act.description}
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono text-[11px]">
                  <span className="text-slate-400">Deploy ETA: </span>
                  <span className="text-slate-200 font-bold">
                    ~{act.estimatedMinutesToDeploy} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evacuation Corridors */}
        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase font-mono mb-2 flex items-center gap-1.5">
            <Route className="h-3.5 w-3.5 text-emerald-400" />
            Assigned Evacuation Corridors
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {initialPlan.evacuationRoutes.map((route) => (
              <div
                key={route.id}
                className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">
                    {route.routeName}
                  </span>
                  <Badge variant="success">Safety: {route.safetyScore}/100</Badge>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Transit Time: ~{route.estimatedTransitMin} mins • Status: {route.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 bg-slate-950/90 border-t border-slate-800">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          {approved ? (
            <>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-emerald-300">
                Verified by {approvingOfficer || "Incident Commander"} • Ready for n8n Webhook
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>
                Human-in-the-loop safeguard active: High-risk rescue commands require command officer authorization.
              </span>
            </>
          )}
        </div>

        <div>
          {!approved ? (
            <Button
              variant="destructive"
              onClick={handleSimulateApproval}
              className="flex items-center gap-2 font-mono text-xs"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Approve Response Plan
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="border-emerald-600/50 text-emerald-400 bg-emerald-950/20 font-mono text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Authorized for Execution
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
