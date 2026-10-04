import {
  AutomationPayload,
  CriticalResponseStatus,
  DroneWorkflowStatus,
  EmergencyAlertStatus,
  IncidentIntakeStatus,
  OrchestratorStatus,
  WorkflowLogItem,
  WorkflowOrchestrationState,
} from "@/types";

/**
 * Result structure returned by n8n workflow engine
 */
export interface WorkflowExecutionResult {
  success: boolean;
  mode: "N8N_LIVE" | "SIMULATION";
  webhookUrlConfigured: boolean;
  webhookUrl?: string;
  n8nResponse?: any;
  error?: string;
  state: WorkflowOrchestrationState;
}

/**
 * Executes or simulates the 4 RESQNET n8n Workflows:
 * WORKFLOW 1: Incident Intake (Validate -> Update -> Analyze Severity -> Branch)
 * WORKFLOW 2: Critical Response (Check Severity -> Request Approval -> Allocate -> Trigger Ambulance/Rescue/Drone)
 * WORKFLOW 3: Drone Deployment (Check Drones -> Select Available -> Create Mission -> Update Status)
 * WORKFLOW 4: Emergency Alert (Generate Alert -> Approval -> Simulate Alert -> Log)
 */
export async function executeAutomationWorkflow(
  payload: AutomationPayload,
  action?: string
): Promise<WorkflowExecutionResult> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();
  const hasWebhookUrl = Boolean(webhookUrl && webhookUrl.length > 0);
  const now = new Date().toISOString();

  // If webhook URL is configured, attempt live n8n orchestration first
  if (hasWebhookUrl && webhookUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Resqnet-Source": "RESQNET_COMMAND_CENTER",
        },
        body: JSON.stringify({
          ...payload,
          action: action || payload.action || "TRIGGER_FULL_ORCHESTRATION",
          timestamp: now,
          simulationMode: payload.simulationMode ?? true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const n8nData = await response.json().catch(() => ({}));
        
        // If n8n returned structured state, merge it; otherwise formulate from n8n response
        const liveState = formatStateFromN8n(n8nData, payload, action, now);
        return {
          success: true,
          mode: "N8N_LIVE",
          webhookUrlConfigured: true,
          webhookUrl,
          n8nResponse: n8nData,
          state: liveState,
        };
      } else {
        console.warn(
          `[RESQNET n8n Layer] n8n returned HTTP ${response.status}. Engaging local simulation fallback.`
        );
      }
    } catch (err: any) {
      console.info(
        `[RESQNET n8n Layer] Live n8n webhook unreachable (${err?.message || "timeout"}). Engaging local simulation fallback.`
      );
    }
  }

  // Local Simulation Fallback (Clean Abstraction)
  const simState = simulateWorkflowsLocally(payload, action, hasWebhookUrl, now);
  return {
    success: true,
    mode: "SIMULATION",
    webhookUrlConfigured: hasWebhookUrl,
    webhookUrl: webhookUrl || undefined,
    state: simState,
  };
}

/**
 * Formats state when receiving response from live n8n webhook
 */
function formatStateFromN8n(
  n8nData: any,
  payload: AutomationPayload,
  action: string | undefined,
  timestamp: string
): WorkflowOrchestrationState {
  const isApproved =
    action === "APPROVE_CRITICAL_RESPONSE" ||
    payload.responsePlan.humanApproved ||
    n8nData.criticalResponse === "APPROVED";

  const isAlertApproved =
    action === "APPROVE_EMERGENCY_ALERT" ||
    n8nData.emergencyAlert === "SIMULATED" ||
    n8nData.emergencyAlert === "PUBLISHED";

  const isDroneDispatched =
    action === "DEPLOY_DRONE" ||
    n8nData.droneWorkflow === "IN_FLIGHT";

  return {
    orchestrator: "RUNNING",
    incidentIntake: "COMPLETED",
    criticalResponse: isApproved ? "APPROVED" : "WAITING FOR APPROVAL",
    droneWorkflow: isDroneDispatched ? "IN_FLIGHT" : "READY",
    emergencyAlert: isAlertApproved ? "SIMULATED" : "PENDING APPROVAL",
    isSimulationMode: false,
    n8nWebhookConfigured: true,
    lastTriggeredAt: timestamp,
    activeExecutionId: n8nData.executionId || `n8n-live-${Date.now()}`,
    logs: [
      {
        id: `log-live-1-${Date.now()}`,
        timestamp,
        workflow: "Orchestrator",
        status: "SUCCESS",
        message: "Payload dispatched to live n8n orchestration webhook.",
        simulatedTarget: process.env.N8N_WEBHOOK_URL,
      },
      ...(Array.isArray(n8nData.logs) ? n8nData.logs : []),
    ],
  };
}

/**
 * High-fidelity deterministic simulation of all 4 workflows
 * Ensures RESQNET works 100% out-of-the-box without requiring an active n8n instance
 */
function simulateWorkflowsLocally(
  payload: AutomationPayload,
  action: string | undefined,
  hasWebhookUrl: boolean,
  timestamp: string
): WorkflowOrchestrationState {
  const { incident, responsePlan, resources } = payload;
  const isCritical = incident.severity === "CRITICAL" || incident.severity === "HIGH";

  const currentAction = action || payload.action || "TRIGGER_FULL_ORCHESTRATION";

  // Determine sub-states based on action & incident
  let criticalStatus: CriticalResponseStatus = "WAITING FOR APPROVAL";
  let droneStatus: DroneWorkflowStatus = "READY";
  let alertStatus: EmergencyAlertStatus = "PENDING APPROVAL";

  if (currentAction === "APPROVE_CRITICAL_RESPONSE" || responsePlan.humanApproved) {
    criticalStatus = "APPROVED";
  }

  if (currentAction === "DEPLOY_DRONE") {
    droneStatus = "IN_FLIGHT";
  } else if (responsePlan.humanApproved) {
    droneStatus = "MISSION_CREATED";
  }

  if (currentAction === "APPROVE_EMERGENCY_ALERT") {
    alertStatus = "SIMULATED";
  }

  const logs: WorkflowLogItem[] = [];

  // LOG 1: Intake
  logs.push({
    id: `log-intake-${Date.now()}-1`,
    timestamp,
    workflow: "Incident Intake",
    status: "SUCCESS",
    stepName: "Validate Incident",
    message: `Incident ${incident.code} validated: severity=${incident.severity}, primary sector=${incident.primaryLocation.name}.`,
  });

  logs.push({
    id: `log-intake-${Date.now()}-2`,
    timestamp,
    workflow: "Incident Intake",
    status: "SUCCESS",
    stepName: "Analyze Severity & Branch",
    message: isCritical
      ? `Severity classified as ${incident.severity} -> Branched to Critical Response Workflow.`
      : `Severity classified as ${incident.severity} -> Branched to Standard Support Workflow.`,
  });

  // LOG 2: Critical Response
  if (isCritical) {
    if (criticalStatus === "APPROVED") {
      logs.push({
        id: `log-crit-${Date.now()}-1`,
        timestamp,
        workflow: "Critical Response",
        status: "SUCCESS",
        stepName: "Human Approval Received",
        message: "Commander clearance verified. Executing automated multi-agency dispatch workflows.",
      });

      logs.push({
        id: `log-crit-${Date.now()}-2`,
        timestamp,
        workflow: "Critical Response",
        status: "MOCK",
        stepName: "Trigger Ambulance Workflow",
        message: `MOCK DISPATCH: Sent dispatch order to 108 Emergency Medical CAD (${resources?.ambulances?.length || 2} units allocated). Real sirens/vehicles are not connected (Prototype mode).`,
        simulatedTarget: "Mock EMS Service Bus",
      });

      logs.push({
        id: `log-crit-${Date.now()}-3`,
        timestamp,
        workflow: "Critical Response",
        status: "MOCK",
        stepName: "Trigger Rescue Team Workflow",
        message: `MOCK DISPATCH: NDRF/SDRF Water Inundation Strike Teams notified (${resources?.rescueTeams?.length || 2} boats mobilized).`,
        simulatedTarget: "Mock Disaster Response CAD",
      });
    } else {
      logs.push({
        id: `log-crit-${Date.now()}-4`,
        timestamp,
        workflow: "Critical Response",
        status: "PENDING",
        stepName: "Request Human Approval",
        message: "Human authorization safeguard triggered: Awaiting EOC Commander signature before resource mobilization.",
      });
    }
  }

  // LOG 3: Drone Deployment
  if (droneStatus === "IN_FLIGHT") {
    logs.push({
      id: `log-drone-${Date.now()}-1`,
      timestamp,
      workflow: "Drone Deployment",
      status: "SUCCESS",
      stepName: "Mission Active",
      message: "UAV-101 (Echo-1) airborne on autonomous thermal search vector across Sector A. Altitude: 45m.",
    });
  } else if (droneStatus === "MISSION_CREATED") {
    logs.push({
      id: `log-drone-${Date.now()}-2`,
      timestamp,
      workflow: "Drone Deployment",
      status: "SUCCESS",
      stepName: "Create Mission",
      message: "Waypoint corridor compiled: Flight plan uploaded to UAV Fleet controller. Ready for takeoff.",
    });
  } else {
    logs.push({
      id: `log-drone-${Date.now()}-3`,
      timestamp,
      workflow: "Drone Deployment",
      status: "INFO",
      stepName: "Check Available Drones",
      message: `${resources?.drones?.length || 3} UAVs ready on pad with full telemetry telemetry link.`,
    });
  }

  // LOG 4: Emergency Alert
  if (alertStatus === "SIMULATED") {
    logs.push({
      id: `log-alert-${Date.now()}-1`,
      timestamp,
      workflow: "Emergency Alert",
      status: "MOCK",
      stepName: "Publish/Simulate Alert",
      message: `SIMULATED BROADCAST: Common Alerting Protocol (CAP) payload dispatched to simulated cell tower siren network.`,
      simulatedTarget: "Mock Public Broadcast Network",
    });
  } else {
    logs.push({
      id: `log-alert-${Date.now()}-2`,
      timestamp,
      workflow: "Emergency Alert",
      status: "PENDING",
      stepName: "Human Approval",
      message: "Emergency Cell Broadcast text generated. Pending tactical supervisor transmission approval.",
    });
  }

  return {
    orchestrator: hasWebhookUrl ? "RUNNING" : "SIMULATION_MODE",
    incidentIntake: "COMPLETED",
    criticalResponse: criticalStatus,
    droneWorkflow: droneStatus,
    emergencyAlert: alertStatus,
    isSimulationMode: !hasWebhookUrl,
    n8nWebhookConfigured: hasWebhookUrl,
    lastTriggeredAt: timestamp,
    activeExecutionId: `sim-exec-${Date.now().toString(36)}`,
    logs,
  };
}
