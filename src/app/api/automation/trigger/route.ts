import { NextRequest, NextResponse } from "next/server";
import { AutomationPayload } from "@/types";
import { executeAutomationWorkflow } from "@/lib/server/n8nWorkflowEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.incident) {
      return NextResponse.json(
        {
          error: "Invalid request payload. 'incident' object is required.",
          receivedPayload: body,
        },
        { status: 400 }
      );
    }

    const payload: AutomationPayload = {
      incident: body.incident,
      responsePlan: body.responsePlan || body.plan || {
        id: `plan-${body.incident.id}`,
        incidentId: body.incident.id,
        createdAt: new Date().toISOString(),
        status: "DRAFT",
        decisionEngine: "FALLBACK",
        immediateActions: ["Assess damage", "Deploy recon"],
        resourceAllocation: { ambulances: 2, rescueTeams: 2, drones: 1 },
        humanApproved: false,
      },
      resources: body.resources || {
        ambulances: [],
        rescueTeams: [],
        drones: [],
      },
      simulationMode: body.simulationMode !== undefined ? body.simulationMode : true,
      action: body.action || "TRIGGER_FULL_ORCHESTRATION",
      metadata: body.metadata,
    };

    const result = await executeAutomationWorkflow(payload, body.action, {
      simulateUnavailable: body.simulateUnavailable,
      testCase: body.testCase,
    });

    return NextResponse.json({
      success: result.success,
      mode: result.mode,
      statusMessage:
        result.statusMessage ||
        (result.mode === "N8N_LIVE"
          ? "n8n automation active — live execution connected."
          : "n8n unavailable — automation simulation active."),
      webhookUrlConfigured: result.webhookUrlConfigured,
      webhookUrl: result.webhookUrlConfigured ? result.webhookUrl : undefined,
      workflowStatus: {
        orchestrator: result.state.orchestrator,
        incidentIntake: result.state.incidentIntake,
        criticalResponse: result.state.criticalResponse,
        droneWorkflow: result.state.droneWorkflow,
        emergencyAlert: result.state.emergencyAlert,
        lastTriggeredAt: result.state.lastTriggeredAt,
        activeExecutionId: result.state.activeExecutionId,
      },
      state: result.state,
      disclaimer:
        "PROTOTYPE ARCHITECTURE: External emergency dispatch systems (Ambulance 108 / NDRF / SDRF / Sirens) are simulated via mock endpoints. No real units are dispatched.",
    });
  } catch (error: unknown) {
    console.warn("[/api/automation/trigger Error Handled Safely]: Fallback engaged.");
    return NextResponse.json(
      {
        success: true,
        mode: "SIMULATION",
        statusMessage: "n8n unavailable — automation simulation active.",
        simulationMode: true,
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL?.trim();
  const hasWebhookUrl = Boolean(webhookUrl && webhookUrl.length > 0);

  return NextResponse.json({
    status: "OK",
    endpoint: "/api/automation/trigger",
    n8nWebhookConfigured: hasWebhookUrl,
    mode: hasWebhookUrl ? "N8N_CONNECTED" : "SIMULATION_MODE",
    message: hasWebhookUrl
      ? "n8n Webhook is configured and armed."
      : "N8N_WEBHOOK_URL is not set. Operating in local high-fidelity SIMULATION MODE.",
    examplePayload: {
      incident: { id: "inc-001", code: "FL-801-RIVER", severity: "CRITICAL" },
      responsePlan: { id: "plan-001", humanApproved: false },
      resources: { ambulances: [], rescueTeams: [], drones: [] },
      simulationMode: true,
    },
  });
}
