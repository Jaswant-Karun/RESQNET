"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  FileCheck2,
  GitBranch,
  Layers,
  LifeBuoy,
  Loader2,
  Lock,
  Megaphone,
  Navigation,
  Play,
  Radio,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export function WorkflowOrchestrationPanel() {
  const {
    workflowState,
    isTriggeringAutomation,
    triggerAutomationWorkflow,
    approveCriticalResponseWorkflow,
    dispatchDroneWorkflow,
    approveEmergencyAlertWorkflow,
    incident,
  } = useDashboard();

  const [showLogs, setShowLogs] = useState<boolean>(true);

  // Status mapping
  const {
    orchestrator,
    incidentIntake,
    criticalResponse,
    droneWorkflow,
    emergencyAlert,
    isSimulationMode,
    logs,
    lastTriggeredAt,
  } = workflowState;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
      case "IN_FLIGHT":
        return <Badge variant="success">{status.replace(/_/g, " ")}</Badge>;
      case "RUNNING":
      case "READY":
        return <Badge variant="info">{status.replace(/_/g, " ")}</Badge>;
      case "WAITING FOR APPROVAL":
      case "PENDING APPROVAL":
        return (
          <Badge variant="warning" pulse>
            {status}
          </Badge>
        );
      case "SIMULATION_MODE":
      case "SIMULATED":
        return (
          <Badge variant="warning" className="border-amber-700/60 bg-amber-950/60 text-amber-300">
            {status.replace(/_/g, " ")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.replace(/_/g, " ")}</Badge>;
    }
  };

  return (
    <Card
      glow={isSimulationMode ? "blue" : "green"}
      className="bg-[#080d1a] border-slate-800 shadow-xl overflow-hidden"
    >
      {/* Top Banner / Header */}
      <CardHeader className="py-3 px-4 bg-slate-950/90 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-1.5">
                  <span>WORKFLOW ORCHESTRATION LAYER</span>
                  <span className="text-[10px] text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/60">
                    n8n
                  </span>
                </CardTitle>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Decides HOW response executes</span>
                <span>•</span>
                <span className="text-slate-500">
                  {lastTriggeredAt
                    ? `Last Cycle: ${new Date(lastTriggeredAt).toLocaleTimeString()}`
                    : "Armed & Synchronized"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Mode Indicator Pill */}
          <div className="flex items-center gap-2">
            {isSimulationMode ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/70 border border-amber-800/80 text-amber-300 font-mono text-xs font-bold shadow-inner">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Automation: SIMULATION MODE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-mono text-xs font-bold shadow-inner">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>n8n Workflow: RUNNING</span>
              </div>
            )}

            <Button
              onClick={() => triggerAutomationWorkflow("TRIGGER_FULL_ORCHESTRATION")}
              disabled={isTriggeringAutomation}
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-mono py-1 px-2.5 h-8 cursor-pointer"
              title="Re-run full n8n intake & orchestration cycle"
            >
              {isTriggeringAutomation ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1 text-indigo-400" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1 text-indigo-400" />
              )}
              Sync n8n
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* The 4 Core Workflow Status Cards (Grid Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* WORKFLOW 1: Incident Intake */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <AlertOctagon className="h-3.5 w-3.5 text-blue-400" />
                Incident Intake
              </span>
              {getStatusBadge(incidentIntake)}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-slate-200 truncate">
                {incident.code} Validated
              </div>
              <div className="text-[11px] font-mono text-slate-400 leading-tight">
                Severity: <span className="text-red-400 font-bold">{incident.severity}</span>
                <span className="block text-slate-500">Branch: Critical Response</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/70 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Automated Intake Verified</span>
            </div>
          </div>

          {/* WORKFLOW 2: Critical Response */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                Critical Response
              </span>
              {getStatusBadge(criticalResponse)}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-slate-200">
                {criticalResponse === "APPROVED"
                  ? "Multi-Agency Dispatched"
                  : "Approval Gate Active"}
              </div>
              <div className="text-[11px] font-mono text-slate-400 leading-tight">
                {criticalResponse === "APPROVED" ? (
                  <span className="text-emerald-300">Ambulance & Boat CAD armed</span>
                ) : (
                  <span className="text-amber-300">Awaiting Commander sign-off</span>
                )}
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/70">
              {criticalResponse === "WAITING FOR APPROVAL" ? (
                <button
                  onClick={approveCriticalResponseWorkflow}
                  disabled={isTriggeringAutomation}
                  className="w-full text-center py-1 px-2 rounded bg-amber-950/80 hover:bg-amber-900/90 border border-amber-800/80 text-[10px] font-mono font-bold text-amber-200 cursor-pointer transition-colors"
                >
                  Approve Response
                </button>
              ) : (
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Authorized by EOC Chief</span>
                </div>
              )}
            </div>
          </div>

          {/* WORKFLOW 3: Drone Deployment */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 text-indigo-400" />
                Drone Workflow
              </span>
              {getStatusBadge(droneWorkflow)}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-slate-200">
                {droneWorkflow === "IN_FLIGHT" ? "UAV Echo-1 Airborne" : "UAV Fleet Standby"}
              </div>
              <div className="text-[11px] font-mono text-slate-400 leading-tight">
                {droneWorkflow === "IN_FLIGHT" ? (
                  <span className="text-blue-300">FLIR Recon corridor active</span>
                ) : (
                  <span>3 UAVs on pad (Battery &gt; 85%)</span>
                )}
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/70">
              {droneWorkflow !== "IN_FLIGHT" ? (
                <button
                  onClick={() => dispatchDroneWorkflow()}
                  disabled={isTriggeringAutomation}
                  className="w-full text-center py-1 px-2 rounded bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-800/80 text-[10px] font-mono font-bold text-indigo-200 cursor-pointer transition-colors"
                >
                  Launch UAV Recon
                </button>
              ) : (
                <div className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>Live Telemetry 98%</span>
                </div>
              )}
            </div>
          </div>

          {/* WORKFLOW 4: Emergency Alert */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-2 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Megaphone className="h-3.5 w-3.5 text-red-400" />
                Emergency Alert
              </span>
              {getStatusBadge(emergencyAlert)}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-slate-200">
                {emergencyAlert === "SIMULATED" ? "Simulated Broadcast" : "CAP Alert Drafted"}
              </div>
              <div className="text-[11px] font-mono text-slate-400 leading-tight">
                {emergencyAlert === "SIMULATED" ? (
                  <span className="text-emerald-300">Mock Cell Broadcast Sent</span>
                ) : (
                  <span className="text-amber-300">Pending dissemination auth</span>
                )}
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/70">
              {emergencyAlert === "PENDING APPROVAL" ? (
                <button
                  onClick={approveEmergencyAlertWorkflow}
                  disabled={isTriggeringAutomation}
                  className="w-full text-center py-1 px-2 rounded bg-red-950/80 hover:bg-red-900/90 border border-red-800/80 text-[10px] font-mono font-bold text-red-200 cursor-pointer transition-colors"
                >
                  Authorize Alert
                </button>
              ) : (
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Logged in EAS Ledger</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prototype Architecture Disclaimer Box */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/90 flex items-start gap-2.5 text-slate-400 text-xs">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug text-[11px] font-mono">
            <span className="text-slate-300 font-bold">PROTOTYPE ARCHITECTURE NOTE: </span>
            External emergency services (Ambulance 108 CAD, SDRF flood squads, public EAS sirens) are
            simulated via mock endpoints. No real units or sirens are dispatched.
          </div>
        </div>

        {/* Collapsible Execution Event Logs */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                n8n Workflow Execution Audit Trail ({logs.length})
              </span>
              {showLogs ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              )}
            </button>
            <span className="text-[10px] font-mono text-slate-500">
              Orchestrator: {orchestrator}
            </span>
          </div>

          {showLogs && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] scrollbar-thin">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border flex flex-col gap-0.5 ${
                    log.status === "SUCCESS"
                      ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                      : log.status === "MOCK"
                      ? "bg-blue-950/20 border-blue-900/40 text-blue-300"
                      : log.status === "PENDING"
                      ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <span>[{log.workflow}]</span>
                      {log.stepName && <span>• {log.stepName}</span>}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[11px]">{log.message}</div>
                  {log.simulatedTarget && (
                    <div className="text-[9px] text-slate-500 truncate">
                      Target: {log.simulatedTarget}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
