"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkflowOrchestrationPanel } from "@/components/dashboard/WorkflowOrchestrationPanel";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Code,
  Copy,
  GitBranch,
  Layers,
  Mail,
  Megaphone,
  Navigation,
  Server,
} from "lucide-react";

export function AutomationView() {
  const {
    incident,
    plan,
    ambulances,
    rescueTeams,
    drones,
    workflowState,
  } = useDashboard();

  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  const samplePayload = {
    incident: {
      id: incident.id,
      code: incident.code,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      primaryLocation: incident.primaryLocation,
      metrics: incident.metrics,
    },
    responsePlan: {
      id: plan.id,
      humanApproved: plan.humanApproved,
      riskLevel: plan.riskLevel,
      resourceAllocation: plan.resourceAllocation,
      priorityZones: plan.priorityZones,
    },
    resources: {
      ambulances: ambulances.slice(0, 3).map((a) => ({ id: a.id, callsign: a.callsign, status: a.status })),
      rescueTeams: rescueTeams.slice(0, 2).map((r) => ({ id: r.id, callsign: r.callsign, status: r.status })),
      drones: drones.slice(0, 2).map((d) => ({ id: d.id, callsign: d.callsign, flightStatus: d.flightStatus })),
    },
    simulationMode: true,
  };

  const riskAlertPayload = {
    riskForecast: {
      forecastId: "fc-adyar-902",
      hazardType: "FLOOD",
      forecastWindow: "Next 24 hours",
      contributingFactors: [
        "Heavy rainfall",
        "High precipitation probability",
        "Population exposure",
        "Existing flood conditions",
      ],
    },
    area: {
      id: "zone-a",
      name: "Zone A (Saidapet)",
      affectedPopulation: 1240,
    },
    severity: "CRITICAL",
    riskScore: 85,
    commander: {
      name: "Cmdr Jaswant Karun",
      email: "jksam37@gmail.com",
      phone: "+91 98400 12345",
      role: "INCIDENT_COMMANDER",
    },
    timestamp: "2026-10-06T13:30:00Z",
    simulationMode: false,
  };

  const [copiedRiskPayload, setCopiedRiskPayload] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyRisk = () => {
    navigator.clipboard.writeText(JSON.stringify(riskAlertPayload, null, 2));
    setCopiedRiskPayload(true);
    setTimeout(() => setCopiedRiskPayload(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2.5">
            <GitBranch className="h-6 w-6 text-indigo-400" />
            N8N WORKFLOW ORCHESTRATION LAYER
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            RESQNET decides <strong className="text-slate-200">WHAT</strong> should happen (State, Map, Plan, AI, Resources).{" "}
            n8n coordinates <strong className="text-indigo-300">HOW</strong> response workflows execute (Branching, Dispatching, Human Approvals, Alerts).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workflowState.isSimulationMode ? (
            <Badge variant="warning" className="border-amber-700/60 bg-amber-950/60 text-amber-300 font-mono py-1 px-3">
              Automation: SIMULATION MODE
            </Badge>
          ) : (
            <Badge variant="success" pulse className="font-mono py-1 px-3">
              n8n Workflow: RUNNING
            </Badge>
          )}
        </div>
      </div>

      {/* Primary Status & Controls Panel */}
      <WorkflowOrchestrationPanel />

      {/* Architecture Separation Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: RESQNET Responsibilities */}
        <Card className="bg-[#080d1a] border-slate-800">
          <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              RESQNET Application Responsibilities (WHAT)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Interactive Incident Command Center & Live Map</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Real-time Inundation & Dam Surge State Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Gemini AI + Deterministic Response Plan Synthesis</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Fleet Readiness & Resource Allocation Math</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Commander Clearance & Safeguards</span>
            </div>
          </CardContent>
        </Card>

        {/* Right: n8n Responsibilities */}
        <Card className="bg-[#080d1a] border-slate-800">
          <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-indigo-400" />
              n8n Orchestration Responsibilities (HOW)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Workflow Orchestration, Logic Gates & Branching</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Human Approval Webhook Checkpoints</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Multi-Service Dispatch Sequences (Ambulance, SDRF)</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Autonomous UAV Recon Flight Mission Generation</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>CAP Emergency Alert Formulation & Siren Stubs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The 4 Workflow Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workflow 1 */}
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-blue-400" />
              WORKFLOW 1: Incident Intake
            </span>
            <span className="text-[10px] font-mono text-slate-500">n8n/workflow-1-incident-intake.json</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="text-blue-400">Webhook</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Validate Incident</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Create/Update Incident</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-amber-400">Analyze Severity</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-red-400">Branch</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Validates incident payload integrity, computes severity matrix, and routes severe dam/flood events directly to the Critical Response trigger.
          </p>
        </div>

        {/* Workflow 2 */}
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              WORKFLOW 2: Critical Response
            </span>
            <span className="text-[10px] font-mono text-slate-500">n8n/workflow-2-critical-response.json</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="text-amber-400">Check Severity</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-red-400">Request Human Approval</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-emerald-400">Allocate Resources</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-blue-400">Trigger Ambulance</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-indigo-400">Trigger Drones</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Enforces commander clearance safeguard before sequencing multi-agency dispatch workflows to mock ambulance and rescue team interfaces.
          </p>
        </div>

        {/* Workflow 3 */}
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-indigo-400" />
              WORKFLOW 3: Drone Deployment
            </span>
            <span className="text-[10px] font-mono text-slate-500">n8n/workflow-3-drone-deployment.json</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="text-indigo-400">Drone Request</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Check Available Drones</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Select Optimal Drone</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-emerald-400">Create Mission</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-blue-400">Update Status</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Scans UAV fleet telemetry, filters by battery percentage, generates autonomous thermal waypoint corridor, and clears for takeoff.
          </p>
        </div>

        {/* Workflow 4 */}
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-red-400" />
              WORKFLOW 4: Emergency Alert
            </span>
            <span className="text-[10px] font-mono text-slate-500">n8n/workflow-4-emergency-alert.json</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="text-red-400">Critical Incident</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Generate Alert</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-amber-400">Human Approval</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-emerald-400">Publish/Simulate Alert</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Log Alert</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Compiles Common Alerting Protocol (CAP) payload, verifies supervisor authorization, and disseminates to simulated cell tower siren stubs.
          </p>
        </div>

        {/* Workflow 5: RESQNET Risk Alert */}
        <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-rose-400" />
              WORKFLOW 5: RESQNET Risk Alert (Email)
            </span>
            <span className="text-[10px] font-mono text-slate-500">n8n/workflow-5-risk-alert.json</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
            <span className="text-indigo-400">Webhook</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Validate Risk</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-amber-400">Check Severity</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-rose-400">IF HIGH / CRITICAL</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-blue-400">Create Alert Log</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-cyan-400">Send Email</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-emerald-400">Update RESQNET</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-200">Return Status</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Dispatches automated emergency email alert to Incident Commander. Enforces strict safety protocol for <strong className="text-rose-400">CRITICAL</strong> alerts: commander review is required before simulated emergency execution. The email notifies the commander, but emergency execution still requires human approval.
          </p>
        </div>
      </div>

      {/* Payload Inspectors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Schema 1: Full Orchestration */}
        <Card className="bg-[#080d1a] border-slate-800">
          <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" />
              n8n Orchestrator Schema (/api/automation/trigger)
            </CardTitle>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="border-slate-700 text-xs font-mono py-1 px-2.5 h-7 cursor-pointer"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedPayload ? "Copied!" : "Copy Payload"}
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-60 scrollbar-thin">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Schema 2: RESQNET Risk Alert */}
        <Card className="bg-[#080d1a] border-slate-800">
          <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <Mail className="h-4 w-4 text-rose-400" />
              RESQNET Risk Alert Schema (/api/automation/risk-alert)
            </CardTitle>
            <Button
              onClick={handleCopyRisk}
              size="sm"
              variant="outline"
              className="border-slate-700 text-xs font-mono py-1 px-2.5 h-7 cursor-pointer"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedRiskPayload ? "Copied!" : "Copy Payload"}
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-60 scrollbar-thin">
              {JSON.stringify(riskAlertPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
