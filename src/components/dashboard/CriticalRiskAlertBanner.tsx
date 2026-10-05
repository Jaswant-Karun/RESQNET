"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  FileText,
  Lock,
  Radio,
  ShieldAlert,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  evaluateRiskForResponse,
  buildResponsePlanFromRisk,
} from "@/lib/disaster-data/services/riskResponseLinker";
import { AreaRiskAssessment } from "@/lib/disaster-data/types";

export function CriticalRiskAlertBanner() {
  const {
    riskIntelligence,
    incident,
    zones,
    resourceAllocationState,
    setPlan,
    applyAllocation,
    addTimelineEvent,
    setNotification,
    setActiveTab,
    triggerAutomationWorkflow,
    setIsActionApproved,
    setIsActionRejected,
    setRejectionReason,
  } = useDashboard();

  const [isDismissed, setIsDismissed] = useState(false);
  const [hasLoggedRiskEvent, setHasLoggedRiskEvent] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Find the highest critical risk assessment
  const criticalArea: AreaRiskAssessment | undefined =
    riskIntelligence?.riskAssessments?.find(
      (a) => a.riskLevel === "CRITICAL" || a.riskScore >= 75
    ) || riskIntelligence?.highestRiskArea;

  const isCritical =
    criticalArea &&
    (criticalArea.riskLevel === "CRITICAL" || criticalArea.riskScore >= 75);

  // Execute the deterministic pipeline when high/critical risk is detected:
  // Risk Engine -> Create Risk Forecast -> Check pop -> Check resources -> Generate recommended response -> Create activity event -> Notify commander -> Optionally trigger n8n
  useEffect(() => {
    if (!isCritical || !criticalArea || hasLoggedRiskEvent) return;

    const evaluation = evaluateRiskForResponse(
      criticalArea,
      zones,
      incident,
      resourceAllocationState
    );

    // 1. Create Risk Forecast in persistence layer
    fetch("/api/risk-forecasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        areaName: evaluation.shortName,
        hazardType: (criticalArea.hazard || "FLOOD").toUpperCase(),
        riskScore: evaluation.riskScore,
        riskLevel: evaluation.riskLevel,
        contributingFactors: criticalArea.contributingFactors?.map((f) => f.name) || [
          "Heavy rainfall forecast",
          "High precipitation probability",
          "Existing incident",
          "Population exposure",
        ],
        source: "Open-Meteo & RESQNET Risk Engine",
      }),
    }).catch(() => {});

    // 2. Create activity event in Common Event Service
    addTimelineEvent({
      id: `evt-risk-detect-${Date.now()}`,
      incidentId: incident.id,
      timestamp: new Date().toISOString(),
      title: evaluation.activityEvent.title,
      description: evaluation.activityEvent.description,
      category: evaluation.activityEvent.category,
      severity: evaluation.activityEvent.severity,
      authorOrSystem: evaluation.activityEvent.authorOrSystem,
    });

    // Optionally trigger n8n workflow
    if (triggerAutomationWorkflow) {
      triggerAutomationWorkflow("RISK_FORECAST_ALERT", evaluation.n8nPayload);
    }

    // 3. Dispatch Emergency Email Alert to Commander (Resend Provider)
    fetch("/api/alerts/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        area: evaluation.shortName,
        hazard: criticalArea.hazard || "Flood",
        riskScore: evaluation.riskScore,
        riskLevel: evaluation.riskLevel,
        forecastWindow: criticalArea.forecastWindow || "Next 24 hours",
        contributingFactors: criticalArea.contributingFactors?.map((f) => f.name) || [
          "Heavy rainfall",
          "High precipitation probability",
          "Population exposure",
          "Existing flood conditions",
        ],
        recommendedAction: "Review evacuation response plan.",
        incidentId: incident.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status === "SENT") {
          addTimelineEvent({
            id: `evt-email-${Date.now()}`,
            incidentId: incident.id,
            timestamp: new Date().toISOString(),
            title: "Emergency Email Alert Dispatched to Commander",
            description: `Delivered ${evaluation.riskLevel} alert for ${evaluation.shortName} to ${data.recipient || "Commander"}. Message ID: ${data.messageId || "N/A"}.`,
            category: "DECISION",
            severity: "CRITICAL",
            authorOrSystem: "RESQNET Email Alert Service (Resend)",
          });
        }
      })
      .catch(() => {});

    setHasLoggedRiskEvent(true);
  }, [
    isCritical,
    criticalArea,
    hasLoggedRiskEvent,
    zones,
    incident,
    resourceAllocationState,
    addTimelineEvent,
    triggerAutomationWorkflow,
  ]);

  if (!isCritical || !criticalArea || isDismissed) {
    return null;
  }

  const evaluation = evaluateRiskForResponse(
    criticalArea,
    zones,
    incident,
    resourceAllocationState
  );

  const shortArea = evaluation.shortName;
  const hazard = criticalArea.hazard || "Flood";
  const riskScore = criticalArea.riskScore;
  const riskLevel = criticalArea.riskLevel;
  const forecastWindow = criticalArea.forecastWindow || "Next 24 hours";
  const affectedPopulation = evaluation.affectedPopulation;
  const available = evaluation.availableResources;
  const recommended = evaluation.recommendedResponse;

  // Handler: Commander chooses GENERATE RESPONSE PLAN
  const handleGenerateResponsePlan = async () => {
    setIsGeneratingPlan(true);

    try {
      // Use existing response engine
      const responsePlan = buildResponsePlanFromRisk(criticalArea, incident);

      // Populate plan in DashboardContext
      setPlan(responsePlan);
      setIsActionApproved(false);
      setIsActionRejected(false);
      setRejectionReason(null);

      // Apply recommended resource allocation
      if (responsePlan.resourceAllocation && applyAllocation) {
        applyAllocation(responsePlan.resourceAllocation);
      }

      // Create activity event
      addTimelineEvent({
        id: `evt-plan-from-risk-${Date.now()}`,
        incidentId: incident.id,
        timestamp: new Date().toISOString(),
        title: `Response Plan Generated from Live Risk Intelligence (${shortArea})`,
        description: `Deterministic response engine generated plan for ${shortArea} (Risk Score: ${riskScore}/100). Evacuation Route: ${responsePlan.evacuationRoute} → ${responsePlan.targetShelter}. Allocation: ${responsePlan.resourceAllocation.ambulances} Amb, ${responsePlan.resourceAllocation.rescueTeams} Rescue, ${responsePlan.resourceAllocation.drones} UAV. Human approval required before deployment.`,
        category: "DECISION",
        severity: "CRITICAL",
        authorOrSystem: "RESQNET Deterministic Response Engine",
      });

      // Notify commander
      setNotification({
        type: "success",
        title: "RESPONSE PLAN GENERATED",
        message: `Plan formulated for ${shortArea} (${riskScore}/100). Human authorization required.`,
        timestamp: new Date().toISOString(),
      });

      // Optionally trigger n8n workflow
      if (triggerAutomationWorkflow) {
        triggerAutomationWorkflow("CRITICAL_RISK_PLAN_GENERATED", {
          area: shortArea,
          riskScore,
          planId: responsePlan.id,
          action: "AWAITING_COMMANDER_APPROVAL",
        });
      }

      // Dismiss banner after plan is generated and navigate to review
      setIsDismissed(true);
      setActiveTab("overview");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Handler: Commander chooses VIEW RISK
  const handleViewRisk = () => {
    setActiveTab("risk-intelligence");
  };

  // Handler: Commander chooses DISMISS
  const handleDismiss = () => {
    setIsDismissed(true);
    addTimelineEvent({
      id: `evt-risk-dismiss-${Date.now()}`,
      incidentId: incident.id,
      timestamp: new Date().toISOString(),
      title: `Critical Risk Alert Dismissed by Commander (${shortArea})`,
      description: `Commander acknowledged critical risk alert for ${shortArea} (${riskScore}/100). Plan generation deferred. Monitoring active.`,
      category: "ANALYSIS",
      severity: "INFO",
      authorOrSystem: "Commander Operations Desk",
    });
  };

  return (
    <Card className="relative overflow-hidden border-2 border-red-600/90 bg-gradient-to-r from-red-950/95 via-[#18090b] to-slate-950 text-white shadow-2xl shadow-red-950/50 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Top Pulsing Alarm Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />

      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Urgent Alarm Header & Threat Intel */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-2 rounded-lg bg-red-900/80 border border-red-500/70 text-red-200 shadow-md">
                <AlertTriangle className="h-5 w-5 text-red-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black font-mono tracking-wider text-red-100 uppercase">
                    CRITICAL RISK DETECTED
                  </h3>
                  <Badge className="bg-red-700 hover:bg-red-600 text-white font-mono text-[10px] font-extrabold uppercase px-2 py-0.5">
                    {riskLevel} ({riskScore}/100)
                  </Badge>
                </div>
                <p className="text-xs font-mono font-bold text-red-300 uppercase tracking-wide">
                  Commander Review Required
                </p>
              </div>
            </div>

            {/* Assessment Quick Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="p-2 rounded-lg bg-black/40 border border-red-900/40">
                <span className="text-[10px] text-slate-400 block uppercase">Area</span>
                <strong className="text-white font-bold">{shortArea}</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-red-900/40">
                <span className="text-[10px] text-slate-400 block uppercase">Hazard</span>
                <strong className="text-sky-300 font-bold">{hazard}</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-red-900/40">
                <span className="text-[10px] text-slate-400 block uppercase">Population at Risk</span>
                <strong className="text-amber-300 font-bold">{affectedPopulation.toLocaleString()} citizens</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-red-900/40">
                <span className="text-[10px] text-slate-400 block uppercase">Forecast Window</span>
                <strong className="text-emerald-300 font-bold">{forecastWindow}</strong>
              </div>
            </div>

            {/* Factors & Recommended Response Summary */}
            <div className="text-xs font-mono text-slate-300 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="text-slate-400 font-bold uppercase">Main Factors:</span>
                <span className="text-slate-200">• Heavy rainfall forecast</span>
                <span className="text-slate-200">• High precipitation probability</span>
                <span className="text-slate-200">• Existing incident</span>
                <span className="text-slate-200">• Population exposure</span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-mono">
                <strong className="text-amber-400">Recommended Response:</strong>{" "}
                {recommended.summary}
              </p>
            </div>

            {/* Safety Guardrail Notice */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400/90 pt-0.5">
              <Lock className="h-3 w-3 text-amber-400 shrink-0" />
              <span>
                Safety Rule: Autonomous irreversible emergency actions are strictly disabled. Commander authorization required.
              </span>
            </div>
          </div>

          {/* Right: Exactly 3 Required Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-stretch sm:self-auto justify-center">
            {/* 1. GENERATE RESPONSE PLAN */}
            <Button
              size="sm"
              onClick={handleGenerateResponsePlan}
              disabled={isGeneratingPlan}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-mono text-xs font-black uppercase tracking-wider py-2.5 px-4 shadow-lg shadow-red-950/60 cursor-pointer flex items-center justify-center gap-2 border border-red-400/50"
            >
              <Zap className={`h-4 w-4 ${isGeneratingPlan ? "animate-spin" : ""}`} />
              <span>{isGeneratingPlan ? "Generating Plan..." : "GENERATE RESPONSE PLAN"}</span>
            </Button>

            {/* 2. VIEW RISK */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewRisk}
              className="bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider py-2 px-3 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              <span>VIEW RISK</span>
            </Button>

            {/* 3. DISMISS */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-200 font-mono text-[11px] font-semibold uppercase tracking-wider py-1.5 px-3 cursor-pointer flex items-center justify-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>DISMISS</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
